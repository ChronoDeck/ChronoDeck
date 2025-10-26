import { cloneDeep } from 'lodash'

export const updateSelectionFromOriginal = (oldSelectionTree, newOriginalTree, level_id) => {
    // change chidren_id of upper layer, push current added layer, and change parent_id of grouped layer
    let newSelectionTree = cloneDeep(oldSelectionTree)
    const node_list = newSelectionTree.filter(node => node.level === level_id);

    const parent_id_list = new Set(node_list.map(node => node.parent_id))
    parent_id_list.forEach(id => {
        const parent_node = newSelectionTree.find(node => node.id == id)
        parent_node.children_id = []
    })

    const newOriginalTree_copy = cloneDeep(newOriginalTree)
    const new_added_node_list = newOriginalTree_copy.filter(node => parent_id_list.has(node.parent_id))
    // make the children_id of node in new_added_node_list as empty list
    new_added_node_list.forEach(node => {
        node.children_id = []
        const parent_node = newSelectionTree.find(parent_node => parent_node.id == node.parent_id)
        parent_node.init = true
        parent_node.children_id.push(node.id)
    })
    newSelectionTree.push(...new_added_node_list)



    node_list.forEach(Node1 => {
        const parentIndex = newSelectionTree.findIndex(node => node.id === Node1.parent_id);
        // if (parentIndex != -1 && newSelectionTree[parentIndex].init != true) {
        //     newSelectionTree[parentIndex].init = true
        // }

        const Node2 = newOriginalTree.find(node =>
            node.level === level_id &&
            node.parent_id === Node1.parent_id &&
            node.children_id.includes(Node1.id)
        );

        // If Node2 is found
        if (Node2) {
            // if (!newSelectionTree.some(node => node.id === Node2.id)) {
            //     newSelectionTree.push({...Node2}); 
            // }

            // Update Node1's parent_id and level, and ensure Node2.id is in its parent's children_id
            const Node1Index = newSelectionTree.findIndex(node => node.id === Node1.id);
            const Node2Index = newSelectionTree.findIndex(node => node.id === Node2.id);
            if (Node1Index !== -1 && Node2Index !== -1) {
                newSelectionTree[Node1Index].parent_id = Node2.id;
                newSelectionTree[Node1Index].level = level_id + 1;
                newSelectionTree[Node2Index].children_id.push(Node1.id);
            }
        }
    });

    return newSelectionTree;
}

export const addLevels = (levels, level_id,dataset) => {
    const levels_copy = cloneDeep(levels)
    const level_name = levels_copy[dataset][level_id - 1]
    const grouped_level_name = "Group_" + level_name
    levels_copy[dataset].splice(level_id - 1, 0, grouped_level_name)
    return levels_copy 
}

export const updateSeriesCollection = (seriesCollection, level_id) => {
    const collection = cloneDeep(seriesCollection)
    collection.forEach(series => {
        if(series.level == level_id){
            series.level = level_id + 1
        }
    })
    return collection
}
