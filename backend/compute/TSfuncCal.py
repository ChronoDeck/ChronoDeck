import pandas as pd
import numpy as np
import json
from io import StringIO
from compute.jsonTransfer import TSjson_exp

def GetMax(TS):
    _, TS_datalist = TSjson_exp(TS)
    TS_datalist = TS_datalist[:, 1]
    return TS_datalist.max()

def GetMin(TS):
    _, TS_datalist = TSjson_exp(TS)
    TS_datalist = TS_datalist[:, 1]
    return TS_datalist.min()

def MinMaxNormalize(TS, level_max, level_min):
    _, TS_datalist = TSjson_exp(TS)
    TS_datalist = TS_datalist[:, 1]
    TS_datalist = (TS_datalist-level_min)/(level_max-level_min)
    return TS_datalist

def ZScoreNormalize(TS):
    # Convert JSON to DataFrame for easier manipulation
    json_str = json.dumps(TS)
    df = pd.read_json(StringIO(json_str))
    df['value'] = (df['value'] - df['value'].mean()) / df['value'].std()
    result = df.to_json(orient='records', date_format='iso')
    standardized_TS = json.loads(result)
    return standardized_TS

