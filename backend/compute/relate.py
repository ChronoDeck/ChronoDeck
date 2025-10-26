from compute.TSfuncCal import MinMaxNormalize
from compute.filter import getTSdata
from compute.comprehensive import getBoundary
from compute.distance import get_eucdis
from compute.comprehensive import getBoundary
from compute.TSfuncCal import ZScoreNormalize, MinMaxNormalize
from compute.jsonTransfer import TSjson_exp

def getDescendantNodesId(tree_data, father_id, delta_level):
    father_node = tree_data[father_id-1]
    descendant_nodes = []
    for i in range(delta_level):
        if descendant_nodes == []:
            descendant_nodes = father_node['children_id']
        else:
            temp = []
            for node_id in descendant_nodes:
                temp += tree_data[node_id-1]['children_id']
            descendant_nodes = temp
    return descendant_nodes

def relateFunc(tree_data, timeRange, folder_path, id_list, level_list, mode, type):
    if type == 'node':
        node_level = level_list[0]
        target_node = tree_data[id_list[0]-1]
        target_data = getTSdata(target_node['node_name'], folder_path, timeRange)
        node_level_node_list = [node for node in tree_data if node['level'] == node_level]
        if mode == 'similarity':
            boundarys = getBoundary(tree_data, folder_path, timeRange)['result']
            norm_target_data = MinMaxNormalize({'data':target_data}, boundarys[node_level-1]['max'], boundarys[node_level-1]['min'])
            
            score_list = []
            for node in node_level_node_list:
                candidate_data = getTSdata(node['node_name'], folder_path, timeRange)
                normalized_candidate_data = MinMaxNormalize({'data':candidate_data}, boundarys[node_level-1]['max'], boundarys[node_level-1]['min'])
                score = get_eucdis(norm_target_data, normalized_candidate_data)
                score_list.append({'path':[node['id']], 'score':score})
            sorted_score_list  = sorted(score_list, key=lambda x: x['score'])

        if mode == 'correlation':
            norm_target_data = TSjson_exp({'data': ZScoreNormalize(target_data)})[1][:, 1]

            score_list = []
            for node in node_level_node_list:
                candidate_data = getTSdata(node['node_name'], folder_path, timeRange)
                normalized_candidate_data = TSjson_exp({'data': ZScoreNormalize(candidate_data)})[1][:, 1]
                score = get_eucdis(norm_target_data, normalized_candidate_data)
                score_list.append({'path':[node['id']], 'score':score})
            sorted_score_list  = sorted(score_list, key=lambda x: x['score'])
            print("timeRange in relate is", timeRange)
        relate_result = []
        for item in sorted_score_list[1:4]:
            obj = {
                'id': item['path'][0],
                'level': level_list[0],
                'type': type,
                'flag': 'relate'
            }
            relate_result.append(obj)   
        return relate_result
    # ------------------------------------------------------------
    if type == 'path':
        father_id, child_id = id_list[0], id_list[1]
        father_level, child_level = level_list[0], level_list[1]
        delta_level = child_level - father_level

        father_level_node_list = [node for node in tree_data if node['level'] == father_level]

        if mode == 'similarity':
            boundarys = getBoundary(tree_data, folder_path, timeRange)['result']
            
            target_father_node = tree_data[father_id-1] 
            target_father_data = getTSdata(target_father_node['node_name'], folder_path, timeRange)
            norm_target_father_data = MinMaxNormalize({'data':target_father_data}, boundarys[father_level-1]['max'], boundarys[father_level-1]['min'])
            
            target_child_node = tree_data[child_id-1] 
            target_child_data = getTSdata(target_child_node['node_name'], folder_path, timeRange)
            norm_target_child_data = MinMaxNormalize({'data':target_child_data}, boundarys[child_level-1]['max'], boundarys[child_level-1]['min'])

            score_list = []
            for node in father_level_node_list:
                candidate_father_data = getTSdata(node['node_name'], folder_path, timeRange)
                normalized_candidate_father_data = MinMaxNormalize({'data':candidate_father_data}, boundarys[father_level-1]['max'], boundarys[father_level-1]['min'])
                candidate_id = [node['id']]
                for i in getDescendantNodesId(tree_data, node['id'], delta_level):
                    candidate_child_data = getTSdata(tree_data[i-1]['node_name'], folder_path, timeRange)
                    normalized_candidate_child_data = MinMaxNormalize({'data':candidate_child_data}, boundarys[child_level-1]['max'], boundarys[child_level-1]['min'])
                    path_score = {'path':candidate_id + [i], 'score':get_eucdis(norm_target_father_data, normalized_candidate_father_data) + get_eucdis(norm_target_child_data, normalized_candidate_child_data)}
                    score_list.append(path_score)
            sorted_score_list  = sorted(score_list, key=lambda x: x['score'])

        if mode == 'correlation':
            target_father_node = tree_data[father_id-1] 
            target_father_data = getTSdata(target_father_node['node_name'], folder_path, timeRange)
            norm_target_father_data = TSjson_exp({'data': ZScoreNormalize(target_father_data)})[1][:, 1]
            target_child_node = tree_data[child_id-1] 
            target_child_data = getTSdata(target_child_node['node_name'], folder_path, timeRange)
            norm_target_child_data = TSjson_exp({'data': ZScoreNormalize(target_child_data)})[1][:, 1]
            score_list = []
            for node in father_level_node_list:
                candidate_father_data = getTSdata(node['node_name'], folder_path, timeRange)
                normalized_candidate_father_data = TSjson_exp({'data': ZScoreNormalize(candidate_father_data)})[1][:, 1]
                candidate_id = [node['id']]
                for i in getDescendantNodesId(tree_data, node['id'], delta_level):
                    candidate_child_data = getTSdata(tree_data[i-1]['node_name'], folder_path, timeRange)
                    normalized_candidate_child_data = TSjson_exp({'data': ZScoreNormalize(candidate_child_data)})[1][:, 1]
                    path_score = {'path':candidate_id + [i], 'score':get_eucdis(norm_target_father_data, normalized_candidate_father_data) + get_eucdis(norm_target_child_data, normalized_candidate_child_data)}
                    score_list.append(path_score)
            sorted_score_list  = sorted(score_list, key=lambda x: x['score'])
        
        
        relate_result = []
        for item in sorted_score_list[1:3]:
            obj = {
                'id_list': item['path'],
                'level_list': level_list,
                'type': type,
                'flag': 'relate'
            }
            relate_result.append(obj)   
        return relate_result
    # ------------------------------------------------------------
    else:
        return None

