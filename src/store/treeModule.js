import axios from "axios";
import { cloneDeep } from "lodash";
import {
  transformData,
  calculateSeriesAverage,
  calculateSeriesTrend,
} from "../computation/basicComputation";
import {
  filterSelectionTree,
  merge_trees,
} from "../computation/treeManipulation";
import { updateSelectionFromOriginal, addLevels } from "../update/updateTree";
import { addPlotScale, addYScale } from "../update/updateScale";
import { yearCoordinate } from "../year_layer_data/region_yearly_points";
import {
  splitLevelNodes,
  addLevelId,
  addSplitLevel,
  addCoordinate,
  getYearSeries,
} from "../yearCompute/yearCompute";
import {
  getTimeRange,
  getClusterNumber,
  getNormalized,
} from "../config/caseConfig";

const state = {
  originalTree: [],
  selectionTree: [],
  seriesCollection: [],
  //dataset: 'PV',
  //dataset: 'Stock',
  dataset: "Tour_Seasonal",
  levels: {
    PV: ["Transformer", "Inverter", "String"],
    Stock: ["Index", "Sector", "Stock"],
    Tour_Seasonal: ["Country", "State", "Region"],
  },
  description: ["-kw/h", "-kw/h", "-mA", "-mA"],
  level_id_list: [],
  timeRange: [],
  groupState: false,
  yearCoordinate,
  lastDraggedNodeId: 2,
  splitNodes: false,
};

const mutations = {
  UPDATE_ORIGINAL_TREE(state, payload) {
    state.originalTree = payload;
  },
  UPDATE_SELECTION_TREE(state, payload) {
    state.selectionTree = payload;
  },
  UPDATE_SERIES_COLLECTION(state, payload) {
    state.seriesCollection = payload;
  },
  UPDATE_TIME_RANGE(state, payload) {
    state.timeRange = payload;
  },
  UPDATE_LEVEL_ID_LIST(state, payload) {
    state.level_id_list = payload;
  },
  UPDATE_LEVELS(state, payload) {
    state.levels = payload;
  },
  SET_LAST_DRAGGED_NODE_ID(state, nodeId) {
    state.lastDraggedNodeId = nodeId;
  },
};

const actions = {
  getTree({ state, dispatch, commit }) {
    axios.post("/api/Tree", { dataset: state.dataset }).then((response) => {
      commit("UPDATE_ORIGINAL_TREE", response.data.Tree);
      dispatch(
        "addToSelectionTree",
        cloneDeep(state.originalTree).filter((node) => node["level"] == 1)
      );
    });
  },
  updateSelectionTree({ state, commit, dispatch }, currentSelectionTree) {
    commit("UPDATE_SELECTION_TREE", currentSelectionTree);
    if (
      state.level_id_list.length !=
        [...new Set(currentSelectionTree.map((node) => node.level))].length &&
      state.groupState == false
    ) {
      dispatch("updateLevelIdList", [
        ...new Set(currentSelectionTree.map((node) => node.level)),
      ]);
    }
    if (state.splitNodes == true) {
      commit(
        "UPDATE_SERIES_COLLECTION",
        getYearSeries(state.selectionTree, state.seriesCollection)
      );
    } else {
      dispatch("getSeriesCollection", currentSelectionTree);
    }
  },
  getSeriesCollection({ state, rootState, commit, dispatch }, selectionTree) {
    const timeRange = rootState.tree.timeRange;
    const obj = {
      selectionTree: selectionTree,
      dataset: state.dataset,
      timeRange: timeRange,
    };
    axios.post("/api/SeriesCollection", obj).then((response) => {
      const newSeriesCollection = response.data.seriesCollection.map((node) => {
        return {
          ...node,
          seriesData: transformData(node.seriesData),
          rawData: transformData(node.rawData),
        };
      });
      commit("UPDATE_SERIES_COLLECTION", newSeriesCollection);
      if (state.groupState == false) {
        dispatch("size/updateScale", newSeriesCollection, { root: true });
      }
    });
  },
  sortSelectionTree({ state, commit }, obj) {
    let updatedSelectionTree = [...state.selectionTree];
    const averageMap = new Map();
    state.selectionTree.forEach((node) => {
      if (obj.id_list.includes(node.id)) {
        const seriesNode = state.seriesCollection.find(
          (item) => item.id === node.id
        );
        let average = 0;
        average = seriesNode
          ? !getNormalized(state.dataset)
            ? calculateSeriesAverage(seriesNode.seriesData)
            : calculateSeriesTrend(seriesNode.rawData)
          : 0;
        averageMap.set(node.id, average);
        console.log("averageMap is", averageMap);
      }
    });
    updatedSelectionTree = updatedSelectionTree.map((node) => {
      if (obj.id_list.includes(node.id)) {
        return { ...node, average: averageMap.get(node.id) };
      }
      return node;
    });
    updatedSelectionTree.sort((a, b) =>
      obj.id_list.includes(a.id) && obj.id_list.includes(b.id)
        ? obj.mode == "desc"
          ? b.average - a.average
          : a.average - b.average
        : 0
    );
    updatedSelectionTree = updatedSelectionTree.map(
      ({ average, ...node }) => node
    );
    commit("UPDATE_SELECTION_TREE", updatedSelectionTree);
  },
  updateTimeRange({ state, commit, dispatch, rootState }, newTimeRange) {
    if (getTimeRange(state.dataset).length != 0) {
      newTimeRange = getTimeRange(state.dataset);
    }
    commit("UPDATE_TIME_RANGE", newTimeRange);
    commit("time/UPDATE_START_TIME", newTimeRange[0], { root: true });
    commit("time/UPDATE_END_TIME", newTimeRange[1], { root: true });
    dispatch("getSeriesCollection", state.selectionTree);
    dispatch("scatterPlot/getCoordinateCollection", null, { root: true });
  },
  selectNodeAndChildren({ state, dispatch }, id) {
    const nodesToAdd = [];
    const findChildren = (parentId) => {
      state.originalTree.forEach((node) => {
        if (node.parent_id == parentId) {
          const new_node = cloneDeep(node);
          new_node.leaf = node.children_id.length == 0;
          nodesToAdd.push(new_node);
        }
      });
    };
    findChildren(id);
    // console.log("nodes is",nodesToAdd)
    dispatch("addToSelectionTree", nodesToAdd);
  },
  deselectNodeAndChildren({ state, dispatch }, id) {
    const nodesToRemove = [];
    const nodeToDeselect = state.selectionTree.find((node) => node.id == id);
    nodeToDeselect.children_id = [];

    const findChildren = (parentId) => {
      state.originalTree.forEach((node) => {
        if (node.parent_id === parentId) {
          const new_node = cloneDeep(node);
          nodesToRemove.push(new_node);
          findChildren(node.id); // find children recursively
        }
      });
    };
    findChildren(id);
    if (nodesToRemove.length > 0) {
      dispatch("removeFromSelectionTree", nodesToRemove);
    }
  },
  addToSelectionTree({ state, commit, dispatch }, nodes) {
    let currentSelectionTree = state.selectionTree;
    nodes.forEach((node) => {
      if (!currentSelectionTree.some((n) => n.id == node.id)) {
        const nodeToUpdate = currentSelectionTree.find(
          (n) => n.id === node.parent_id
        );
        if (nodeToUpdate) {
          nodeToUpdate.children_id.push(node.id);
        }
        node.children_id = [];
        currentSelectionTree.push(node);
      }
    });
    dispatch("updateSelectionTree", currentSelectionTree);
  },
  addRelatedToSelectionTree({ state, commit, dispatch }, nodes) {
    let currentSelectionTree = state.selectionTree;
    nodes.forEach((node) => {
      currentSelectionTree.push(node);
    });
    dispatch("updateSelectionTree", currentSelectionTree);
  },
  removeFromSelectionTree({ state, dispatch }, nodesToRemove) {
    let currentSelectionTree = state.selectionTree;
    currentSelectionTree = currentSelectionTree.filter(
      (node) => !nodesToRemove.some((n) => n.id === node.id)
    );
    dispatch("updateSelectionTree", currentSelectionTree);
  },
  updateLevelIdList({ commit, dispatch }, level_id_list) {
    commit("UPDATE_LEVEL_ID_LIST", level_id_list);
    dispatch("scatterPlot/getCoordinateCollection", null, { root: true });
  },
  addLevelToLevelIdList({ state, dispatch }) {
    const max = Math.max(...state.level_id_list);
    state.level_id_list.push(max + 1);
    dispatch("updateLevelIdList", state.level_id_list);
  },
  addLayer({ state, dispatch, commit, rootState }, obj) {
    state.groupState = true;
    obj = {
      ...obj,
      dataset: state.dataset,
      clusterNumber: rootState.scatterPlot.kValue,
    };
    axios.post("/api/addLayer", obj).then((response) => {
      commit("UPDATE_ORIGINAL_TREE", response.data.newOriginalTree); // originalTree
      dispatch(
        "updateSelectionTree",
        updateSelectionFromOriginal(
          state.selectionTree,
          state.originalTree,
          obj.level_id
        )
      ); // selectionTree & seriesCollection
      commit(
        "UPDATE_LEVEL_ID_LIST",
        [...new Set(state.selectionTree.map((node) => node.level))].sort(
          (a, b) => a - b
        )
      ); // level_id_list
      commit(
        "UPDATE_LEVELS",
        addLevels(state.levels, obj.level_id, state.dataset)
      ); // levels
      commit(
        "size/UPDATE_Y_SCALE",
        addYScale(rootState.size.yScale, obj.level_id),
        { root: true }
      ); // yScale
      commit(
        "scatterPlot/UPDATE_COORDINATE_COLLECTION",
        response.data.newCoordinateCollection,
        { root: true }
      ); // coordinateCollection
      const { plotX, plotY } = addPlotScale(
        rootState.scatterPlot.plot_X_Scale,
        rootState.scatterPlot.plot_Y_Scale,
        obj.level_id
      );
      commit("scatterPlot/UPDATE_PLOT_X_SCALE", plotX, { root: true }); //plot_x_scale
      commit("scatterPlot/UPDATE_PLOT_Y_SCALE", plotY, { root: true }); //plot_y_scale
    });
  },
  addYearLayer({ state, dispatch, commit, rootState }, obj) {
    state.splitNodes = true;
    const yearTree = splitLevelNodes(state.originalTree);
    console.log("yearTree is", yearTree);
    const newLevelId = Math.max(...state.level_id_list) + 1;
    commit("UPDATE_ORIGINAL_TREE", yearTree);
    commit("UPDATE_LEVEL_ID_LIST", addLevelId(state.level_id_list, newLevelId));
    commit("UPDATE_LEVELS", addSplitLevel(state.levels, state.dataset, state.levels[state.dataset][state.levels[state.dataset].length-1]+"_Year"));
    commit(
      "scatterPlot/UPDATE_COORDINATE_COLLECTION",
      addCoordinate(rootState.scatterPlot.coordinateCollection, yearCoordinate, newLevelId),
      { root: true }
    );
    dispatch("scatterPlot/updatePlotScale", null, { root: true });
  },
  mergeTrees({ state, commit, rootState }, obj) {
    merge_trees({ state, commit, rootState }, obj);
  },
  deleteNodes({ state, dispatch }, deleteIds) {
    const level_id = state.selectionTree.find(node => node.id == deleteIds[0]).level
    console.log("check level")
    console.log(level_id)
    console.log(state.level_id_list)
    if (level_id == state.level_id_list.length){
      let selectionTree = cloneDeep(state.selectionTree);
      const parent_id_list = new Set(selectionTree.filter(node => deleteIds.includes(node.id)).map(node => node.parent_id))
      selectionTree = selectionTree.filter(
        (node) => !deleteIds.includes(node.id)
      );
      parent_id_list.forEach(parent_id => {
        const parent_node = selectionTree.find((node) => node.id == parent_id);
        if (parent_node) {
          parent_node.children_id = parent_node.children_id.filter(
            (id) => !deleteIds.includes(id)
          );
        }
      });
      state.selectionTree = selectionTree;
    }
    else if (level_id == state.level_id_list.length - 1){
      deleteIds.forEach(id => {
        const node = state.selectionTree.find(node => node.id == id)
        if(node.children_id != []){
          dispatch('deselectNodeAndChildren', id)
        }
      })
    }

  },
  adjustSelectionTree({ state, commit, rootState },level_id) {
    const lastDraggedNodeId = state.lastDraggedNodeId;
    const coordinateCollection = rootState.scatterPlot.coordinateCollection;

    const levelNodes = state.selectionTree.filter(
      (n) => n.level === level_id
    );
    const pivotId = lastDraggedNodeId ?? 1;
    const pivotArr = coordinateCollection[level_id]?.find(
      (p) => p.id === pivotId
    );
    if (!pivotArr) {
      console.warn("找不到基准节点坐标，跳过排序");
      commit("UPDATE_SELECTION_TREE", cloneDeep(state.selectionTree));
      return;
    }
    const { x: px, y: py } = pivotArr;
    const distList = levelNodes
      .filter((n) => n.id !== 1) 
      .map((n) => {
        const pos = coordinateCollection[level_id]?.find(
          (p) => p.id === n.id
        );
        if (!pos) return { id: n.id, dist: Infinity };
        const dx = pos.x - px;
        const dy = pos.y - py;
        return { id: n.id, dist: Math.sqrt(dx * dx + dy * dy) };
      })
      .sort((a, b) => a.dist - b.dist)
      .map((item) => item.id);
    // const sequence = [1, ...distList];
    const sequence = [1, 6, 5, 9, 8, 4, 2, 3, 7]
    const newSelectionTree = cloneDeep(state.selectionTree);
    newSelectionTree.sort(
      (a, b) => sequence.indexOf(a.id) - sequence.indexOf(b.id)
    );

    commit("UPDATE_SELECTION_TREE", newSelectionTree);
  },
  filterSelectionTree({ state, commit }, obj) {
    const level_id = obj.level_id;
    const selectedIds = obj.selectedIds;
    commit(
      "UPDATE_SELECTION_TREE",
      filterSelectionTree(state.selectionTree, level_id, selectedIds)
    );
  },
  setLastDraggedNodeId({ commit }, nodeId) {
    commit("SET_LAST_DRAGGED_NODE_ID", nodeId);
  },
  // actions
  moveNodeToTop({ state, commit, dispatch }, { level, nodeId }) {
    const levelNodes = state.selectionTree.filter((n) => n.level === level);

    // 2. 构造 sequence
    const sequence = [1, nodeId]; 
    levelNodes.forEach((n) => {
      if (!sequence.includes(n.id)) {
        sequence.push(n.id);
      }
    });
    const newSelectionTree = cloneDeep(state.selectionTree);
    newSelectionTree.sort(
      (a, b) => sequence.indexOf(a.id) - sequence.indexOf(b.id)
    );
    commit("UPDATE_SELECTION_TREE", newSelectionTree);
    dispatch("setLastDraggedNodeId", nodeId);
  },
};

const getters = {
  originalTree: (state) => state.originalTree,
  selectionTree: (state) => state.selectionTree,
  seriesCollection: (state) => state.seriesCollection,
  dataset: (state) => state.dataset,
  levels: (state) => state.levels,
  level_id_list: (state) => state.level_id_list,
  description: (state) => state.description,
  timeRange: (state) => state.timeRange,
  groupState: (state) => state.groupState,
  year_tree: (state) => state.year_tree,
};

const treeModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

export default treeModule;
