export const findPath = (targetId, selectionTree) => {
    // 辅助函数，通过ID获取节点
    const getNodeById = (id) => selectionTree.find(node => node.id === id);

    // 从目标节点追溯到根节点的路径
    const traceToRoot = (nodeId, path = []) => {
        const node = getNodeById(nodeId);
        if (node) {
            path.unshift(node.id); // 添加到路径的开头
            if (node.parent_id !== 0) {
                traceToRoot(node.parent_id, path); // 递归追溯父节点
            }
        }
        return path;
    };

    // 从目标节点遍历到所有叶节点的路径
    const expandToLeaves = (nodeId, basePath, allPaths) => {
        const node = getNodeById(nodeId);
        if (node) {
            const newPath = basePath.concat(node.id); // 创建新路径
            if (node.children_id.length === 0) {
                allPaths.push(newPath); // 如果是叶节点，添加到所有路径中
            } else {
                node.children_id.forEach(childId => {
                    expandToLeaves(childId, newPath, allPaths); // 递归子节点
                });
            }
        }
    };

    // 先找到目标节点到根节点的路径
    const pathToRoot = traceToRoot(targetId);
    // 初始化最终所有路径的数组
    const allPaths = [];
    // 从目标节点扩展到所有叶节点
    expandToLeaves(targetId, pathToRoot.slice(0, -1), allPaths); // 使用slice去除目标节点ID，因为expandToLeaves会重新添加

    return allPaths;
}

export const findLevelList = (selectionTree, path) => {
    const levelList = [];
    path.forEach(nodeId => {
        const node = selectionTree.find(n => n.id === nodeId);
        if (node) {
            levelList.push(node.level);
        }
    });
    return levelList;
}

export const buildSubtree = (selectionTree, rootId) => {
    const node = selectionTree.find(n => n.id === rootId);
    if (!node) return null; // 如果没有找到节点，返回null

    // 构建子树
    return {
        ...node,
        children: node.children_id.map(childId => buildSubtree(selectionTree, childId)).filter(child => child !== null),
    };
}

export const getSubtreeIds = (subtree) => {
    let ids = [];

    // 辅助递归函数，遍历子树并收集所有ID
    function traverse(node) {
        if (!node) return;
        ids.push(node.id);
        if (node.children) {
            node.children.forEach(child => traverse(child));
        }
    }

    traverse(subtree); // 开始遍历子树
    return ids;
}

export const calculatePearsonCorrelation = (series1, series2) => {
    const values1 = series1.data.map(item => item.value);
    const values2 = series2.data.map(item => item.value);
    // 计算各自的平均值
    const average1 = values1.reduce((acc, val) => acc + val, 0) / values1.length;
    const average2 = values2.reduce((acc, val) => acc + val, 0) / values2.length;
    // 计算皮尔逊相关系数
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    for (let i = 0; i < values1.length; i++) {
        numerator += (values1[i] - average1) * (values2[i] - average2);
        denominator1 += (values1[i] - average1) ** 2;
        denominator2 += (values2[i] - average2) ** 2;
    }
    if (denominator1 === 0 || denominator2 === 0) return 0; // 避免除以零
    return numerator / Math.sqrt(denominator1 * denominator2);
}