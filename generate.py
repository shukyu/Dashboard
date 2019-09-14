# -*- coding: utf-8 -*-

import os
import io
import time
import japanize_matplotlib
import pathlib
import yaml

import numpy as np
import pandas as pd
import seaborn as sns
import datetime as dt
import matplotlib.pyplot as plt
from matplotlib.patches import Arc

from yaml import Loader

# Creates a dataframe with gps and event data.
class MatchData:
    """
    The MatchData object can is meant to be used as an API to access a certain matches data.
    ...

    Attributes
    ----------
    match_name : str
        match name

    gps_path : str
        path to gps data

    event_path : str
        path to event data

    outpath : str
        'docs/theme/graphs/'+match_name+'/'

    yaml : dict
        the content in the markdown file
    gps_data : dict
        raw gps data
    event_data : dict
        raw event data
    data : tuple
        (gps_data, event_data)
    start : datetime.time
        start time of gps
    end : datetime.time
        end time of gps

    """

    def __init__(self, match_name):
        self.match_name = match_name
        self.gps_path = 'data/{0}/gps'.format(match_name)
        self.event_path = 'data/{0}/splyza'.format(match_name)
        self.init_yaml()
        self.outpath = 'docs/theme/graphs/'+match_name+'/'
        pathlib.Path(self.outpath).mkdir(parents=True, exist_ok=True)

        self.gps_data = self.get_gps_data()
        self.event_data = self.get_event_data('full')
        self.data = self.generate_data()

    def init_yaml(self):
        """Converts .md to yaml

        Parameters
        ----------
        None

        Raises
        ------
        None
        """
        f = open("content/"+self.match_name+'.md',"r")
        text = f.read().split('---')[0]
        self.yaml = yaml.load(text, Loader=Loader)


    def get_gps_data(self):
        """Converts .md to yaml

        Parameters
        ----------
        None

        Raises
        ------
        None
        """

        path = self.gps_path
        start = dt.time.min
        end = dt.time.max
        d = {}

        for f in os.listdir(path):
            if f.endswith('.csv'):

                # 個人のメタデータの取得
                _ = pd.read_csv(open('{0}/{1}'.format(path, f),'rU'), encoding='utf-8', engine='c', nrows=5, header=None, index_col=0).T
                player_name = _['Player'].iloc[0][2:]
                session = _['Session'].iloc[0][2:]
                _start = dt.time(*time.strptime(_['Start'].iloc[0], "%M:%S.%f")[3:6])
                _end = dt.time(*time.strptime(_['End'].iloc[0], '%M:%S.%f')[3:6])

                # start=最小の_start, end=最大の_end
                start = max(start, _start)
                end = max(end, _end)

                # 個人のGPSデータの取得
                _df = pd.read_csv('{0}/{1}'.format(path, f), skiprows=7,
                                  usecols=[
                                      'Time',
                                      'Speed (km/h)',
                                      'Latitude',
                                      'Longitude',
                                      'Acceleration (m/s/s)',
                                      'Distance (m)',
                                      'Bodyload'
                                  ])
                d[player_name] = _df
        self.start = start
        self.end = end
        return d

    def get_event_data(self, mode):
        """Returns DataFrames of event data, Indexed by seconds

        Parameters
        ----------
        - None

        Raises
        ------
        - None

        Returns
        -------

        - Dict
            - "h1": data for 1st half
            - "h2": data for 2nd half
            - "full": concatenated h1 and h2
        """

        path = self.event_path
        flist = os.listdir(path)
        data = []
        for f in os.listdir(path):
            if f.endswith('.csv'):
                data.append(pd.read_csv('{0}/{1}'.format(path, f), index_col=0))

        for i, d in enumerate(data):
            data[i].index = data[i].index.map(lambda x: dt.time(*time.strptime(x[4:12], '%M:%S:%f')[3:6]))

        def f(t, offset=None):
            seconds = (t.hour * 60 + t.minute) * 60 + t.second
            if offset is not None:
                seconds += offset
            return seconds

        df1 = pd.DataFrame(data[0])
        df2 = pd.DataFrame(data[1])

        df1.index = df1.index.map(lambda x: f(x))
        df2.index = df2.index.map(lambda x: f(x,df1.index[-1]))
        df =  df1.append(df2)

        d = {'h1':df1,'h2':df2, 'full':df}
        return d[mode]

    def generate_data(self):
        """Converts .md to yaml

        Parameters
        ----------
        None

        Raises
        ------
        None
        """

        gps_data = self.gps_data
        event_data = self.event_data
        return gps_data, event_data

    def get_count(self, attr):
        try:
            d = pd.concat((self.event_data('h1'),self.event_data('h2')), sort=False)
            value = d.apply(pd.value_counts,axis=0).apply(lambda x: x.max(), axis=1)[attr]
        except:
            value = 0
        return value

    def stats_hbar(self, meta=None, show=False):
        """
        Sample data to give to this is:
        meta = {
            'def':{
                'events' : ['シュートブロック', 'クリア', 'インターセプト', 'ブロック'],
                '回数'   : [79, 60, 45,85],
            }
        }
        """
        # data generating function
        def f(l):
            counts = [int(self.get_count(attr)) for attr in l]
            dic = {
                'events':l,
                '_':[max(counts)]*len(counts),
                '回数':counts,
            }
            return dic
        if meta==None:
            meta = {
                'atk':f(['パス', '枠内シュート', 'ドリブル', 'クロス', '枠外シュート']),
                'def':f(['シュートブロック', 'クリア', 'インターセプト', 'ブロック']),
                'set':f(['スローイン', 'CK', 'FK', 'PK']),
                'foul':f(['ファール', 'オフサイド']),
            }

        text_left = 0 # Used for formatting text
        color = ["dark", "muted", "pastel"]
        for chart_name, chart_data in meta.items():
            f, ax = plt.subplots(figsize=(6, 10))

            i=0
            for attr_name, attr_data in chart_data.items():
                if attr_name == 'events':
                    continue
                else:
                    sns.set_color_codes(color[i])
                    sns.barplot(x=attr_name, y="events", data=chart_data, label=attr_name, color="b")
                    text_left = max(text_left, max(attr_data))
                    i+=1

            i=0
            text_left = text_left/20
            for event, kaisu in zip(chart_data['events'],chart_data['回数']):
                ax.text(text_left,i-0.15, event, fontsize=35, color='white')
                ax.text(text_left,i+0.15, '{0}'.format(kaisu), fontsize=35, color='red')
                i+=1

            # Add a legend and informative axis label
            ax.legend(ncol=2, loc="lower right", frameon=True)
            plt.axis('off')
            plt.title(chart_name, fontsize=40)
            sns.despine(left=True, bottom=True)
            if show!=True:
                plt.savefig("{0}hbar_{1}.png".format(self.outpath, chart_name), transparent=True,bbox_inches='tight')
                plt.close()
            else:
                plt.show()

    def rank_table(self, show=False):
        """Converts .md to yaml

        Parameters
        ----------
        None

        Raises
        ------
        None
        """

        d = self.get_event_data('full')
        cdict = {
            '攻撃':'crimson',
            '守備':'#40466e',
        }
        for e in ['攻撃', '守備']:
            df = pd.DataFrame(d.groupby('選手名')[e].value_counts())
            df.columns=['count']
            df = df.swaplevel(1, 0, axis=0)
            df = df.reset_index()
            groups = df.groupby(e)
            for name, group in groups:
                group = group.sort_values('count', ascending=False)
                self.render_mpl_table(group[['選手名','count']], header_color=cdict[e])
                plt.title(name)
                if show!=True:
                    plt.savefig("{0}/{1}.png".format(self.outpath, name), transparent=True,bbox_inches='tight')
                    plt.close()
                else:
                    plt.show()

    def plot_pitch(self, height=68, width=105, xos=0, yofs=0):
        """Converts .md to yaml

        Parameters
        ----------
        None

        Raises
        ------
        None
        """

        hscaler = 68 / height
        wscaler = 105 / width
        # Create figure
        fig = plt.figure(facecolor='green',figsize=(21, 15))
        ax = fig.add_subplot(1, 1, 1)

        ax.set_xlim([0,width])
        ax.set_ylim([0,height])

        color1 = 'white'
        center = (xos + width / 2, yofs + height / 2)

        # Pitch Outline & Centre Line
        plt.plot([xos, xos], [yofs, yofs + height], color=color1)
        plt.plot([xos, xos + width], [yofs + height, yofs + height], color=color1)
        plt.plot([xos + width, xos + width], [yofs + height, yofs], color=color1)
        plt.plot([xos + width, xos], [yofs, yofs], color=color1)
        plt.plot([xos + width / 2, xos + width / 2], [yofs, yofs + height], color=color1)

        # Left Penalty Area
        plt.plot([xos + 16.5 / wscaler, xos + 16.5 / wscaler],
                 [yofs + height / 2 + 20.15 / hscaler, yofs + height / 2 - 20.15 / hscaler], color=color1)
        plt.plot([xos, xos + 16.5 / wscaler], [yofs + height / 2 + 20.15 / hscaler, yofs + height / 2 + 20.15 / hscaler],
                 color=color1)
        plt.plot([xos + 16.5 / wscaler, xos], [yofs + height / 2 - 20.15 / hscaler, yofs + height / 2 - 20.15 / hscaler],
                 color=color1)

        # Right Penalty Area
        plt.plot([xos + width - 16.5 / wscaler, xos + width - 16.5 / wscaler],
                 [yofs + height / 2 + 20.15 / hscaler, yofs + height / 2 - 20.15 / hscaler], color=color1)
        plt.plot([xos + width, xos + width - 16.5 / wscaler],
                 [yofs + height / 2 + 20.15 / hscaler, yofs + height / 2 + 20.15 / hscaler], color=color1)
        plt.plot([xos + width - 16.5 / wscaler, xos + width],
                 [yofs + height / 2 - 20.15 / hscaler, yofs + height / 2 - 20.15 / hscaler], color=color1)

        # Left 6-yard Box
        plt.plot([xos + 5.5 / wscaler, xos + 5.5 / wscaler],
                 [yofs + height / 2 + (7.32 / 2 + 5.5) / hscaler, yofs + height / 2 - (7.32 / 2 + 5.5) / hscaler],
                 color=color1)
        plt.plot([xos, xos + 5.5 / wscaler],
                 [yofs + height / 2 + (7.32 / 2 + 5.5) / hscaler, yofs + height / 2 + (7.32 / 2 + 5.5) / hscaler],
                 color=color1)
        plt.plot([xos + 5.5 / wscaler, xos],
                 [yofs + height / 2 - (7.32 / 2 + 5.5) / hscaler, yofs + height / 2 - (7.32 / 2 + 5.5) / hscaler],
                 color=color1)

        # Right 6-yard Box
        plt.plot([xos + width - 5.5 / wscaler, xos + width - 5.5 / wscaler],
                 [yofs + height / 2 + (7.32 / 2 + 5.5) / hscaler, yofs + height / 2 - (7.32 / 2 + 5.5) / hscaler],
                 color=color1)
        plt.plot([xos + width, xos + width - 5.5 / wscaler],
                 [yofs + height / 2 + (7.32 / 2 + 5.5) / hscaler, yofs + height / 2 + (7.32 / 2 + 5.5) / hscaler],
                 color=color1)
        plt.plot([xos + width - 5.5 / wscaler, xos + width],
                 [yofs + height / 2 - (7.32 / 2 + 5.5) / hscaler, yofs + height / 2 - (7.32 / 2 + 5.5) / hscaler],
                 color=color1)

        #     # Prepare Circles
        centre_circle = plt.Circle(center, 9.15 / hscaler, color=color1, fill=False)
        centre_cspot = plt.Circle(center, 0.8 / hscaler, color=color1)
        left_pen_spot = plt.Circle((xos + 11 / wscaler, yofs + height / 2), 0.8 / hscaler, color=color1)
        right_pen_spot = plt.Circle((xos + width - 11 / wscaler, yofs + height / 2), 0.8 / hscaler, color=color1)

        #     # Draw Circles
        ax.add_patch(centre_circle)
        ax.add_patch(centre_cspot)
        ax.add_patch(left_pen_spot)
        ax.add_patch(right_pen_spot)

        #     # Prepare Arcs
        leftArc = Arc((xos + 11 / wscaler, yofs + height / 2), height=18.3 / hscaler, width=18.3 / wscaler, angle=0,
                      theta1=310, theta2=50, color=color1)
        rightArc = Arc((xos + width - 11 / wscaler, yofs + height / 2), height=18.3 / hscaler, width=18.3 / wscaler,
                       angle=0, theta1=130, theta2=230, color=color1)

        #     # Draw Arcs
        ax.add_patch(leftArc)
        ax.add_patch(rightArc)

        # Tidy Axes
        plt.axis('off')
        plt.xlim(0, width)
        plt.ylim(0, height)
        plt.autoscale(False)
        plt.axis('equal')

        # Display Pitch
        return fig, ax

    def render_mpl_table(self, data, col_width=3.0, row_height=0.625, font_size=14,
                         header_color='#40466e', row_colors=['#f1f1f2', 'w'], edge_color='w',
                         bbox=[0, 0, 1, 1], header_columns=0,
                         ax=None, **kwargs):
        """Converts .md to yaml

        Parameters
        ----------
        None

        Raises
        ------
        None
        """

        if ax is None:
            size = (np.array(data.shape[::-1]) + np.array([0, 1])) * np.array([col_width, row_height])
            fig, ax = plt.subplots(figsize=size)
            ax.axis('off')

        mpl_table = ax.table(cellText=data.values, bbox=bbox, colLabels=data.columns, **kwargs)

        mpl_table.auto_set_font_size(False)
        mpl_table.set_fontsize(font_size)

        for k, cell in  mpl_table._cells.items():
            cell.set_edgecolor(edge_color)
            if k[0] == 0 or k[1] < header_columns:
                cell.set_text_props(weight='bold', color='w')
                cell.set_facecolor(header_color)
            else:
                cell.set_facecolor(row_colors[k[0]%len(row_colors) ])
        return ax

    def average_positions(self):
        d = self.get_gps_data()
        dic = {}
        for player, df in d.items():
            dic[player] = (df['X (m)'].mean(), df['Y (m)'].mean())
        return dic

    def possession_time(self, start, end):
        # ポゼッションに関するデータだけ取り出す
        df = self.get_event_data('full')
        s = df["default"]

        ## default列にある種類のラベルをリストにする
        value_list = s.unique().tolist()

        ## 開始・終了とチーム名情報を取り出す
        possession_series = s.replace([item for item in value_list if item not in ['ポゼッションスタート','ポゼッションエンド']], np.NaN)
        teamname_series = s.replace([item for item in value_list if item not in ['筑波大学','相手チーム'] ])

        possession_series.name = 'possession'
        teamname_series.name = 'team'

        possession_df = pd.concat((possession_series, teamname_series), axis=1).dropna()
        possession_df = possession_df.loc[start:end]

        out = []
        for team in ['筑波大学', '相手チーム']:
            _s = possession_df['team']
            times = _s[_s==team].index.values

            if len(times) % 2 == 0:
                out.append(np.diff(times)[::2].sum())
            else:
                times = np.append(times, end)
                out.append(np.diff(times)[::2].sum())

        return out[0], out[1]

    def possession_graph(self, times=[(0,15),(15,30),(30,45),(45,60),(60,75),(75,90)]):
        y1 = []
        y2 = []
        x = []
        for start, end in times:
            _y1, _y2 = self.possession_time(start*60, end*60)
            total = _y1+_y2
            y1.append(_y1/total*100)
            y2.append(_y2/total*100)
            x.append("{0}~{1}".format(start,end))

        plt.figure(figsize=(10,5))
        # stack bars
        plt.bar(x, y1, label="Tsukuba", color = "blue")
        plt.bar(x, y2 ,bottom=y1,label= "Opponent",color ="red")


        # add text annotation corresponding to the percentage of each data.
        for xpos, ypos, yval in zip(x, y1, y1):
            plt.text(xpos, ypos/2, "%.1f"%yval, ha="center", va="center",fontsize =20,color="white")
        for xpos, ypos, yval in zip(x, y1, y2):
            plt.text(xpos, ypos+yval/2, "%.1f"%yval, ha="center", va="center",fontsize =20,color="white")
        plt.ylim(0,110)
        plt.title("Possession vs Opponent(%)")
        plt.legend(bbox_to_anchor=(1.01,0.5), loc='center left')
        plt.savefig("{0}/{1}.png".format(self.outpath, 'possesion_graph'))
        plt.close()


def main():
    for match in os.listdir('data/'):
        if match[0] == ".":
            continue
        print(match[0])
        match_data = MatchData(match)
        match_data.stats_hbar()
        match_data.rank_table()
        match_data.possession_graph()
