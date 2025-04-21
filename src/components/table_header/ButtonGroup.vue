<template>
  <div class="flex flex-row">
    <template v-for="button in headerButtons" :key="button.icon">
      <font-awesome-icon 
        :icon="['fas', button.icon]"
        class="mr-2 cursor-pointer"
        style="color: #ffffff"
        @click="button.action(level_id)"
      />
    </template>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, ref } from "vue";

defineProps({
  level_id: {
    type: Number
  }
});

const rankState = ref('asc')

const headerButtons = computed(() => [
  { 
    icon: 'toggle-on',
    action: (level_id) => toggleAlign(level_id)
  },
  {
    icon: 'code-merge',
    action: ()=> mergeTrees()
  },
  {
    icon: 'anchor',
    action: () => adjustSelectionTree()
  },
  {
    icon: rankState.value == 'asc' ? 'arrow-down-short-wide' : 'arrow-up-wide-short',
    action: (level_id) => {
      sortColumn(level_id, rankState.value);
      rankState.value = rankState.value == 'asc' ? 'desc' : 'asc';
    }
  },
  {
    icon: 'layer-group',
    action: (level_id) => createLayers(level_id)
  }
]);


const store = useStore();

const toggleAlign = (level_id) => {
  const alignState = computed(() => store.getters["align/alignState"]);
  if (alignState.value == false) {
    store.dispatch("align/updateAlignState", true);
    store.dispatch("align/updateAlignLevel", level_id);
    store.dispatch("align/calculateAlignID");
  } else {
    store.dispatch("align/updateAlignState", false);
    store.dispatch("align/updateAlignLevel", 1);
    store.dispatch("align/calculateAlignID");
  }
};

const mergeTrees = () => {
  const obj = { id1: 7, id2: 9 }
  store.dispatch("tree/mergeTrees", obj)
};

const adjustSelectionTree = () => {
  store.dispatch("tree/adjustSelectionTree")
};

const sortColumn = (level, mode) => {
  const selectionTree = computed(() => store.getters["tree/selectionTree"]);
  const id_list = selectionTree.value.filter((node) => node.level == level).map((node) => node.id);
  store.dispatch("tree/sortSelectionTree", {id_list: id_list,mode: mode,});
};

const createLayers = (level_id) => {
  const obj = { level_id: level_id }
  if (level_id === 3) {
    store.dispatch("tree/addLayer", obj);
  }
};
</script>
