function resizeImage(file) {
    var img = document.getElementById("image");
    let cvs = document.getElementById("canvas");
    var ctx = document.getElementById('canvas').getContext('2d');

    img.src = file.dataURL;

    let src = cv.imread("image");
    let dst1 = new cv.Mat();
    let dst2 = new cv.Mat();
    // You can try more different parameters

    let width = src.size().width;
    let height = src.size().height;

    if (width >= height) {
        // Resize according to width
        let temp_height = height * 224 / width;
        let dsize = new cv.Size(224, temp_height);
        cv.resize(src, dst1, dsize, 0, 0, cv.INTER_AREA);

        // Center
        let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, 0, 0, 1, (224 - temp_height) / 2]);
        dsize = new cv.Size(224, 224);
        cv.warpAffine(dst1, dst2, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

    } else {
        // Resize according to height
        let temp_width = width * 224 / height;
        let dsize = new cv.Size(temp_width, 224);
        cv.resize(src, dst1, dsize, 0, 0, cv.INTER_AREA);

        // Center
        let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, (224 - temp_width) / 2, 0, 1, 0]);
        dsize = new cv.Size(224, 224);
        cv.warpAffine(dst1, dst2, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

    }

    cv.imshow("canvas", dst2);
    src.delete();
    dst1.delete();
    dst2.delete();

    return cvs.toDataURL();
}


function upload_to_storage(file_list) {
    if (!imgListExists()) {
        imgList = []
    } else {
        imgList = JSON.parse(localStorage.getItem('imgList'));
    }
    for (var i = 0; i < file_list.length; i++) {
        resizedDataURL = resizeImage(file_list[i])
        imgList.push([file_list[i].name, resizedDataURL, 0])
    }
    localStorage.setItem('imgList', JSON.stringify(imgList));
};

function clearImageQueue() {
    if (imageQueue != null) {
        while (imageQueue.firstChild) {
            imageQueue.removeChild(imageQueue.firstChild);
        }
    }
}

function clearDropZone() {
    myDropzone = Dropzone.forElement("#my-awesome-dropzone");
    myDropzone.removeAllFiles();
}

function showImageQueue() {
    if (!imgListExists()) {
        alert("Upload Images Please!")
    } else {
        imgList = JSON.parse(localStorage.getItem('imgList'));
    }
    imageQueue = document.getElementById("image-queue");
    // Remove existing images
    clearImageQueue();
    let imgName, imgData;
    for (var i = 0; i < imgList.length; i++) {
        imgName = imgList[i][0];
        imgData = imgList[i][1];
        var elem = document.createElement("img");
        elem.setAttribute("src", imgData);
        elem.setAttribute("height", "80");
        elem.setAttribute("width", "80");
        elem.setAttribute("alt", imgName);
        elem.setAttribute("id", i);
        elem.setAttribute("onclick", "toAnnotator(this)");
        elem.setAttribute("class", "img-thumbnail")
        imageQueue.appendChild(elem);
    }
}

function toAnnotator(img) {
    let imgName = img.alt;
    let imgData = img.src;
    let elementId = img.id;

    // let temp_image = new Image;
    // temp_image.src = imgData;

    annotator.readImage(elementId);
    clearInterval(annotator.animation)
    annotator.animate();

}

function clearLocalStorage() {
    localStorage.clear();
    console.log(localStorage);
    imageQueue = document.getElementById("image-queue");
    // Remove existing images
    while (imageQueue.firstChild) {
        imageQueue.removeChild(imageQueue.firstChild);
    }
}


function submit() {
    myDropzone = Dropzone.forElement("#my-awesome-dropzone");
    accepted_list = myDropzone.getAcceptedFiles();
    upload_to_storage(accepted_list);
    showImageQueue();
    clearDropZone();
}


function imgListExists() {
    if (localStorage.getItem('imgList') == null) {
        return false;
    } else {
        return true;
    }
}

