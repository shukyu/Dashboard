

```python
import sys
import os
import io
import time
import japanize_matplotlib
import pathlib
import yaml
import importlib

import numpy as np
import pandas as pd
import seaborn as sns
import datetime as dt
import matplotlib.pyplot as plt
from matplotlib.patches import Arc

from yaml import Loader
```


```python
root = '/home/atom/github/Dashboard/'
os.chdir(root)
sys.path.append(root)
```


```python
import generate as g
importlib.reload(g)
```




    <module 'generate' from '/home/atom/github/Dashboard/generate.py'>




```python
%%timeit -n 1 -r 1
match_dict = {match: g.MatchData(match) for match in sorted(os.listdir(os.path.join(root, 'data'))) if not match.startswith('.')}
```

    /home/atom/anaconda3/lib/python3.7/site-packages/pandas/core/frame.py:6692: FutureWarning: Sorting because non-concatenation axis is not aligned. A future version
    of pandas will change to not sort by default.
    
    To accept the future behavior, pass 'sort=False'.
    
    To retain the current behavior and silence the warning, pass 'sort=True'.
    
      sort=sort)


    26.9 s ± 0 ns per loop (mean ± std. dev. of 1 run, 1 loop each)



```python
match_dict = {match: g.MatchData(match) for match in sorted(os.listdir(os.path.join(root, 'data'))) if not match.startswith('.')}
```


```python
match_dict
```




    {'11sec_vsWaseda': <generate.MatchData at 0x7fc15c0dae80>,
     '12sec_vsWaseda': <generate.MatchData at 0x7fc19cbdde10>,
     '13sec_vsHosei': <generate.MatchData at 0x7fc19cbddd30>,
     '14sec_vsSenshu': <generate.MatchData at 0x7fc17b9a8e48>,
     '15sec_vsToyo': <generate.MatchData at 0x7fc171abc0f0>,
     '16sec_vsRissho': <generate.MatchData at 0x7fc19d0b1358>,
     '17sec_vsChuo': <generate.MatchData at 0x7fc19d0b1278>,
     '18sec_vsKomazawa': <generate.MatchData at 0x7fc19cbdde48>,
     '19sec_vsRKU': <generate.MatchData at 0x7fc19d865358>,
     '20sec_vsMeiji': <generate.MatchData at 0x7fc19f173128>,
     '21sec_vsToin': <generate.MatchData at 0x7fc19f5a65f8>,
     '22sec_vsJunten': <generate.MatchData at 0x7fc19c7b46d8>,
     '2sec_vsToin': <generate.MatchData at 0x7fc19c7ce390>,
     '3sec_vsToyo': <generate.MatchData at 0x7fc197f5a550>,
     '4sec_vsMeiji': <generate.MatchData at 0x7fc18fff8f98>,
     '5sec_vsJunten': <generate.MatchData at 0x7fc18e205f98>,
     '6sec_vsChuo': <generate.MatchData at 0x7fc18a452470>,
     '7sec_vsRKU': <generate.MatchData at 0x7fc18a452438>,
     '8sec_vsHosei': <generate.MatchData at 0x7fc18604a080>,
     '9sec_vsSenshu': <generate.MatchData at 0x7fc17faba9e8>}




```python
events = [
        '失点',
        '得点',
        'GK',
        'スローイン',
        'FK',
        'CK',
        'PK',
        'パス',
        'ドリブル',
        '枠外シュート',
        'クロス',
        '枠内シュート',
        '被枠外シュート',
        'クリア',
        'ブロック',
        'インターセプト',
        'シュートブロック',
        'カット',
        '被枠内シュート',
        'ファール',
        'オフサイド',
        'キャッチ',
        'パンチング'
]
    
gps_events = ['走行距離', 'HI距離','最高速度','最高速度','スプリント回数']

event_count_dict = {}
possession_rate_dict = {}
gps_average_dict = {}
```


```python
def get_gps_stats(match_data, mode='average'):
    gps_dict = match_data.gps_data
    
    gps_events = ['Distance (m)', 'Speed (km/h)','Bodyload','Acceleration (m/s/s)']
    if mode == 'average':
        averages = {e:0 for e in gps_events}
        for player, df in gps_dict.items():
            for key in gps_events:
                try:
                    averages[key] += df[key].mean() / len(gps_dict.keys())
                except:
                    averages[key] += 0
    return averages
```


```python
from IPython.display import display
import pandas as pd

for match, match_data in match_dict.items():
    event_df = match_data.event_data
    gps_dict = match_data.gps_data
    
    event_count_dict[match] = [match_data.get_count(e) for e in events]
    possession_rate_dict[match] = match_data.possession_time(0, 90*60)
    gps_average_dict[match] = get_gps_stats(match_data)
```

    'PK'
    '失点'
    'PK'
    'パンチング'
    '失点'
    '得点'
    'PK'
    'パス'
    'オフサイド'
    '失点'
    'パス'
    'パンチング'
    'PK'
    'パス'
    'パンチング'
    '失点'
    'PK'
    'パス'
    'PK'
    'パス'
    'パンチング'
    '失点'
    'PK'
    'パス'
    '得点'
    'PK'
    'パス'
    '枠内シュート'
    'オフサイド'
    'パンチング'
    'PK'
    'パス'
    'パンチング'
    'PK'
    'パス'
    '失点'
    '得点'
    'PK'
    'パス'
    'パンチング'
    'PK'
    'オフサイド'
    'パンチング'
    '失点'
    '得点'
    'PK'
    '被枠内シュート'
    '失点'
    'PK'
    'オフサイド'
    'パンチング'
    '失点'
    '得点'
    'PK'
    '被枠内シュート'
    'キャッチ'
    'パンチング'
    '失点'
    'PK'
    '被枠内シュート'
    'オフサイド'


    /home/atom/anaconda3/lib/python3.7/site-packages/pandas/core/frame.py:6692: FutureWarning: Sorting because non-concatenation axis is not aligned. A future version
    of pandas will change to not sort by default.
    
    To accept the future behavior, pass 'sort=False'.
    
    To retain the current behavior and silence the warning, pass 'sort=True'.
    
      sort=sort)


    '得点'
    'PK'



```python
from natsort import natsorted

event_count_df = pd.DataFrame(event_count_dict, index=events, columns=natsorted(list(event_count_dict.keys())))
possession_rate_df = pd.DataFrame(possession_rate_dict, index=['筑波','相手チーム'], columns=natsorted(list(possession_rate_dict.keys())))
gps_df = pd.DataFrame(gps_average_dict, columns=natsorted(list(gps_average_dict.keys())))

for df in [event_count_df, possession_rate_df, gps_df]:
    display(df.head())
```


<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>2sec_vsToin</th>
      <th>3sec_vsToyo</th>
      <th>4sec_vsMeiji</th>
      <th>5sec_vsJunten</th>
      <th>6sec_vsChuo</th>
      <th>7sec_vsRKU</th>
      <th>8sec_vsHosei</th>
      <th>9sec_vsSenshu</th>
      <th>11sec_vsWaseda</th>
      <th>12sec_vsWaseda</th>
      <th>13sec_vsHosei</th>
      <th>14sec_vsSenshu</th>
      <th>15sec_vsToyo</th>
      <th>16sec_vsRissho</th>
      <th>17sec_vsChuo</th>
      <th>18sec_vsKomazawa</th>
      <th>19sec_vsRKU</th>
      <th>20sec_vsMeiji</th>
      <th>21sec_vsToin</th>
      <th>22sec_vsJunten</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>失点</th>
      <td>2.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>4.0</td>
      <td>4.0</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>2.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>得点</th>
      <td>2.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>1.0</td>
      <td>5.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>GK</th>
      <td>7.0</td>
      <td>6.0</td>
      <td>21.0</td>
      <td>10.0</td>
      <td>8.0</td>
      <td>4.0</td>
      <td>5.0</td>
      <td>11.0</td>
      <td>9.0</td>
      <td>8.0</td>
      <td>9.0</td>
      <td>10.0</td>
      <td>7.0</td>
      <td>13.0</td>
      <td>11.0</td>
      <td>15.0</td>
      <td>9.0</td>
      <td>9.0</td>
      <td>8.0</td>
      <td>11.0</td>
    </tr>
    <tr>
      <th>スローイン</th>
      <td>25.0</td>
      <td>16.0</td>
      <td>16.0</td>
      <td>32.0</td>
      <td>27.0</td>
      <td>18.0</td>
      <td>15.0</td>
      <td>20.0</td>
      <td>28.0</td>
      <td>19.0</td>
      <td>28.0</td>
      <td>27.0</td>
      <td>35.0</td>
      <td>28.0</td>
      <td>17.0</td>
      <td>27.0</td>
      <td>30.0</td>
      <td>32.0</td>
      <td>15.0</td>
      <td>30.0</td>
    </tr>
    <tr>
      <th>FK</th>
      <td>7.0</td>
      <td>15.0</td>
      <td>14.0</td>
      <td>10.0</td>
      <td>11.0</td>
      <td>5.0</td>
      <td>13.0</td>
      <td>14.0</td>
      <td>12.0</td>
      <td>19.0</td>
      <td>9.0</td>
      <td>10.0</td>
      <td>13.0</td>
      <td>11.0</td>
      <td>15.0</td>
      <td>21.0</td>
      <td>12.0</td>
      <td>18.0</td>
      <td>13.0</td>
      <td>11.0</td>
    </tr>
  </tbody>
</table>
</div>



<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>2sec_vsToin</th>
      <th>3sec_vsToyo</th>
      <th>4sec_vsMeiji</th>
      <th>5sec_vsJunten</th>
      <th>6sec_vsChuo</th>
      <th>7sec_vsRKU</th>
      <th>8sec_vsHosei</th>
      <th>9sec_vsSenshu</th>
      <th>11sec_vsWaseda</th>
      <th>12sec_vsWaseda</th>
      <th>13sec_vsHosei</th>
      <th>14sec_vsSenshu</th>
      <th>15sec_vsToyo</th>
      <th>16sec_vsRissho</th>
      <th>17sec_vsChuo</th>
      <th>18sec_vsKomazawa</th>
      <th>19sec_vsRKU</th>
      <th>20sec_vsMeiji</th>
      <th>21sec_vsToin</th>
      <th>22sec_vsJunten</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>筑波</th>
      <td>1654</td>
      <td>1530</td>
      <td>934</td>
      <td>1346</td>
      <td>1573</td>
      <td>1393</td>
      <td>1464</td>
      <td>951</td>
      <td>1797</td>
      <td>1247</td>
      <td>2171</td>
      <td>1204</td>
      <td>2037</td>
      <td>735</td>
      <td>1031</td>
      <td>1047</td>
      <td>1608</td>
      <td>1407</td>
      <td>1612</td>
      <td>905</td>
    </tr>
    <tr>
      <th>相手チーム</th>
      <td>1085</td>
      <td>1185</td>
      <td>1653</td>
      <td>1219</td>
      <td>815</td>
      <td>639</td>
      <td>1144</td>
      <td>790</td>
      <td>634</td>
      <td>1288</td>
      <td>1897</td>
      <td>1022</td>
      <td>683</td>
      <td>1546</td>
      <td>1296</td>
      <td>635</td>
      <td>918</td>
      <td>1086</td>
      <td>1145</td>
      <td>1644</td>
    </tr>
  </tbody>
</table>
</div>



<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>2sec_vsToin</th>
      <th>3sec_vsToyo</th>
      <th>4sec_vsMeiji</th>
      <th>5sec_vsJunten</th>
      <th>6sec_vsChuo</th>
      <th>7sec_vsRKU</th>
      <th>8sec_vsHosei</th>
      <th>9sec_vsSenshu</th>
      <th>11sec_vsWaseda</th>
      <th>12sec_vsWaseda</th>
      <th>13sec_vsHosei</th>
      <th>14sec_vsSenshu</th>
      <th>15sec_vsToyo</th>
      <th>16sec_vsRissho</th>
      <th>17sec_vsChuo</th>
      <th>18sec_vsKomazawa</th>
      <th>19sec_vsRKU</th>
      <th>20sec_vsMeiji</th>
      <th>21sec_vsToin</th>
      <th>22sec_vsJunten</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Acceleration (m/s/s)</th>
      <td>0.014034</td>
      <td>0.012842</td>
      <td>0.012842</td>
      <td>0.012351</td>
      <td>0.012842</td>
      <td>0.012161</td>
      <td>0.014034</td>
      <td>0.014034</td>
      <td>0.014034</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>Bodyload</th>
      <td>127.658536</td>
      <td>81.666244</td>
      <td>81.666244</td>
      <td>65.769106</td>
      <td>81.666244</td>
      <td>68.892586</td>
      <td>127.658536</td>
      <td>127.658536</td>
      <td>127.658536</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>Distance (m)</th>
      <td>7647.266879</td>
      <td>4477.602663</td>
      <td>4477.602663</td>
      <td>4328.821020</td>
      <td>4477.602663</td>
      <td>4447.838538</td>
      <td>7647.266879</td>
      <td>7647.266879</td>
      <td>7647.266879</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>Speed (km/h)</th>
      <td>4.644541</td>
      <td>4.486895</td>
      <td>4.486895</td>
      <td>4.316905</td>
      <td>4.486895</td>
      <td>4.475982</td>
      <td>4.644541</td>
      <td>4.644541</td>
      <td>4.644541</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
</div>



```python
df = pd.concat([event_count_df, possession_rate_df, gps_df])
print(df.index)
df.head()
```

    Index(['失点', '得点', 'GK', 'スローイン', 'FK', 'CK', 'PK', 'パス', 'ドリブル', '枠外シュート',
           'クロス', '枠内シュート', '被枠外シュート', 'クリア', 'ブロック', 'インターセプト', 'シュートブロック', 'カット',
           '被枠内シュート', 'ファール', 'オフサイド', 'キャッチ', 'パンチング', '筑波', '相手チーム',
           'Acceleration (m/s/s)', 'Bodyload', 'Distance (m)', 'Speed (km/h)'],
          dtype='object')





<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>2sec_vsToin</th>
      <th>3sec_vsToyo</th>
      <th>4sec_vsMeiji</th>
      <th>5sec_vsJunten</th>
      <th>6sec_vsChuo</th>
      <th>7sec_vsRKU</th>
      <th>8sec_vsHosei</th>
      <th>9sec_vsSenshu</th>
      <th>11sec_vsWaseda</th>
      <th>12sec_vsWaseda</th>
      <th>13sec_vsHosei</th>
      <th>14sec_vsSenshu</th>
      <th>15sec_vsToyo</th>
      <th>16sec_vsRissho</th>
      <th>17sec_vsChuo</th>
      <th>18sec_vsKomazawa</th>
      <th>19sec_vsRKU</th>
      <th>20sec_vsMeiji</th>
      <th>21sec_vsToin</th>
      <th>22sec_vsJunten</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>失点</th>
      <td>2.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>4.0</td>
      <td>4.0</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>2.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>得点</th>
      <td>2.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>1.0</td>
      <td>5.0</td>
      <td>0.0</td>
      <td>3.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>GK</th>
      <td>7.0</td>
      <td>6.0</td>
      <td>21.0</td>
      <td>10.0</td>
      <td>8.0</td>
      <td>4.0</td>
      <td>5.0</td>
      <td>11.0</td>
      <td>9.0</td>
      <td>8.0</td>
      <td>9.0</td>
      <td>10.0</td>
      <td>7.0</td>
      <td>13.0</td>
      <td>11.0</td>
      <td>15.0</td>
      <td>9.0</td>
      <td>9.0</td>
      <td>8.0</td>
      <td>11.0</td>
    </tr>
    <tr>
      <th>スローイン</th>
      <td>25.0</td>
      <td>16.0</td>
      <td>16.0</td>
      <td>32.0</td>
      <td>27.0</td>
      <td>18.0</td>
      <td>15.0</td>
      <td>20.0</td>
      <td>28.0</td>
      <td>19.0</td>
      <td>28.0</td>
      <td>27.0</td>
      <td>35.0</td>
      <td>28.0</td>
      <td>17.0</td>
      <td>27.0</td>
      <td>30.0</td>
      <td>32.0</td>
      <td>15.0</td>
      <td>30.0</td>
    </tr>
    <tr>
      <th>FK</th>
      <td>7.0</td>
      <td>15.0</td>
      <td>14.0</td>
      <td>10.0</td>
      <td>11.0</td>
      <td>5.0</td>
      <td>13.0</td>
      <td>14.0</td>
      <td>12.0</td>
      <td>19.0</td>
      <td>9.0</td>
      <td>10.0</td>
      <td>13.0</td>
      <td>11.0</td>
      <td>15.0</td>
      <td>21.0</td>
      <td>12.0</td>
      <td>18.0</td>
      <td>13.0</td>
      <td>11.0</td>
    </tr>
  </tbody>
</table>
</div>




```python
import japanize_matplotlib
import matplotlib.pyplot as plt
import re
plt.style.use('ggplot')

for name, series in df.iterrows():
    plt.plot(series)
    plt.tick_params(rotation=90)
    plt.title(name)
    plt.tight_layout()
    plt.savefig(os.path.join(root, 'dev_code', 'season_report', 'figs',re.sub('[^A-Za-z0-9\u3040-\u309f\u30a0-\u30ff\uff66-\uff9f\u4e00-\u9faf]+', '', name)
+'.png'))
    plt.show()
```


![png](output_11_0.png)



![png](output_11_1.png)



![png](output_11_2.png)



![png](output_11_3.png)



![png](output_11_4.png)



![png](output_11_5.png)



![png](output_11_6.png)



![png](output_11_7.png)



![png](output_11_8.png)



![png](output_11_9.png)



![png](output_11_10.png)



![png](output_11_11.png)



![png](output_11_12.png)



![png](output_11_13.png)



![png](output_11_14.png)



![png](output_11_15.png)



![png](output_11_16.png)



![png](output_11_17.png)



![png](output_11_18.png)



![png](output_11_19.png)



![png](output_11_20.png)



![png](output_11_21.png)



![png](output_11_22.png)



![png](output_11_23.png)



![png](output_11_24.png)



![png](output_11_25.png)



![png](output_11_26.png)



![png](output_11_27.png)



![png](output_11_28.png)



```python
def match_outcome(row):
    if row['得点']>row['失点']:
        return  1
    elif row['得点']<row['失点']:
        return -1
    else:
        return 0
    
pair_plot_df = df.T.reset_index()
pair_plot_df['試合結果'] = pair_plot_df.apply(lambda row: match_outcome(row), axis=1)

corr = pair_plot_df.corr()

mask = np.zeros_like(corr, dtype=np.bool)
mask[np.triu_indices_from(mask)] = True

f, ax = plt.subplots(figsize=(11, 9))

cmap = sns.diverging_palette(220, 10, as_cmap=True)

sns.heatmap(corr, mask=mask, cmap=cmap, vmax=.3, center=0,
            square=True, linewidths=.5, cbar_kws={"shrink": .5})
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7fc17079a630>




![png](output_12_1.png)



```python
sns.pairplot(pair_plot_df[events[:]+['試合結果']], 
                 hue='試合結果',diag_kind="kde", markers=".",
                 plot_kws=dict(s=50, edgecolor="b", linewidth=1),
                 diag_kws=dict(shade=True))
```

    /home/atom/anaconda3/lib/python3.7/site-packages/statsmodels/nonparametric/kde.py:487: RuntimeWarning: invalid value encountered in true_divide
      binned = fast_linbin(X, a, b, gridsize) / (delta * nobs)
    /home/atom/anaconda3/lib/python3.7/site-packages/statsmodels/nonparametric/kdetools.py:34: RuntimeWarning: invalid value encountered in double_scalars
      FAC1 = 2*(np.pi*bw/RANGE)**2





    <seaborn.axisgrid.PairGrid at 0x7fc171dd5518>




![png](output_13_2.png)



```python

```
