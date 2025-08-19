<template>
  <div class="w-[5em] h-full flex flex-row content-center">
    <font-awesome-icon :icon="['fas',  iconType]" size="lg" :style="{ color: iconColor }" @click="toggleIcon" class="cursor-pointer"/>
    <div class="ml-[0.4em] mt-[0.15em] h-full name  text-[0.9em]" :style="{ color: textColor }">{{ entityName }}
    </div>
    <div class=" mt-[0.15em] h-full name text-[0.9em] " :style="{ color: numberColor }">
      ({{ number }})
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, onMounted, watch, watchEffect } from "vue";

export default {
  name: "EntityHeader",
  props: ["entityName", "number", 'entityVisiable'],
  setup(props) {
    const store = useStore();
    const isClicked = ref(false);
    const toggleIcon = () => {
      isClicked.value = !isClicked.value;
      if(props.entityName === "node"){
        store.dispatch("selection/updateNodeVisiable", isClicked.value);
      }
      if(props.entityName === "path"){
        store.dispatch("selection/updatePathVisiable", isClicked.value);
      }
      if(props.entityName === "tree"){
        store.dispatch("selection/updateTreeVisiable", isClicked.value);
      }
      
    };
    const themeColor = computed(() => store.getters["color/themeColor"]);
    const iconType = computed(() => (isClicked.value ? 'caret-down' : 'caret-right'));
    const iconColor = computed(() => (isClicked.value ? themeColor.value : '#888888'));
    const textColor = computed(() => (isClicked.value ? themeColor.value : '#888888'));
    const numberColor = computed(() => (isClicked.value ? themeColor.value : '#888888'));
    onMounted(() => {
      if(props.entityName === "node"){
        store.dispatch("selection/updateNodeVisiable", isClicked.value);
      }
      if(props.entityName === "path"){
        store.dispatch("selection/updatePathVisiable", isClicked.value);
      }
      if(props.entityName === "tree"){
        store.dispatch("selection/updateTreeVisiable", isClicked.value);
      }
    })
    return { themeColor, iconType, iconColor, textColor, numberColor, toggleIcon };
  },
};
</script>

<style scoped>
.circleNumber {
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: "semibold";
  font-variation-settings: "slnt" 0;
}

.name {
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: "semibold";
  font-variation-settings: "slnt" 0;
}
</style>