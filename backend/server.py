from flask import Flask, request, jsonify, make_response
import os
import shutil
import json  
from compute.filter import filterDataByTimeRange
from compute.dr import t_sne_to2d
from compute.groupTree import constructGT, getGroupedPoints
from compute.basic import getAverageSeriesData
from compute.comprehensive import getBoundary
from compute.TSfuncCal import ZScoreNormalize
from compute.relate import relateFunc

from utils.read_data import read_json
from utils.read_data import getRelateData
from utils.flag import whether_standardize_dataset


app = Flask(__name__)

TREE_FILE_NAME = "Tree.json"
TREE_GROUPED_FILE_NAME = "Tree_Grouped.json"
COORDINATE_COLLECTION_PATH = os.path.join(os.path.dirname(__file__), 'tmp/originalCoordinateCollection.json')

@app.route('/Tree', methods=['POST'])
def getTree():
    data = request.get_json()
    dataset = data.get('dataset', "")
    DATA_FOLDER_PATH = os.path.join("data", dataset)
    TREE_FILE_PATH = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, TREE_FILE_NAME)
    if os.path.exists(os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH,TREE_GROUPED_FILE_NAME)):
        os.remove(os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH,TREE_GROUPED_FILE_NAME))
        
    if os.path.exists(os.path.join(os.path.dirname(__file__),"tmp")):
        shutil.rmtree(os.path.join(os.path.dirname(__file__),"tmp"))

    TREE_FILE_PATH = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, TREE_FILE_NAME)
    tree_data = read_json(TREE_FILE_PATH)
    return {"Tree": tree_data}

@app.route('/SeriesCollection', methods=['POST'])
def getSeriesCollection():
    data = request.get_json()
    selectionTree = data.get('selectionTree', [])
    dataset = data.get('dataset', "")
    DATA_FOLDER_PATH = os.path.join("data", dataset)
    TREE_FILE_PATH = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, TREE_FILE_NAME)
    TREE_GROUPED_FILE_PATH = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, TREE_GROUPED_FILE_NAME)
    timeRange = data.get('timeRange', "")
    collection = []
    nodeList = []
    tree_data =[]
    tree_grouped_data = []
    nodeList = [item["id"] for item in selectionTree]
    
    # read the tree structure to get file_name
    tree_data = read_json(TREE_FILE_PATH)
    tree_grouped_data = read_json(TREE_GROUPED_FILE_PATH)

    for id in nodeList:
        object = {}
        object["id"] = id

        grouped_node = None
        tree_node = next((item for item in tree_data if item["id"] == id), None)
        if len(tree_grouped_data) > 0:
            grouped_node = next((item for item in tree_grouped_data if item["id"] == id), None)
        
        if tree_node is not None:
            object["node_name"] = tree_node["node_name"]
            if grouped_node is not None:
                object["level"] = grouped_node["level"]
            elif grouped_node is None:
                object["level"] = tree_node["level"]
            data_file_name = tree_node["node_name"] + ".json"
            data_folder_path = ""
            if object["level"]!= 1 :
                data_folder_path = list(tree_node["node_name"].split("-"))[-2]
            data_file_path = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, data_folder_path, data_file_name)
            data = filterDataByTimeRange(read_json(data_file_path)["data"],timeRange)
            object['seriesData'] = ZScoreNormalize(data) if whether_standardize_dataset(dataset) else data
            object['rawData'] = data   
        else:
            object["node_name"] = grouped_node["node_name"]
            object["level"] = grouped_node["level"]
            children_id = grouped_node["children_id"]
            seriesData_list = []
            rawData_list = []
            for child_id in children_id:
                child_grouped_node = next((item for item in tree_grouped_data if item["id"] == child_id), None)
                data_file_name = child_grouped_node["node_name"] + ".json"
                data_folder_path = list(child_grouped_node["node_name"].split("-"))[-2]
                data_file_path = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, data_folder_path, data_file_name)
                data = filterDataByTimeRange(read_json(data_file_path)["data"],timeRange)
                seriesData_list.append(ZScoreNormalize(data) if whether_standardize_dataset(dataset) else data)
                rawData_list.append(data)
            object['seriesData'] = getAverageSeriesData(seriesData_list)
            object['rawData'] = getAverageSeriesData(rawData_list)
        collection.append(object)    
    return {"seriesCollection": collection}

@app.route('/coordinateCollection', methods=["POST"])
def getCoordinateCollection():
    data = request.get_json()
    dataset = data.get("dataset","")
    DATA_FOLDER_PATH = os.path.join("data", dataset)
    TREE_FILE_PATH = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, TREE_FILE_NAME)
    level_id_list = data.get("level_id_list",[])
    timeRange = data.get("timeRange",[])
    # print("timeRange is", timeRange)
    randomSeed = data.get("randomSeed",42)
    # print("randomSeed is", randomSeed)
    tree_data = read_json(TREE_FILE_PATH)
    collection = {}
    for level_id in level_id_list:
        object = {}
        node_list = []
        node_list = [node for node in tree_data if node["level"] == level_id]
        
        for node in node_list:
            data_file_name = node["node_name"] + ".json"
            data_folder_path = ""
            if node["level"] != 1:
                data_folder_path = list(node["node_name"].split("-"))[-2]
            data_file_path = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, data_folder_path, data_file_name)
            data = filterDataByTimeRange(read_json(data_file_path)["data"], timeRange)
            object[node["id"]] = ZScoreNormalize(data) if whether_standardize_dataset(dataset) else data 
                
        result = t_sne_to2d(object, perp=5, ee=12, randomSeed=randomSeed)
        collection[level_id] = result
    
    collection_dict = {"coordinateCollection":collection}
    os.makedirs(os.path.join(os.path.dirname(__file__),"tmp"), exist_ok=True)
    with open(COORDINATE_COLLECTION_PATH, 'w') as json_file:
        json.dump(collection_dict, json_file)
    return collection_dict

@app.route('/addLayer', methods=["POST"])
def getGroupedCoordinateCollection():
    data = request.get_json()
    level = data.get("level_id",[])
    dataset = data.get("dataset","")
    DATA_FOLDER_PATH = os.path.join("data", dataset)
    TREE_FILE_PATH = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, TREE_FILE_NAME)
    clusterNumber = data.get("clusterNumber", 5)
    collection = {}

    tree_data = read_json(TREE_FILE_PATH) 
    max_level = max(tree_data, key=lambda x: x["level"])['level']

    origin_collection = read_json(COORDINATE_COLLECTION_PATH)
    tmp_result = origin_collection["coordinateCollection"][str(level)]

    grouped_Tree = constructGT(TREE_FILE_PATH, tmp_result, level, n=clusterNumber)
    grouped_Points = getGroupedPoints(grouped_Tree, tmp_result, level)
    for i in range(max_level+1, level, -1):
        collection[i] = origin_collection["coordinateCollection"][str(i-1)]
    collection[level] = grouped_Points
    for i in range(level-1, 0, -1):
        collection[i] = origin_collection["coordinateCollection"][str(i)]
    grouped_result = {"newOriginalTree":grouped_Tree, "newCoordinateCollection":collection}
    
    return grouped_result
    
@app.route('/scale', methods=["POST"])
def getScale():
    data = request.get_json()
    dataset = data.get("dataset", "")
    DATA_FOLDER_PATH = os.path.join("data", dataset)
    TREE_FILE_PATH = os.path.join(os.path.dirname(__file__),DATA_FOLDER_PATH, TREE_FILE_NAME)
    timeRange = data.get("timeRange",[])
    tree_data = read_json(TREE_FILE_PATH)
    return getBoundary(tree_data, DATA_FOLDER_PATH, timeRange, dataset)

@app.route('/relate', methods=["POST"])
def getRelate():
    data = request.get_json()
    print("data is",data )
    dataset = data.get("dataset", "")
    timeRange = data.get("timeRange",[])
    id_list = data.get("id_list",[])
    level_list = data.get("level_list",[])
    mode = data.get("mode", "") # similarity or correlation
    type = data.get("type", "") # node, path, ...
    DATA_FOLDER_PATH = os.path.join("data", dataset)
    TREE_FILE_NAME = "Tree.json"
    GROUPED_TREE_FILE_NAME = "Tree_Grouped.json"
    if os.path.exists(os.path.join(os.path.dirname(__file__), DATA_FOLDER_PATH, GROUPED_TREE_FILE_NAME)):
        TREE_FILE_PATH = os.path.join(os.path.dirname(__file__), DATA_FOLDER_PATH, GROUPED_TREE_FILE_NAME)
    else:
        TREE_FILE_PATH = os.path.join(os.path.dirname(__file__), DATA_FOLDER_PATH, TREE_FILE_NAME)
    tree_data = read_json(TREE_FILE_PATH)
    relate_result = relateFunc(tree_data=tree_data, timeRange=timeRange, folder_path=DATA_FOLDER_PATH, id_list=id_list, level_list=level_list, mode=mode, type=type)
    print("result is ",relate_result)
    relate_data = getRelateData(relate_result, tree_data, DATA_FOLDER_PATH, type, dataset, timeRange)
    return {"result": relate_result, 'relateSeriesCollection': relate_data}

@app.route('/test', methods=["GET"])
def test():
    print({"test": "test"})
    return "Hello World"

    

if __name__ == "__main__":
    app.run(port=3000, debug=True)
