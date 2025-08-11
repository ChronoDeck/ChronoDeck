from compute.TSfuncCal import GetMax, GetMin, ZScoreNormalize
from compute.filter import getTSdata

def getBoundary(tree_data, folder_path, timeRange=[], dataset="PV"):
    level_max={}
    level_min={}
    grouped_level = None # suppose there is only one grouped level
    for node in tree_data:
        if 'attribute' in node and 'group' in node['attribute']:
            level_max[node['level']] = 0
            level_min[node['level']] = 0
            grouped_level = node['level']
            continue

        if dataset == 'Stock':
            node_TS_data = {'data':ZScoreNormalize(getTSdata(node['node_name'], folder_path, timeRange))}
        else:
            node_TS_data = {'data':getTSdata(node['node_name'], folder_path, timeRange)}
        
        node_max = GetMax(node_TS_data)
        node_min = GetMin(node_TS_data)

        if node['level'] not in level_max.keys():
            level_max[node['level']] = node_max
            level_min[node['level']] = node_min
        else:
            if node_max > level_max[node['level']]:
                level_max[node['level']] = node_max
            if node_min < level_min[node['level']]:
                level_min[node['level']] = node_min
    if grouped_level is not None:
        level_max[grouped_level] = level_max[grouped_level+1]
        level_min[grouped_level] = level_min[grouped_level+1]
    result = []
    for i in level_max.keys():
        result.append({'level':i, 'max':level_max[i], 'min':level_min[i]})
    result = sorted(result, key=lambda x: x['level'])
    # print("CHECK RESULT: ", result)
    return {'result':result}


