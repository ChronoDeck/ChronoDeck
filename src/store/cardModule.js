const state = {
    chartType: 'line chart',
    selectCheck:[],
    deleteCheck:[],
    deleteCheck_copy:[],
}

const mutations = {
    UPDATE_CHART_TYPE(state, payload) {
        state.chartType = payload
    }
}

const actions = {
    updateChartType({commit}, chart_type) {
        commit("UPDATE_CHART_TYPE", chart_type)
    },
    updateSelectCheck({state}, check_id) {
        if(!state.selectCheck.includes(check_id)){
            state.selectCheck.push(check_id);
        }
    },
    updateDeleteCheck({state}, check_id) {
        if(!state.deleteCheck.includes(check_id)){
            state.deleteCheck.push(check_id);
        }
        else {
            state.deleteCheck = state.deleteCheck.filter(id => id !== check_id)
        }
    },
    resetCheck({state}) {
        state.deleteCheck_copy = state.deleteCheck
        state.deleteCheck = [];
        state.selectCheck = [];
    }
}
const getters = {
    chartType: state => state.chartType,
    selectCheck: state => state.selectCheck,
    deleteCheck: state => state.deleteCheck,
    deleteCheck_copy: state => state.deleteCheck_copy
}

const cardModule = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default cardModule