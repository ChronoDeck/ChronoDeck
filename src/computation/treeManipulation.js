import { calculateAverageSeries } from "./basicComputation"
import { cloneDeep } from "lodash"

export const merge_trees = ({state, commit, rootState}, obj) => {
    // id2 向 id1 合并, 已经展开的 Materials 和 已经展开的 Energy 进行合并
    const id1 = obj.id1
    const id2 = obj.id2

    let originalTree = cloneDeep(state.originalTree)
    let selectionTree = []
    let seriesCollection = cloneDeep(state.seriesCollection)
    let coordinateCollection = cloneDeep(rootState.scatterPlot.coordinateCollection)

    // console.log("check coordinateCollection")
    // console.log(coordinateCollection)

    //update originalTree, selectionTree, seriesCollection, coordinateCollection
    const original_parent_node = originalTree.find(node => node.children_id.includes(id2))

    //remove id2 from children_id(in the format of array) of original_parent_node
    original_parent_node.children_id = original_parent_node.children_id.filter(id => id != id2)

    const node1 = originalTree.find(node => node.id == id1)
    const node2 = originalTree.find(node => node.id == id2)

    //put node2's children_id into node1's
    node1.children_id = [...node1.children_id, ...node2.children_id]

    node1["node_name"] = "merged"

    node2.children_id.forEach(id => {
      const child_node = originalTree.find(n => n.id == id)
      child_node.parent_id = id1
    })

    //delete node2 from originalTree
    originalTree = originalTree.filter(node => node.id != id2)

    const series1 = seriesCollection.find(node => node.id == id1)
    const series2 = seriesCollection.find(node => node.id == id2)

    //make the series1.seriesData the average of series1.seriesData and series2.seriesData
    series1.seriesData = calculateAverageSeries(series1.seriesData, series2.seriesData)
    series1.node_name = "merged"

    //delete series2 from seriesCollection
    seriesCollection = seriesCollection.filter(node => node.id != id2)


    const coordinate1 = coordinateCollection['2'].find(node => node.id == id1)
    const coordinate2 = coordinateCollection['2'].find(node => node.id == id2)

    //make the coordinate1 the avarage of coordinate 1 and 2, each coordinate is a object contain key x and y
    coordinate1.x = (coordinate1.x + coordinate2.x) / 2
    coordinate1.y = (coordinate1.y + coordinate2.y) / 2

    //remove node with id2 in coordinateCollection['2']
    coordinateCollection['2'] = coordinateCollection['2'].filter(node => node.id != id2);

    //update coordinateCollection in the scatterPlot module
    commit("scatterPlot/UPDATE_COORDINATE_COLLECTION", coordinateCollection, {root: true})

    //then update originalTree, seriesCollection, coordinateCollection
    state.originalTree = originalTree
    state.seriesCollection = seriesCollection

    //update selectionTree
    state.selectionTree.forEach(node => {
      if(node.id != id2){
        const selectionNode = originalTree.find(n => n.id == node.id)
        let new_selectionNode = {}
        if(selectionNode.id != id1 && selectionNode.level == 2){
          new_selectionNode = cloneDeep(selectionNode)
          new_selectionNode.children_id = []
        }
        else if(selectionNode.id == id1 || selectionNode.level != 2){
          new_selectionNode = cloneDeep(selectionNode) 
        }
        selectionTree.push(new_selectionNode)
      }
    })
    state.selectionTree = selectionTree
  }

  export const filterSelectionTree = (selectionTree, level_id, selectedIds) => {
    // only keep selectedIds in level_id or nodes in other levels in selectionTree
    let newSelectionTree = []
    selectionTree.forEach(node => {
      if(node.level != level_id){
        newSelectionTree.push(node)
      }
      else if(node.level == level_id && selectedIds.includes(node.id)){
        newSelectionTree.push(node)
      }
    })
    return newSelectionTree
  }