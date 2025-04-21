const state = {
    wholeTimeRange: {
        'PV':['2022-11-27', '2023-3-26'],
        'Stock':['2023-03-01', '2023-03-31'],
        'Tour_Seasonal':['1998-01-01', '2017-10-01']
    },
    zoomVisiable:0,
    startTime: '2023-3-1',
    endTime: '2023-3-31'

}

const mutations = {
    UPDATE_ZOOM(state){
        state.zoomVisiable = !state.zoomVisiable
    },
    UPDATE_START_TIME(state, time){
        state.startTime = time
    },
    UPDATE_END_TIME(state, time){
        state.endTime = time
    }
}

const actions = {

}
const getters = {
    wholeTimeRange: state => state.wholeTimeRange,
    zoomVisiable: state => state.zoomVisiable,
    startTime: state => state.startTime,    
    endTime: state => state.endTime
}

const timeModule = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default timeModule