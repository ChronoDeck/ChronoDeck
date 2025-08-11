<template>
    <div v-if="zoomVisiable" class="absolute top-0 left-0 w-full h-full bg-light-300 bg-opacity-50 z-20"></div>
    <div class="w-full h-full flex flex-col TableCss overflow overflow-x-scroll">
        <div class="w-full h-1/4">
            <TableHeader />
        </div>
        <div :style="`height: ${height}px`" class="w-full flex flex-row">
            <div 
                v-for="level_id in level_id_list"
                :key="level_id"
                @click="showBarChart()"
                class="cursor-pointer  h-full w-1/4 "
            >
                <Timeline 
                :barChartVisible="barChartVisible"
                :level_id="level_id"
                />
            </div>
        </div>
        <div class="w-full pt-2" :style="`height: calc(75% - ${height}px)`">
            <Table />
        </div>
    </div>
    <div v-if = "zoomVisiable" class="w-180 h-35 Zoomcss bg-light-50">
        <div v-for="level_id in level_id_list" :key="level_id" class="cursor-pointer w-1/4 h-full"> 
            <ZoomTimeLine :barChartVisible="barChartVisible" :level_id="zoomLevel" />
        </div>
    </div>
</template>

<script>
import TableHeader from './TableHeader.vue'
import ZoomTimeLine from './table/ZoomTimeLine.vue'
import Timeline from "./table/Timeline.vue"
import Table from './table/Table.vue'
import { ref,computed } from 'vue' 
import { useStore } from 'vuex'
export default {
    name: 'Finder',
    components: {
        TableHeader,
        Table,
        ZoomTimeLine,
        Timeline
    },
    setup() {
        const store = useStore()
        const level_id_list = computed(() => store.getters["tree/level_id_list"])
        const zoomVisiable = computed(() => store.getters["time/zoomVisiable"])
        const height = ref(5)
        const barChartVisible = ref(false)
        const zoomLevel = ref(2)
        const showBarChart = () => {
            barChartVisible.value = !barChartVisible.value; 
            height.value = barChartVisible.value ? 40 : 5; 
        }

        return {
            height,
            barChartVisible,
            showBarChart,
            level_id_list,
            zoomVisiable,
            zoomLevel
        }
    }
}
</script>

<style>
.Zoomcss {
  position: absolute;
  top: 35%;
  left: 35%;
  transform: translate(-50%, -50%);
  z-index: 40; /* 确保这个值高于其他内容 */
  display: flex;
  flex-direction: row; /* flex-row 效果 */
  justify-content: center; /* 水平居中内部元素 */
  align-items: center; /* 垂直居中内部元素 */
}

.TableCss {
  z-index: 20; /* 确保 TableCss 不会被 Zoomcss 遮挡 */
}
</style>
