<template>
  <svg class="w-full h-full">
    <path
      v-for="path in flag ? cardPaths : pre_cardPaths"
      :key="path.key"
      :d="path.d"
      fill="none"
      stroke="rgb(210, 210, 208)"
      stroke-width="0.8"
    />
  </svg>
</template>


<script>
import { computed, ref, watchEffect, nextTick } from "vue";
import { useStore } from "vuex";

export default {
  name: "LinkColumn",
  props: ["level"],
  setup(props) {
    const store = useStore();
    const selectionTree = computed(() => store.getters["tree/selectionTree"])
    const plotWidth = computed(() => store.getters["scatterPlot/plotWidth"])
    const plotHeight = computed(() => store.getters["scatterPlot/plotHeight"])
    const alignLevel = computed(() => store.getters["align/alignLevel"])
    const sectionState = computed(() => store.getters["align/sectionState"])
    const currentLevelNodes = computed(() => {
      return selectionTree.value.filter((node) => node.level == props.level); 
    });
    const flag = ref(0);
    const pre_cardPaths = ref();
    const cardPaths = computed(() => {
      let paths = [];
      currentLevelNodes.value.forEach((parentNode) => {
        parentNode.children_id.forEach((childId) => {
          const childCoords = getNodeCoords(childId, 1); 
          const parentCoords = getNodeCoords(parentNode.id, 0); 
          if (parentCoords && childCoords) {
            const controlX1 = (parentCoords.x + childCoords.x) / 2;
            const controlY1 = parentCoords.y;
            const controlX2 = (parentCoords.x + childCoords.x) / 2;
            const controlY2 = childCoords.y;
            if (alignLevel.value > 0 || sectionState.value != -1) {
              paths.push({
                d: `M ${parentCoords.x},${parentCoords.y} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${childCoords.x},${childCoords.y}`,
                key: `c-${parentNode.id}-${childId}`,
              });
            }
          }
        });
      });
      // });
      return paths; 
    });
    watchEffect(() => {
      nextTick().then(() => {
        let paths = [];
        currentLevelNodes.value.forEach((parentNode) => {
          parentNode.children_id.forEach((childId) => {
            const childCoords = getNodeCoords(childId, 1); 
            const parentCoords = getNodeCoords(parentNode.id, 0); 
            if (parentCoords && childCoords) {
              const controlX1 = (parentCoords.x + childCoords.x) / 2;
              const controlY1 = parentCoords.y;
              const controlX2 = (parentCoords.x + childCoords.x) / 2;
              const controlY2 = childCoords.y;
              paths.push({
                d: `M ${parentCoords.x},${parentCoords.y} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${childCoords.x},${childCoords.y}`,
                key: `c-${parentNode.id}-${childId}`, 
              });
            }
          });
        });
        pre_cardPaths.value = paths; 
      });
    });
    function getNodeCoords(nodeId, childFlag) {
      const element = document.getElementById(`card${nodeId}`); 
      const table = document.getElementById("tableContainer"); 
      flag.value = element ? 1 : 0;
      if (element && childFlag) {
        const { top, left, width, height } = element.getBoundingClientRect();
        const x =
          left -
          plotWidth.value * props.level -
          table.offsetLeft -
          5 -
          30 * (props.level - 1);
        const y = top - table.offsetTop + height / 2;
        return { x: x, y: y }; 
      } else if (element) {
        const { top, left, width, height } = element.getBoundingClientRect();
        const x =
          left -
          table.offsetLeft -
          plotWidth.value * (props.level - 1) -
          30 * (props.level - 1) +
          2;
        const y = top - table.offsetTop + height / 2;
        return { x: x, y: y }; 
      }
      return null; 
    }
    return {
      cardPaths,
      plotWidth,
      plotHeight,
      currentLevelNodes,
      pre_cardPaths,
      flag,
      sectionState,
      alignLevel
    };
  },
};
</script>


<style>
</style>