import json
import numpy as np
from compute.jsonTransfer import TSjson_exp
from sklearn.cluster import KMeans
from sklearn.cluster import DBSCAN

def cluster_kmeans(json_data, n):
    try:
        keys, array = TSjson_exp(json_data)

        seed = np.random.randint(1000) 
        n_clusters = n
        kmeans = KMeans(n_clusters=n_clusters, random_state=seed)
        kmeans.fit(array[:, 1:].T)
        labels = kmeans.labels_
        # cluster_centers = kmeans.cluster_centers_
        # labels_counter = np.unique(labels, return_counts=True)

        result_dict = {}
        for i in range(n_clusters):
            result_dict.update({str(i+1):[]})
        for i in range(len(labels)):
            j = labels[i]
            result_dict[str(j+1)].append(keys[i+1])
        result_dict = {"result":result_dict}
        json_string = json.dumps(result_dict)

        return json_string

    except Exception as e:

        print("Data Error _01")
        return ''

def cluster_dbscan(data_list, eps=0.4, min_samples=2):
    keys = []
    data_2d = []
    for i in range(len(data_list)):
        keys.append(data_list[i]['id'])
        data_2d.append([data_list[i]['x'], data_list[i]['y']])
    data_2d = np.array(data_2d, dtype=np.float32)

    dbscan = DBSCAN(eps, min_samples)
    labels = dbscan.fit_predict(data_2d)

    result_dict = {}
    for i in range(len(data_2d)):
        j = labels[i]+1
        if str(j) in result_dict:
            result_dict[str(j)].append(keys[i])
        else:
            result_dict.update({str(j):[keys[i]]})
    # json_string = json.dumps(result_dict)
    
    return result_dict

def cluster_kmeans_2d(data_list, n):
    keys = []
    data_2d = []
    for i in range(len(data_list)):
        keys.append(data_list[i]['id'])
        data_2d.append([data_list[i]['x'], data_list[i]['y']])
    data_2d = np.array(data_2d, dtype=np.float32)
    # print(keys)
    # print(data_2d)
    seed = 666 
    n_clusters = n
    kmeans = KMeans(n_clusters=n_clusters, random_state=seed)

    kmeans.fit(data_2d)
    labels = kmeans.labels_
    # cluster_centers = kmeans.cluster_centers_
    # labels_counter = np.unique(labels, return_counts=True)

    result_dict = {}
    for i in range(len(data_2d)):
        j = labels[i]+1
        if str(j) in result_dict:
            result_dict[str(j)].append(keys[i])
        else:
            result_dict.update({str(j):[keys[i]]})
    return result_dict