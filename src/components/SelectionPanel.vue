<template>
  <div class="w-full h-full" id="headerContainer">
    <div class="w-full h-[1em] name text-[1em] text-[#9E9E9E]">
      SELECTION VIEW
    </div>
    <div v-if="nodeEntities.length !== 0" class="w-full mt-[1em]" id="entityContainer">
      <EntityHeader entityName="node" :number="nodeEntities.length"> </EntityHeader>
      <NodeCard v-if="nodeVisiable" v-for="entity in nodeEntities" :key="entity.id" :id="entity.id"
        :entityID="entity.entityID" :level="entity.level" :relate="entity.flag" />
      <div v-if="nodeVisiable" class="black-line  mt-[0.3em]"></div>
    </div>
    <div v-if="pathEntities.length !== 0" class="w-full mt-[1em]">
      <EntityHeader entityName="path" :number="pathEntities.length"> </EntityHeader>
      <div v-if="pathVisiable">
        <PathCard  v-for="entity in pathEntities" :key="entity.entityID"  :id_list="entity.path"
        :level_list="entity.levelList" :entityID="entity.entityID"  :relate="entity.flag"/>
      </div>
      <div v-if="pathVisiable" class="w-full black-line mt-[0.3em]"></div>
    </div>
    <div v-if="treeEntities.length !== 0" class="w-full mt-[1em]">
      <EntityHeader entityName="tree" :number="treeEntities.length"> </EntityHeader>
      <TreeCard v-if="treeVisiable" v-for="entity in treeEntities" :key="entity.entityID" :id_list="entity.path"
        :level_list="entity.levelList" :entityID="entity.entityID" :related="false" />
      <div v-if="treeVisiable" class="black-line mx-2 mt-[0.3em]"></div>
    </div>
  </div>
</template>

<script>
import NodeCard from "./selection_panel/NodeCard.vue";
import PathCard from "./selection_panel/PathCard.vue";
import TreeCard from "./selection_panel/TreeCard.vue";
import EntityHeader from "./selection_panel/EntityHeader.vue";
import ConfigureButton from "./table/ConfigureButton.vue";

import { useStore } from "vuex";
import { computed, ref, onMounted } from "vue";
export default {
  name: "SelectionPanel",
  components: {
    NodeCard,
    PathCard,
    TreeCard,
    EntityHeader,
    ConfigureButton,
  },
  setup() {
    const store = useStore();
    const themeColor = computed(() => store.getters["color/themeColor"]);
    const headerContainer = ref(null);
    const headerHeight = ref(0);
    // const selectionHeight = ref(0)
    const entityCollection = computed(
      () => store.getters["selection/entityCollection"]
    );
    const nodeEntities = computed(() => {
      return entityCollection.value.filter((entity) => entity.type === "node");
    });
    const pathEntities = computed(() => {
      return entityCollection.value.filter((entity) => entity.type === "path");
    });
    const treeEntities = computed(() => {
      return entityCollection.value.filter((entity) => entity.type === "Tree");
    });
    const nodeVisiable = computed(() => store.getters["selection/nodeVisiable"])
    const pathVisiable = computed(() => store.getters["selection/pathVisiable"])
    const treeVisiable = computed(() => store.getters["selection/treeVisiable"])
    const width = ref(0);
    const height = ref(0);
    const entityContainer = ref();
    const entityWidth = ref(0)
    const entityHeight = ref(0)


    onMounted(() => {
      headerContainer.value = document.querySelector("#headerContainer");
      width.value = headerContainer.value.offsetWidth;
      height.value = headerContainer.value.offsetHeight;
      headerHeight.value = headerContainer.value.offsetHeight;
      headerContainer.value.style.fontSize = `${headerHeight / 300}px`;
    });

    return {
      nodeEntities,
      pathEntities,
      treeEntities,
      entityCollection,
      headerHeight,
      themeColor,
      nodeVisiable,
      pathVisiable,
      treeVisiable
    };
  },
};
</script>


<style>
.name {
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: "semibold";
  font-variation-settings: "slnt" 0;
  color: "themeColor";
}

.black-line {
  border-width: 0.09em;
  background-color: #ababab;
}
</style>