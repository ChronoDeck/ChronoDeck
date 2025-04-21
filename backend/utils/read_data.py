import json
import os
from utils.flag import whether_standardize_dataset
from compute.filter import filterDataByTimeRange
from compute.TSfuncCal import ZScoreNormalize

def read_json(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            return json.load(file)
    else:
        return []
    

def getRelateData(result, tree_data, folder_path, type, dataset, timeRange):
    if type == "node":
        id_set = [i["id"] for i in result]
    elif type == "path":
        id_set = []
        for item in result:
            for id in item["id_list"]:
                id_set.append(id)
        id_set = set(id_set)
        
    collection = []
    for id in id_set:
        obj = {}
        obj["id"] = id
        node = next((item for item in tree_data if item["id"] == id), None)
        data_file_name = node["node_name"] + ".json"
        data_folder_path = ""
        if node["level"] != 1:
            data_folder_path = list(node["node_name"].split("-"))[-2]
        data_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), folder_path, data_folder_path, data_file_name)
        data = filterDataByTimeRange(read_json(data_file_path)["data"],timeRange)
        obj['seriesData'] = ZScoreNormalize(data) if whether_standardize_dataset(dataset) else data
        collection.append(obj) 
    return collection

    