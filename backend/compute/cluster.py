import json
import numpy as np
from compute.jsonTransfer import TSjson_exp
from sklearn.cluster import KMeans
from sklearn.cluster import DBSCAN

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
    kmeans = KMeans(n_clusters=n_clusters, random_state=seed, n_init=10)

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