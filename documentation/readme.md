# generate

## MatchData
```python
MatchData(self, match_name)
```

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


### init_yaml
```python
MatchData.init_yaml(self)
```
Converts .md to yaml

Parameters
----------
None

Raises
------
None

### get_gps_data
```python
MatchData.get_gps_data(self)
```
Converts .md to yaml

Parameters
----------
None

Raises
------
None

### get_event_data
```python
MatchData.get_event_data(self)
```
Converts .md to yaml

Parameters
----------
None

Raises
------
None

### generate_data
```python
MatchData.generate_data(self)
```
Converts .md to yaml

Parameters
----------
None

Raises
------
None

### stats_hbar
```python
MatchData.stats_hbar(self, meta=None, show=False)
```

Sample data to give to this is:
meta = {
    'def':{
        'events' : ['シュートブロック', 'クリア', 'インターセプト', 'ブロック'],
        '回数'   : [79, 60, 45,85],
    }
}

### rank_table
```python
MatchData.rank_table(self, show=False)
```
Converts .md to yaml

Parameters
----------
None

Raises
------
None

### plot_pitch
```python
MatchData.plot_pitch(self, height=68, width=105, xos=0, yofs=0)
```
Converts .md to yaml

Parameters
----------
None

Raises
------
None

### render_mpl_table
```python
MatchData.render_mpl_table(self, data, col_width=3.0, row_height=0.625, font_size=14, header_color='#40466e', row_colors=['#f1f1f2', 'w'], edge_color='w', bbox=[0, 0, 1, 1], header_columns=0, ax=None, **kwargs)
```
Converts .md to yaml

Parameters
----------
None

Raises
------
None

