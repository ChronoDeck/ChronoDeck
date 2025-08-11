export  const splitLevel4Nodes = (originalTree) => {
    // 找到最大的id
    let maxId = Math.max(...originalTree.map(node => node.id));
  
    // 遍历 originalTree，找到 level 为 4 的节点
    originalTree.forEach(node => {
      if (node.level === 4) {
        // 初始化第四层节点的 children_id 属性
        node.children_id = [];
        
        // 添加八个 children 节点
        const newChildren = [];
        for (let i = 0; i < 8; i++) {
          maxId += 1;
          const newChild = {
            id: maxId,
            parent_id: node.id,
            level: 5,
            children_id: [],
            node_name: `${node.node_name}-${2010+i}`
          };
          newChildren.push(newChild);
          node.children_id.push(newChild.id);
        }
        // 将新的 children 节点添加到 originalTree
        originalTree.push(...newChildren);
      }
    });
  
    return originalTree;
  }

 export const addLevelId = (level_id_list, levelId) => {
    if (!level_id_list.includes(levelId)) {
      level_id_list.push(levelId);
    }
    return level_id_list
}
export const addSplitLevel = (levels, levelName) => {
  if (!levels.Tour_Seasonal.includes(levelName)) {
    levels.Tour_Seasonal.push(levelName);
  }
  return levels
}
export const addCoordinate = (coordinateCollection, yearCoordinate) => {
  coordinateCollection[5] = yearCoordinate;
  return coordinateCollection
}
export const getYearSeries = (selectionTree, seriesCollection) => {
      const updatedSeriesCollection = [...seriesCollection];
      const newSeries = [];
      const processedParents = new Set();

      // 遍历 selectionTree 中的第五层节点
      selectionTree.forEach(node => {
        if (node.level === 5) {
          const parentId = node.parent_id;

          // 检查父节点是否已经处理过
          if (!processedParents.has(parentId)) {
            processedParents.add(parentId);
            const parentSeries = seriesCollection.find(series => series.id === parentId);

            if (parentSeries) {
              for (let i = 0; i < 8; i++) {
                const year = 2010 + i;
                const newSeriesData = parentSeries.seriesData.filter(data => new Date(data.Time).getFullYear() === year);
                const childNode = selectionTree.find(child => child.parent_id === parentId && child.node_name.endsWith(year.toString()));
                // console.log("child id is", childNode.id)
                if (childNode) {
                  newSeries.push({
                    id: childNode.id,
                    level: 5,
                    node_name: childNode.node_name,
                    rawData: [],  // 根据需求填充
                    seriesData: newSeriesData,
                  });
                }
              }
            }
          }
        }
      });
      // console.log("new serise is", [...updatedSeriesCollection, ...newSeries])
      return [...updatedSeriesCollection, ...newSeries]
}