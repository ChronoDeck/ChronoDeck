const state = {
    themeColor: "#3182BD"
    

}

const mutations =  {

}

const actions = {
 
}
const getters = {
    themeColor: state => state.themeColor

}

const colorModule = {
    namespaced:true,
    state,
    mutations,
    actions,
    getters
}

export default colorModule