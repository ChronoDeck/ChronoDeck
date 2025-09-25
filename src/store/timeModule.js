const state = {
    wholeTimeRange: {
        'Tour_Seasonal':['1998-01-01', '2017-10-01']
    },
    zoomVisiable:0,
    startTime: '1998-01-01',
    endTime: '2017-10-01'

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