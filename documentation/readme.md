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
Prints what the animals name is and what sound it makes.

If the argument `sound` isn't passed in, the default Animal
sound is used.

Parameters
----------
sound : str, optional
    The sound the animal makes (default is None)

Raises
------
NotImplementedError
    If no sound is set for the animal or passed in as a
    parameter.

### get_gps_data
```python
MatchData.get_gps_data(self)
```
Spreadsheet Column Printer

This script allows the user to print to the console all columns in the
spreadsheet. It is assumed that the first row of the spreadsheet is the
location of the columns.

This tool accepts comma separated value files (.csv) as well as excel
(.xls, .xlsx) files.

This script requires that `pandas` be installed within the Python
environment you are running this script in.

This file can also be imported as a module and contains the following
functions:

    * get_spreadsheet_cols - returns the column headers of the file
    * main - the main function of the script

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

