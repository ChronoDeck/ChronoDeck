import os
import json
from datetime import datetime, timedelta
from compute.TSfuncCal import MinMaxNormalize

def filterDataByTimeRange(data, timeRange=[]):
    if not timeRange:
        return data
    # Replace "Z" with "+00:00" to properly handle the timezone
    start_time = datetime.fromisoformat(timeRange[0].replace("Z", "+00:00"))
    end_time = datetime.fromisoformat(timeRange[1].replace("Z", "+00:00"))
    # Convert both adjusted times to "YYYY-MM-DD" format for comparison
    start_date_str = start_time.strftime("%Y-%m-%d")
    end_date_str = end_time.strftime("%Y-%m-%d")
    filtered_data = [
        entry for entry in data
        if start_date_str <= entry["Time"] <= end_date_str
    ]
    return filtered_data

def getTSdata(nodeName, folder_path, timeRange=[]):
    if '-' not in nodeName:
        data_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),folder_path, nodeName+'.json')
        if not os.path.exists(data_file_path):
            return []
        with open(data_file_path, 'r') as file:
            data_file = filterDataByTimeRange(json.load(file)['data'], timeRange)
    else:
        data_folder_path = list(nodeName.split("-"))[-2]
        data_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),folder_path, data_folder_path, nodeName+'.json')
        if not os.path.exists(data_file_path):
            return []
        with open(data_file_path, 'r') as file:
            data_file = filterDataByTimeRange(json.load(file)['data'], timeRange)
    return data_file

def getNormalListData(pv_tree_data, folder_path, boundarys, nodelist, timeRange=[]):
    normalized_children_data = []
    for child_id in nodelist:
        child_node = pv_tree_data[child_id-1]
        child_data = {'data':getTSdata(child_node['node_name'], folder_path, timeRange)}
        normalized_child_data = MinMaxNormalize(child_data, boundarys[child_node['level']-1]['max'], boundarys[child_node['level']-1]['min'])
        normalized_children_data.append(normalized_child_data)
    return normalized_children_data