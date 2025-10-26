import { transformData} from "../computation/basicComputation"
import axios from "axios"

const state = {
    //list of obj: [{entityID: 1, type: "tree", "id_list": [], "level_list": []}, {entityID: 2, type: "node", "id": 1, "level":1}]
    entityCollection: [],
    entityID: 1,
    relateSeriesCollection: [], 
    nodeVisiable: false,
    pathVisiable: false,
    treeVisiable: false,
    entityHeight: 0,
    entityWidth: 0
}

const mutations = {
    //不用mutations, 直接actions, 改变entityCollection
    deleteIdFromEntity(state, { index, idIndex }) {
        state.entityCollection[index].path.splice(idIndex, 1);
    },
    SET_NODE_VISUAL(state, value) {
        state.nodeVisiable = value;
    },
    SET_PATH_VISUAL(state, value) {
        state.pathVisiable = value;
    },
    SET_TREE_VISUAL(state, value) {
        state.treeVisiable = value;
    },
    SET_ENTITY_HEIGHT(state, value) {
        state.entityHeight = value;
    },
    SET_ENTITY_WIDTH(state, value) {
        state.entityWidth = value;
    },
    SET_RELATE_SERIES_COLLECTION(state, relateSeriesCollection) {
        state.relateSeriesCollection = relateSeriesCollection;
    },
}

const actions = {
    addEntity({ state }, obj) {
        const newEntity = {
            entityID: state.entityID,
            ...obj // 合并传入的对象，例如{ type: 'Node' }，到新对象中
        };
        state.entityCollection.push(newEntity);
        state.entityID++;
    },
    deleteEntity({ state }, entityID) {
        // console.log("index is", entityID)
        state.entityCollection = state.entityCollection.filter(entity => entity.entityID !== entityID);
    },
    deleteIdFromEntity({ commit, state, rootState }, deleteItem) {
        const index = state.entityCollection.findIndex(entity => entity.entityID === deleteItem.entityID);
        if (index !== -1) {
            const levelIndex = state.entityCollection[index].path.findIndex(id => id === deleteItem.id);
            state.entityCollection[index].path = state.entityCollection[index].path.filter(item => item !== deleteItem.id)
            state.entityCollection[index].levelList.splice(levelIndex, 1)
        }
    },
    async getRelate({ commit }, payload) {
        // 发送 POST 请求并处理响应
        const response = await axios.post('/api/relate', payload);
        const newSeriesCollection = response.data.relateSeriesCollection.map(node => {
                return {
                  ...node,
                  seriesData: transformData(node.seriesData),
                }
              })
        commit('SET_RELATE_SERIES_COLLECTION', newSeriesCollection);  // 保存 relateSeriesCollection 到 state
        return response.data.result;
      },
    updateNodeVisiable({ commit }, value) {
        commit('SET_NODE_VISUAL', value);
    },
    updatePathVisiable({ commit }, value) {
        commit('SET_PATH_VISUAL', value);
    },
    updateTreeVisiable({ commit }, value) {
        commit('SET_TREE_VISUAL', value);
    },
    updateEntityHeight({ commit }, value) {
        commit('SET_ENTITY_HEIGHT', value);
    },
    updateEntityWidth({ commit }, value) {
        commit('SET_ENTITY_WIDTH', value);
    }
}
const getters = {
    entityID: state => state.entityID,
    entityCollection: state => state.entityCollection,
    nodeVisiable: state => state.nodeVisiable,
    pathVisiable: state => state.pathVisiable,
    treeVisiable: state => state.treeVisiable,
    entityHeight: state => state.entityHeight,
    entityWidth: state => state.entityWidth,
    relateSeriesCollection: state => state.relateSeriesCollection
}

const selectionModule = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default selectionModule