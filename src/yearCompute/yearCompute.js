import { caseConfig } from "../config/caseConfig";
export  const splitLevelNodes = (originalTree) => {
    let maxId = Math.max(...originalTree.map(node => node.id));
    let maxLevel = Math.max(...originalTree.map(node => node.level));
    const timeRange = caseConfig[0].timeRange;
    const startYear = new Date(timeRange[0]).getFullYear();
    const endYear = new Date(timeRange[1]).getFullYear();

    originalTree.forEach(node => {
      if (node.level == maxLevel) {
        node.children_id = [];
        
        const newChildren = [];
        for (let i = startYear; i <= endYear; i++) {
          maxId += 1;
          const newChild = {
            id: maxId,
            parent_id: node.id,
            level: maxLevel + 1,
            children_id: [],
            node_name: `${node.node_name}-${i}`
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
export const addSplitLevel = (levels, dataset, levelName) => {
  if (!levels[dataset].includes(levelName)) {
    levels[dataset].push(levelName);
  }
  return levels
}
export const addCoordinate = (coordinateCollection, yearCoordinate, addLevelId) => {
  coordinateCollection[addLevelId] = yearCoordinate;
  return coordinateCollection
}
export const getYearSeries = (selectionTree, seriesCollection) => {
      const updatedSeriesCollection = [...seriesCollection];
      const newSeries = [];
      const processedParents = new Set();
      const timeRange = caseConfig[0].timeRange;
      const startYear = new Date(timeRange[0]).getFullYear();
      const endYear = new Date(timeRange[1]).getFullYear();
      const maxLevel = Math.max(...selectionTree.map(node => node.level));

      // 遍历 selectionTree 中的最后一层节点
      selectionTree.forEach(node => {
        if (node.level === maxLevel) {
          const parentId = node.parent_id;

          // 检查父节点是否已经处理过
          if (!processedParents.has(parentId)) {
            processedParents.add(parentId);
            const parentSeries = seriesCollection.find(series => series.id === parentId);

            if (parentSeries) {
              for (let i = startYear; i <= endYear; i++) {
                const year = i;
                const newSeriesData = parentSeries.seriesData.filter(data => new Date(data.Time).getFullYear() === year);
                const childNode = selectionTree.find(child => child.parent_id === parentId && child.node_name.endsWith(year.toString()));
                // console.log("child id is", childNode.id)
                if (childNode) {
                  newSeries.push({
                    id: childNode.id,
                    level: maxLevel,
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