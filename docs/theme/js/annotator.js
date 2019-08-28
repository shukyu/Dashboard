// Please keep in mind that I used annotator as a global variable
let annotator;

// Initialize an annotator object when the window loads (There will only be one).
function main() {
    annotator = new Annotator;
    showImageQueue();
}
window.onload = main;

class Annotator {
    constructor() {
        // The canvas used for annotation
        this.cvs = document.getElementById("annotator");
        this.ctx = this.cvs.getContext("2d");

        // Define a color map to identify and annotate each finger correctly
        this.cmap = {
            Thumb: "#ffbb33",
            Index: "#00C851",
            Middle: "#33b5e5",
            Ring: "#4285F4",
            Pinky: "#aa66cc",
            Palm: "#CC0000",
        }

        // Initialize a blank coordinate table
        // ----Coordinate Table From here ----
        this.table = document.getElementById("coordinate-table");
        let row = this.table.insertRow();
        row.innerHTML = '<tr>';
        ['', 'Thumb', 'Index', 'Middle', 'Ring', 'Pinky', 'Palm'].forEach(finger => {
            row.innerHTML += '<td style="color:' + this.cmap[finger] + '">' + finger + '</td>';
        });


        ['root', 'mid', 'tip'].forEach(level => {
            let row = this.table.insertRow();
            row.innerHTML = '<tr><th>' + level + '</th>';
            ['thumb', 'index', 'middle', 'ring', 'pinky', 'palm'].forEach(finger => {
                row.innerHTML += '<td id="' + finger + '-' + level + '"></td>';
            });
            row.innerHTML += '</tr>'
        });
        // ----Coordinate Table To here ----



        // The canvas is updated continuously using the animate function defined below
        // It is useful to be able to access the function outside when we want to stop/start the updateing
        this.animation;

        this.elementId = 0;
        this.currentHand;
        this.imageData;
        this.handData;

        //
        let me = this;
        window.addEventListener("keyup", function (e) {
            var key = e.keyCode ? e.keyCode : e.which;
            // SAVE
            if (key == 83 || key == 115) {
                me.readImage(me.elementId);
                me.save(me.elementId);
            }
            // Load Next
            else if (key == 78 || key == 110) {
                let nextElementId = parseInt(me.elementId) + 1;
                let imageQueueLength = document.getElementById("image-queue").getElementsByTagName('img').length;
                if (me.elementId >= imageQueueLength - 1 || nextElementId == null) {
                    nextElementId = 0;
                }
                me.readImage(nextElementId);
                clearInterval(me.animation);
                me.animate();
            }
        });

    }

    toggleViz() {
        if (document.getElementById('showViz').checked) {
            document.getElementById("visualizer").style.display = "inline"
            document.getElementById("visualizerParent").style.display = "block"
        } else {
            document.getElementById("visualizer").style.display = "None"
            document.getElementById("visualizerParent").style.display = "None"

        }

    }

    flipX() {
        let key_points = this.currentHand.key_points;
        for (var i = 0; i < key_points.length; i++) {
            key_points[i].x = 224 - key_points[i].x;
        }
        this.currentHand.loadCoordinates(this.currentHand.getJson());
    }

    download(content, fileName, contentType) {
        var a = document.createElement("a");
        if (contentType == 'dataURL') {
            a.href = content
        } else {
            var file = new Blob([content], {
                type: contentType
            });
            a.href = URL.createObjectURL(file);
        }
        a.download = fileName;
        a.click();
    }

    save(elementId) {
        let imgList = JSON.parse(localStorage.getItem('imgList'));
        let fname = imgList[elementId][0];

        if (document.getElementById('saveJson').checked) {
            let coordinates = imgList[elementId][2]
            this.download(JSON.stringify(coordinates), fname.split('.')[0] + '.json', 'text/plain')
        }
        if (document.getElementById('saveImage').checked) {
            let image = imgList[elementId][1];
            this.download(image, fname.split('.')[0] + '.png', 'dataURL')
        }
        if (document.getElementById('saveAnnoImage').checked) {
            let canvas = this.cvs.toDataURL();
            this.download(canvas, fname.split('.')[0] + '_annotated.png', 'dataURL')
        }


    }

    readImage(elementId) {
        let imgList, coordinates;

        if (this.currentHand == null) {
            this.elementId = elementId;

            imgList = JSON.parse(localStorage.getItem('imgList'));
            coordinates = imgList[this.elementId][2];
            this.currentHand = new Hand(coordinates);
        } else {
            this.saveCoordinates();
            imgList = JSON.parse(localStorage.getItem('imgList'));
            //Change Element Id after saving
            this.elementId = elementId;
            coordinates = imgList[this.elementId][2];
            this.currentHand.loadCoordinates(coordinates);
        }
        let imgName = imgList[this.elementId][0];
        let imgData = imgList[this.elementId][1];

        let temp_image = new Image;
        temp_image.src = imgData;

        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.0)";
        this.ctx.fillRect(0, 0, 224, 224);
        this.ctx.drawImage(temp_image, 0, 0, 224, 224);
        this.imageData = this.ctx.getImageData(0, 0, this.cvs.width, this.cvs.height);
    }

    saveCoordinates() {
        let json_coordinates = this.currentHand.getJson();
        imgList = JSON.parse(localStorage.getItem('imgList'));
        imgList[this.elementId][2] = json_coordinates;
        localStorage.setItem('imgList', JSON.stringify(imgList));
    }

    animate() {
        const me = this;
        this.animation = setInterval(function () {
            let cvs = me.cvs;
            let ctx = me.ctx;
            let key_points = me.currentHand.key_points;
            let imageData = me.imageData;

            ctx.clearRect(0, 0, cvs.width, cvs.height);
            ctx.putImageData(imageData, 0, 0);
            for (var i = 0; i < key_points.length; i++) {
                let key_point = key_points[i];
                key_point.draw();
            }
            me.currentHand.drawFingers();

        }, 10);
    }
    estimateKeyPoints() {
        let vizcvs = document.getElementById("visualizer");
        let vizctx = vizcvs.getContext("2d");

        vizctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
        vizctx.putImageData(this.imageData, 0, 0);

        let src = cv.imread("visualizer");
        let dst = new cv.Mat();

        let k = parseInt(document.getElementById('k-size').value);
        let ksize = new cv.Size(k, k);

        let hue_thresh_min = parseInt(document.getElementById('hue-thresh-min').value);

        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let hull = new cv.Mat();
        let dft = new cv.Mat();


        // 1. Convert image to HSV
        cv.cvtColor(src, dst, cv.COLOR_RGB2HLS, 0);

        // 2. Smooth image
        cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);

        // 4. Filter image
        cv.threshold(dst, dst, hue_thresh_min, 255, cv.THRESH_BINARY_INV);

        // 3. Convert image to Grayscale
        cv.cvtColor(dst, dst, cv.COLOR_HLS2RGB, 0);
        cv.cvtColor(dst, dst, cv.COLOR_RGB2GRAY, 0);

        // 5. Find Contours
        cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_NONE);
        // approximates each contour to convex hull

        // 6. Find largest contour & convex hull
        let largest_area = 0,
            largest_contour_index = 0;
        for (let i = 0; i < contours.size(); i++) // iterate through each contour. 
        {
            let a = cv.contourArea(contours.get(i)); //  Find the area of contour
            if (a > largest_area) {
                largest_area = a;
                largest_contour_index = i; //Store the index of largest contour
            }
        }

        // 7. Calculate contour centroid
        let cnt = contours.get(largest_contour_index);
        let M = cv.moments(cnt, false);
        let cx = M.m10 / M.m00;
        let cy = M.m01 / M.m00;

        // Euclidean Distance function
        function dist(p1, p2) {
            return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
        }

        // 8. sort convex defects closest to contour centroid (7 closet will be used as palm vertices)
        let tmp = new cv.Mat();
        cv.convexHull(cnt, tmp, false, false);
        cv.convexityDefects(cnt, tmp, dft);
        tmp.delete();

        let palm_vertices = []
        for (let i = 0; i < dft.rows; ++i) {
            // See: https://huningxin.github.io/opencv_docs/d8/d1c/tutorial_js_contours_more_functions.html
            // for convexity defect start, end and far points
            let row = dft.intPtr(i)
            let far = row[2];
            let x = cnt.intPtr(far)[0]
            let y = cnt.intPtr(far)[1]
            palm_vertices.push([dist([cx, cy], cnt.intPtr(far)), x, y])
        }
        palm_vertices.sort(function (a, b) {
            return a[0] - b[0];
        });



            // 9. Calculate Palm centroid (=Palm Root) from palm vertices
            let px = 0;
            let py = 0;
            let divider = 0;
            for (let i = 0; i < palm_vertices.length && i < 6; ++i) {
                px += palm_vertices[i][1];
                py += palm_vertices[i][2];
                divider++;
            }
            px /= divider;
            py /= divider;

            // use difference vector as direction of hand
            let dirx = px - cx;
            let diry = py - cy;

            // 10. Group convex hull vertices (Find tip candidates)
            // Also calculate cos between palm centroid and tip candidates (Use smallest 5 as tip)
            //*** Imagine difference vector and palm centroid as origin and converting to polar coordinates

            cv.convexHull(cnt, hull, false, true);
            let tip_candidates = [];
            for (let j = 1; j < hull.size().width * hull.size().height; j++) {
                if (dist(hull.intPtr(j - 1), hull.intPtr(j)) > 20) {
                    let x = hull.intPtr(j)[0] - px;
                    let y = hull.intPtr(j)[1] - py;
                    let cos = (dirx * x + diry * y) / (Math.sqrt(dirx * dirx + diry + diry) * Math.sqrt(x * x + y * y))
                    tip_candidates.push([cos, hull.intPtr(j)[0], hull.intPtr(j)[1]]);
                }
            }
            tip_candidates.sort(function (a, b) {
                return -Math.abs(a[0]) - Math.abs(b[0]);
            });

            // 11. Make Keypoint data for annotator
            // Small to large cos => thumb to pinky (Reverse, depending on toggle)
            let fmap = {
                0: "Thumb",
                1: "Index",
                2: "Middle",
                3: "Ring",
                4: "Pinky",
            }
            let coordinates = [{
                    Thumb: [, ],
                    Index: [, ],
                    Middle: [, ],
                    Ring: [, ],
                    Pinky: [, ],
                    Palm: [, ],
                },
                {
                    Thumb: [, ],
                    Index: [, ],
                    Middle: [, ],
                    Ring: [, ],
                    Pinky: [, ],
                    Palm: [, ],
                },
                {
                    Thumb: [, ],
                    Index: [, ],
                    Middle: [, ],
                    Ring: [, ],
                    Pinky: [, ],
                    Palm: [, ],
                },
            ]
            if (document.getElementById('estimateClockwise').checked) {
                for (let i = 0; i < 5; ++i) {
                    let x = tip_candidates[i][1];
                    let y = tip_candidates[i][2];

                    coordinates[0][fmap[i]] = [Math.floor((2 * px + x) / 3), Math.floor((2 * py + y) / 3)] //root
                    coordinates[1][fmap[i]] = [Math.floor((px + 2 * x) / 3), Math.floor((py + 2 * y) / 3)] //mid
                    coordinates[2][fmap[i]] = [x, y] //tip
                }
            } else if (document.getElementById('estimateCounterClockwise').checked) {
                for (let i = 0; i < 5; ++i) {
                    let x = tip_candidates[i][1];
                    let y = tip_candidates[i][2];

                    coordinates[0][fmap[4-i]] = [Math.floor((2 * px + x) / 3), Math.floor((2 * py + y) / 3)] //root
                    coordinates[1][fmap[4-i]] = [Math.floor((px + 2 * x) / 3), Math.floor((py + 2 * y) / 3)] //mid
                    coordinates[2][fmap[4-i]] = [x, y] //tip
                }
            }
            coordinates[0]["Palm"] = [Math.floor(px), Math.floor(py)];
            this.currentHand.loadCoordinates(coordinates);
        

        // Visualize 
        let colors = ["#FF355E", "#FFFF66", "#66FF66", "#50BFE6", "#FF6EFF"]
        let dst2 = cv.Mat.zeros(dst.cols, dst.rows, cv.CV_8UC3);
        cv.imshow('visualizer', dst2);

        this.currentHand.drawCircle(px, py, colors[1],vizctx, 3);

        for (let j = 0; j < cnt.size().width * cnt.size().height; j++) {
            let x = cnt.intPtr(j)[0]
            let y = cnt.intPtr(j)[1]
            this.currentHand.drawCircle(x, y, colors[2],vizctx, 1)        
        }

        for (let i = 0; i < palm_vertices.length && i < 6; ++i) {
            let x = palm_vertices[i][1];
            let y = palm_vertices[i][2];
            this.currentHand.drawCircle(x, y, colors[0],vizctx, 3)        
        }


        for (let i = 0; i < 5; ++i) {
            let x = tip_candidates[i][1]
            let y = tip_candidates[i][2]
            this.currentHand.drawLine(x, y, px, py, colors[i], vizctx);
        }

        dst.delete();
        dst2.delete();
        hierarchy.delete();
        contours.delete();
        cnt.delete();
        hull.delete();
        dft.delete();
        // return keypoints;
    }

}

class Hand {
    constructor(coordinates) {
        this.cvs = document.getElementById("annotator");
        this.ctx = this.cvs.getContext("2d");
        this.key_points = [];

        this.cmap = {
            Thumb: "#ffbb33",
            Index: "#00C851",
            Middle: "#33b5e5",
            Ring: "#4285F4",
            Pinky: "#aa66cc",
            Palm: "#CC0000",
        }

        this.lmap = {
            0: "root",
            1: "mid",
            2: "tip",
        }
        this.loadCoordinates(coordinates);
    }

    getJson() {
        let coordinates = [{
                Thumb: [, ],
                Index: [, ],
                Middle: [, ],
                Ring: [, ],
                Pinky: [, ],
                Palm: [, ],
            },
            {
                Thumb: [, ],
                Index: [, ],
                Middle: [, ],
                Ring: [, ],
                Pinky: [, ],
                Palm: [, ],
            },
            {
                Thumb: [, ],
                Index: [, ],
                Middle: [, ],
                Ring: [, ],
                Pinky: [, ],
                Palm: [, ],
            },
        ]

        for (var i = 0; i < this.key_points.length; i++) {
            let key_point = this.key_points[i];
            coordinates[key_point.level][key_point.finger] = [key_point.x, key_point.y]
        }

        return coordinates;
    }

    loadJson(){
        var input, file, fr;
    
        if (typeof window.FileReader !== 'function') {
          alert("The file API isn't supported on this browser yet.");
          return;
        }
    
        input = document.getElementById('fileinput');
        if (!input) {
          alert("Um, couldn't find the fileinput element.");
        }
        else if (!input.files) {
          alert("This browser doesn't seem to support the `files` property of file inputs.");
        }
        else if (!input.files[0]) {
          alert("Please select a file before clicking 'Load'");
        }
        else {
          file = input.files[0];
          fr = new FileReader();
          fr.onload = readJson;
          fr.readAsText(file);
        }
        
        let me=this;
        function readJson(e) {
        console.log(e.target.result);
          let coordinates = JSON.parse(e.target.result);
          console.log(coordinates)
          me.loadCoordinates(coordinates);

        }
      }
      
    loadCoordinates(coordinates) {
        if (coordinates == 0) {
            this.coordinates = this.simpleHand();
        } else {
            this.coordinates = coordinates;
        }
        this.key_points = [];

        for (var i = 0; i < this.coordinates.length; i++) {
            let level = this.coordinates[i];
            for (let finger in level) {
                let x = level[finger][0];
                let y = level[finger][1];
                let color = this.cmap[finger];

                document.getElementById(finger.toLowerCase() + '-' + this.lmap[i]).innerHTML = [x, y]
                this.key_points.push(new KeyPoint(this.coordinates, color, finger, i, this.cvs));
            }
        }

    }
    drawFinger(finger) {
        let cvs = this.cvs;
        let ctx = this.ctx;
        let coordinates = this.coordinates;

        let color = this.cmap[finger];
        let tip = coordinates[2][finger]
        let mid = coordinates[1][finger]
        let root = coordinates[0][finger]
        let palm = coordinates[0]['Palm']
        this.drawLine(tip[0], tip[1], mid[0], mid[1], color, ctx);
        this.drawLine(mid[0], mid[1], root[0], root[1], color, ctx);
        this.drawLine(root[0], root[1], palm[0], palm[1], color, ctx);
    }


    drawFingers() {
        this.drawFinger("Thumb");
        this.drawFinger("Index");
        this.drawFinger("Middle");
        this.drawFinger("Ring");
        this.drawFinger("Pinky");
    }

    drawLine(x1, y1, x2, y2, color, ctx) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }

    drawCircle(x, y, color, ctx, r=3) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    simpleHand() {
        let hand_coordinates = [{
                Thumb: [150, 150],
                Index: [125, 150],
                Middle: [100, 150],
                Ring: [62, 150],
                Pinky: [37, 150],
                Palm: [112, 200],
            },
            {
                Thumb: [150, 100],
                Index: [125, 100],
                Middle: [100, 100],
                Ring: [62, 100],
                Pinky: [37, 100],
                Palm: [, ],
            },
            {
                Thumb: [150, 62],
                Index: [125, 50],
                Middle: [100, 50],
                Ring: [62.5, 50],
                Pinky: [37, 75],
                Palm: [, ],
            },
        ]
        return hand_coordinates
    }


}


class KeyPoint {
    constructor(coordinates, color, finger, level, cvs) {
        this.lmap = {
            0: "root",
            1: "mid",
            2: "tip",
        }

        this.coordinates = coordinates;


        this.tableId = finger.toLowerCase() + '-' + this.lmap[level];

        this.level = level;
        this.finger = finger;
        this.color = color;

        this.cvs = cvs
        this.ctx = cvs.getContext("2d");
        this.x = this.coordinates[this.level][this.finger][0];
        this.y = this.coordinates[this.level][this.finger][1];

        const me = this;
        me.isDragged = false;
        this.cvs.addEventListener("mousedown", function (e) {
            if (Math.pow(Math.pow(me.x - e.layerX, 2) + Math.pow(me.y - e.layerY, 2), 1 / 2) <= 10) {
                me.isDragged = true;
            }
            annotator.animate();

        });

        window.addEventListener("mouseup", function () {
            if (me.isDragged) {
                clearInterval(annotator.animation)
                me.isDragged = false;
                annotator.animate();
            }
        });

        window.addEventListener("mousemove", function (e) {
            if (me.isDragged) {
                me.x = e.layerX;
                me.y = e.layerY;

                let new_coordinates = [me.x, me.y];
                me.coordinates[me.level][me.finger] = new_coordinates;
                document.getElementById(me.tableId).innerHTML = new_coordinates;
            }
        });

        this.draw();
    }

    draw() {
        let x = this.x;
        let y = this.y;
        let color = this.color;
        let ctx = this.ctx;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, 5, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

}