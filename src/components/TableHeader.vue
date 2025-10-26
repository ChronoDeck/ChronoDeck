<template>
  <div class="w-full h-full">
    <div class="w-full h-full rounded-md flex flex-col" id="headerContainer">
      <div class="flex flex-row h-1/8 w-full " >
        <div v-for="(level_name, index) in level_name_list" :key="level_name" class="flex flex-row h-full" :style="{
          width: headerContainer?.offsetWidth * columnPercentage + 'px',
        }">
          <div 
          class="h-full flex flex-row items-center" 
          :style="{width:headerContainer?.offsetWidth * columnPercentage - 30 + 'px',backgroundColor: themeColor,}"
          >
            <div class="ml-2 text-ms font-serif text-center text-white title">
              {{ level_name }}
            </div>
            <div class="flex-1 h-full"></div>
            <ButtonGroup :level_id="level_id_list[index]" />
          </div>
          <div class="h-full px-0.5px  cursor-pointer flex flex-row justify-center items-center"
            :style="{ width: 30 + 'px' }">
          </div>
        </div>
      </div>
      <div class="w-full h-7/8 py-1 " style="position: relative; z-index: 2" >
        <div class="w-full h-full flex flex-row" id="plotContainer">
          <div 
          class="h-full" 
          :style="{ width: dynamicWidth + 'px' }" 
          @mousedown="startDrawing" 
          @mousemove="drawing"
          @mouseup="finishLine" 
          @dblclick.prevent="finishDrawing">
            <svg class="h-full" :style="{ width: dynamicWidth + 'px' }">
              <g>
                <!-- 实时绘制的线段 -->
                <line 
                v-if="tempEndPoint && points.length > 0" 
                :x1="points.slice(-1)[0][0]" 
                :y1="points.slice(-1)[0][1]"
                :x2="tempEndPoint[0]" 
                :y2="tempEndPoint[1]" 
                stroke="#DF1C33" 
                style="stroke-width:4" />
                <!-- 实时绘制的Lasso区域 -->
                <polygon 
                v-if="points.length >= 3" 
                :points="pointsToString" 
                fill="red" 
                fill-opacity="0.2" 
                stroke="#DF1C33"
                stroke-width="4" />
                <!-- 现有的Lasso区域边界 -->
                <polyline 
                :points="pointsToString" 
                fill="none" 
                stroke="#DF1C33" 
                store-width="4" />
                <!-- 现有的Lasso区域端点 -->
                <circle 
                v-for="point in points" 
                :key=point[0] 
                :cx=point[0] 
                :cy=point[1]
                :r="4" 
                fill="white"
                stroke="#DF1C33" />

                <!-- 1. Background rectangles -->
                <g 
                v-for="(level_name, index) in level_name_list" 
                :key="'background-'+level_name"
                :transform="'translate(' + headerContainer?.offsetWidth * columnPercentage * index +', 0)'"
                >
                  <rect 
                    x="0" 
                    y="0" 
                    :width="headerContainer?.offsetWidth * columnPercentage - 30" 
                    height="100%"
                    stroke="#e5e7eb" 
                    stroke-width="2" 
                    fill="none" 
                    rx="5"
                  >
                  </rect>
                </g>

                <path 
                v-for="pathObj in bezierPaths" 
                :key="pathObj.key" 
                :d="pathObj.d" 
                stroke="rgb(243,194,18)"
                stroke-width="2" 
                fill="none" 
                fill-opacity="0.5" />

                <g
                id="movedPaths">
                </g>

                <!-- 2. Non-selected circles -->
                <g 
                v-for="(level_name, index) in level_name_list" 
                :key="'non-selected-'+level_name"
                :transform="'translate(' + headerContainer?.offsetWidth * columnPercentage * index +', 0)'"
                >
                  <circle 
                  v-for="circle in circlesData[level_id_list[index]].filter((circle) => !hasNode(selectionTree, circle.key))" 
                  class="node cursor-pointer" 
                  :id="'node' + circle.key" 
                  :key="circle.key" 
                  :cx="circle.cx"
                  :cy="circle.cy" 
                  :r="circle.r" 
                  :fill="themeColor" 
                  :fill-opacity="circle.fillOpacity"
                  :stroke="circle.stroke" 
                  :stroke-width="circle.strokeWidth">
                  </circle>
                </g>

                <!-- 3. Folded nodes -->
                <g 
                v-for="(level_name, index) in level_name_list" 
                :key="'folded-'+level_name"
                :transform="'translate(' + headerContainer?.offsetWidth * columnPercentage * index +', 0)'"
                >
                  <circle 
                  v-for="circle in circlesData[level_id_list[index]].filter((circle) =>hasNode(selectionTree, circle.key) && !ifEmphasize(selectionTree,circle.key,level_id_list[index],level_id_list))" 
                  class="node cursor-pointer foldNode" 
                  :id="'node' + circle.key" 
                  :key="circle.key" 
                  :cx="circle.cx"
                  :cy="circle.cy" 
                  :r="circle.r" 
                  :fill="themeColor"
                  :fill-opacity="clusterVisible ? 0.05 : circle.fillOpacity"
                  :stroke="clusterVisible ? 'none' : circle.stroke" 
                  :stroke-width="circle.strokeWidth">
                  </circle>
                </g>

                <!-- 4. Yellow paths -->
                <g
                id="originalPaths">
                  <path 
                  v-for="pathObj in selectNodePaths" 
                  v-if="linkVisible" 
                  :key="pathObj.key" 
                  :d="pathObj.d"
                  stroke="rgba(243,194,18)" 
                  stroke-width="2" 
                  fill="none" 
                  class="emphasizeLink cursor-pointer"
                  :id="pathObj.key" />
                </g> 

                <!-- 5. Emphasized nodes (top layer) -->
                <g 
                v-for="(level_name, index) in level_name_list" 
                :key="'emphasized-'+level_name"
                :transform="'translate(' + headerContainer?.offsetWidth * columnPercentage * index +', 0)'"
                >
                  <circle 
                  v-for="circle in circlesData[level_id_list[index]].filter((circle) => ifEmphasize(selectionTree,circle.key,level_id_list[index],level_id_list))" 
                  class="node cursor-pointer emphasizeNode" 
                  :id="'node' + circle.key" 
                  :key="circle.key"
                  :cx="circle.cx" 
                  :cy="circle.cy" 
                  :r="circle.r" 
                  :fill="themeColor"
                  :fill-opacity="clusterVisible ? 0.05 : circle.fillOpacity"
                  :stroke="clusterVisible ? 'none' : circle.stroke" 
                  :stroke-width="circle.strokeWidth">
                  </circle>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, ref, onMounted } from "vue";
import { calculatePlotLinks, calculateCircles, hasChildren, ifEmphasize, hasNode } from "../computation/treeComputation";
import { isPointInPolygon, isIdInSelectionTree } from "../select/lassoSelection";
import ButtonGroup from './table_header/ButtonGroup.vue';

const headerContainer = ref(null);
const plotContainer = ref(null);
const store = useStore();
const columnPercentage = computed(() => store.getters["size/columnPercentage"]);
const linkVisible = computed(() => store.getters["scatterPlot/linkVisible"]);
const dataset = computed(() => store.getters["tree/dataset"]);
const themeColor = computed(() => store.getters["color/themeColor"]);
const selectionTree = computed(() => store.getters["tree/selectionTree"]);
const levels = computed(() => store.getters["tree/levels"]);
const level_id_list = computed(() => store.getters["tree/level_id_list"]);
const level_name_list = computed(() => level_id_list.value.map((id) => levels.value[dataset.value][id - 1]));
const clusterVisible = computed(() => store.getters["scatterPlot/clusterVisible"]);
const bezierPaths = computed(() => store.getters["scatterPlot/bezierPaths"]);
const plot_X_Scale = computed(() => store.getters["scatterPlot/plot_X_Scale"]);
const plot_Y_Scale = computed(() => store.getters["scatterPlot/plot_Y_Scale"]);
const coordinateCollection = computed(() => store.getters["scatterPlot/coordinateCollection"]);

const dynamicWidth = computed(() => {
  if (headerContainer.value && level_name_list.value) {
    return headerContainer.value.offsetWidth * columnPercentage.value * level_name_list.value.length;
  }
  return 0;
});

const selectNodePaths = computed(() => {
  let allPaths = [];
  const newTree = selectionTree.value.filter((node) =>
    ifEmphasize(
      selectionTree.value,
      node.id,
      node.level,
      level_id_list.value
    )
  );
  newTree.forEach((node) => {
    if (hasChildren(selectionTree.value, node.id)) {
      const pathsForNode = calculatePlotLinks(
        node.id,
        selectionTree.value,
        coordinateCollection.value,
        plot_X_Scale.value,
        plot_Y_Scale.value,
        headerContainer.value.offsetWidth * columnPercentage.value,
        level_id_list.value
      );
      allPaths = allPaths.concat(pathsForNode);
    }
  });
  return allPaths;
});

const circlesData = computed(() => {
  return calculateCircles(
    level_id_list.value,
    coordinateCollection.value,
    plot_X_Scale.value,
    plot_Y_Scale.value,
    selectionTree.value
  );
});

//lasso function
const canDraw = ref(false); // 控制是否可以开始绘制
const points = ref([]); // 存储多边形的顶点
const tempEndPoint = ref(null); // 存储实时拖动时的临时终点

const startDrawing = (event) => {
  if (!canDraw.value || points.value.length === 0) {
    canDraw.value = true;
    tempEndPoint.value = null; 
    points.value.push([event.offsetX, event.offsetY]);
    event.preventDefault();
  }
};

const drawing = (event) => {
  if (canDraw.value) {
    tempEndPoint.value = [event.offsetX, event.offsetY];
    event.preventDefault();
  }
};

const finishLine = (event) => {
  if (canDraw.value && points.value.length > 0) {
    points.value.push([event.offsetX, event.offsetY]);
    tempEndPoint.value = null; 
  }
};

const finishDrawing = () => {
  if (points.value.length > 2) {
    console.log("finishDrawing")
    canDraw.value = false;
    points.value.push(points.value[0]); 
    
    // Calculate which level column was drawn in based on x-coordinate of first point
    const columnWidth = headerContainer.value.offsetWidth * columnPercentage.value;
    const levelIndex = Math.floor(points.value[0][0] / columnWidth);
    const level_id = level_id_list.value[levelIndex];
    
    // Process the selection immediately
    processSelectedCircles(level_id);
  }
};

//选中之后的过滤函数
const processSelectedCircles = (level_id) => {
  let selectedCircleIds = [];
  const offset = headerContainer.value.offsetWidth * columnPercentage.value * (level_id - 1);
  selectedCircleIds = circlesData.value[level_id].filter(circle => isPointInPolygon([circle.cx, circle.cy], points.value, offset)).map(circle => circle.key);
  const filteredSelectedCircleIds = selectedCircleIds.filter((id) =>isIdInSelectionTree(id, selectionTree.value));
  const hasAnySelectedNodeChildren = filteredSelectedCircleIds.some((id) => hasChildren(selectionTree.value, id));
  const deleteIds = selectionTree.value.filter(node => node.level == level_id).filter(node => !filteredSelectedCircleIds.includes(node.id)).map(node => node.id)
  store.dispatch("tree/deleteNodes", deleteIds)
  points.value = [];
};
const pointsToString = computed(() => {
  return points.value.map((point) => point.join(",")).join(" ");
});

onMounted(() => {
  headerContainer.value = document.querySelector("#headerContainer");
  plotContainer.value = document.querySelector("#plotContainer");
  store.dispatch("scatterPlot/updatePlotWidth", headerContainer.value.offsetWidth * columnPercentage.value - 30);
  store.dispatch("scatterPlot/updateColumnWidth", headerContainer.value.offsetWidth * columnPercentage.value);
  store.dispatch("scatterPlot/updatePlotHeight", plotContainer.value.offsetHeight);
});
</script>

<style>
.title {
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: "semibold";
  font-variation-settings: "slnt" 0;
}
</style>