import numpy as np
from sklearn.manifold import MDS, TSNE
from compute.jsonTransfer import TSjson_exp
from compute.draw import draw_tsne

def t_sne_to2d(json_data, perp=5, ee=12, randomSeed=100):
    '''
    @description: sclaing the data to 2d with t-sne method.
    @Author: Nemo
    @Date: 2024-03-05 15:41:14
    @return {*} return list as [{id: key ,x: , y: }, ... ]
    @param {*} json_data: data input.
    '''
    keys, datas = TSjson_exp(json_data)
    tmpData = datas[:, 1:].T.astype('float')
    # print("tmpData is", tmpData)

    if tmpData.shape[0] == 1:
        return [{'id':keys[1], 'x': 0.0, 'y': 0.0}]
    elif tmpData.shape[0] < perp:
        tsne = TSNE(n_components=2, perplexity=tmpData.shape[0]-1, early_exaggeration=ee, random_state=randomSeed)
    else:
        tsne = TSNE(n_components=2, perplexity=perp, early_exaggeration=ee, random_state=randomSeed)
        
    
    print(f'random seed: {randomSeed}')
        
        
    data_to2d = tsne.fit_transform(tmpData).astype('float')

    result_list = []
    for i in range(len(data_to2d)):
        result_list.append({'id':keys[i+1], 'x':data_to2d[i][0], 'y':data_to2d[i][1]})

    # Generate visualization
    draw_tsne(result_list)

    return result_list