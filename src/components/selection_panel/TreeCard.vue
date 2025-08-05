<template>
    <div class="w-full px-2  round-md pb-3">
        <div class="w-full py-2 px-5 entityCard" :style="{'background-color': related ?  themeColor : 'rgba(245, 245, 245, 0.6)' }">
            <div class="w-full flex flex-col">
                <div class="w-full h-30px flex flex-row items-center" :style="{ 'border-bottom': '1px solid' + themeColor }" id="treeTitleContainer">
                    <div class="text-sm cardTitle" :style="{ 'color': themeColor }"> Tree </div>
                    <div class="flex-1"></div>
                    <div class="flex flex-row">
                        <font-awesome-icon :icon="['fas', 'magnifying-glass']" :style="{color: themeColor}" class="mr-2" size="sm"/>
                        <font-awesome-icon :icon="['fas', 'gear']" :style="{color: themeColor}" class="mr-2" size="sm"/>
                        <font-awesome-icon :icon="['fas', 'circle-xmark']" :style="{color: themeColor}" class="mr-2" size="sm" @click="deleteTreeEntity"/>
                    </div>
                </div>
                <div class="w-full max-h-200px overflow overflow-scroll">
                    <div 
                    v-for="(id,index) in seriesData_list.map(series => series.id)"
                    :key="id"
                    class="w-full h-50px flex flex-row"
                    >
                        <div class="w-1/7 h-full p-0 flex flex-row items-center justify-center">
                            <div class="w-full flex flex-col " :style="{ 'color': themeColor }">
                                <div class="meta">{{ getCategoryBySeriesId(id) }}</div>
                                <div @click="deleteTree(id)"><font-awesome-icon :icon="['fas', 'trash-can']" size="xs" style="color:#f87171"/> </div>
                            </div>
                        </div>
                        <div class="w-11/14 h-full  flex flex-row justify-center ">
                            <div class="w-full h-full" :style="{ 'border-bottom': '1px solid' + themeColor }">
                                <svg class="w-full h-full">
                                    <path
                                    :stroke="themeColor"
                                    fill="none"
                                    stroke-width="2.5"
                                    :d="generateSelectedPath(JSON.parse(JSON.stringify(seriesData_list.find(series => series.id == id).data)), xScale, yScale_list[index])"
                                    >
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div class="w-1/14 h-full ">     
                        </div>
                    </div>
                </div>   
            </div>
        </div>
    </div>
</template>



<script>
import { useStore } from 'vuex'
import { computed, ref, onMounted, watch } from 'vue'
import { cloneDeep } from 'lodash'
import { generateSelectedPath } from '../../generator/generator'
import { calculatePearsonCorrelation } from '../../select/entitySelection'
import * as d3 from "d3"
export default {
    name: 'TreeCard',
    props: ['id_list', 'level_list', 'related', 'entityID'],
    components:{
    },
    setup(props) {
        const titleContainer = ref(null)
        const width = ref(0)
        const height = ref(50)

        const xScale = ref(null)
        const yScale_list = ref([])
        const seriesData_list = ref([])

        const store = useStore()
        const themeColor = computed(() => props.related ? '#FFFFFF' : store.getters["color/themeColor"])
        const selectionTree = computed(() => store.getters["tree/selectionTree"])
        const originalTree = computed(() => store.getters["tree/originalTree"]);
        const description = computed(() => store.getters["tree/description"])
        const timeRange = computed(() => store.getters["tree/timeRange"])

        const deleteTreeEntity = () => {
            store.dispatch('selection/deleteEntity', props.entityID);
        };
        const deleteTree = (id) => {
            const deleteItem = { entityID: props.entityID, id: id }
            console.log("delete id is", deleteItem)
            store.dispatch('selection/deleteIdFromEntity', deleteItem);
        };
        const extractLastNumber = (str) => {
            const regex = /(?:-|^)([^-]+)$/;
      const match = str.match(regex);
      const result = match ? match[1] : ""; // 如果有匹配的话，结果在match的第二个元素中
      return result;
        };
        const getCategoryBySeriesId = (id) => {


            // 在 selectionTree 中查找对应的节点
            const node = originalTree.value.find(node => node.id === id);
            const nodeName = node ? node.node_name : '';
            const number = extractLastNumber(nodeName); // 提取编号

            // 组合类别名称和编号
            return `${number}`;
        };
        const calculateCorrelation = ( series1, series2 ) => {
            return calculatePearsonCorrelation(series1, series2);
        };
        const updateYScales = () => {
            if (store.getters["size/yScale"].length > 0) {
                yScale_list.value = props.level_list.map(level =>
                    d3.scaleLinear()
                        .domain(store.getters["size/yScale"][level - 1].domain())
                        .range([height.value - 5, 12])
                );
            }
        };
        watch([xScale, () => props.id_list], ([newXScale, newIdList]) => {
            if (newXScale !== null) {
                const list = [];
                updateYScales();
                newIdList.forEach(id => { // 使用新的id列表
                    let obj = {};
                    obj["id"] = id;
                    obj["data"] = cloneDeep(store.getters["tree/seriesCollection"].find(node => node.id == id)?.seriesData);
                    list.push(obj);
                });
                seriesData_list.value = list;

                console.log("check data");
                console.log(list);
            }
        });

        onMounted(() => {
            titleContainer.value = document.querySelector('#treeTitleContainer')
            width.value =  titleContainer.value.offsetWidth * 11 / 14
            // console.log("check width")
            // console.log(width.value)
            if(store.getters["size/xScale"].length > 0){
                xScale.value = d3.scaleTime().domain(store.getters["size/xScale"].domain()).range([5, width.value-5])
                const timeRange = store.getters["tree/timeRange"]
                // console.log("check xScale")
                // console.log(timeRange[1])
                // console.log(xScale.value(timeRange[1]))    
            }
            if(store.getters["size/yScale"].length > 0){
                yScale_list.value = props.level_list.map(level => d3.scaleLinear().domain(store.getters["size/yScale"][level-1].domain()).range([height.value-5, 12]))
                // console.log("check yScale")
                // console.log(yScale_list.value[0](0))

            } 
            
        })

        return {
            themeColor,
            description,
            xScale,
            yScale_list,
            seriesData_list,
            generateSelectedPath,
            timeRange,
            deleteTreeEntity,
            deleteTree,
            getCategoryBySeriesId,
            calculateCorrelation
        }
    }
}


</script>

<style>
.cardTitle {
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: "regular";
  font-variation-settings:
    "slnt" 0;
}

.entityCard {
    box-shadow: 0 3px 4px -3px rgba(138, 139, 139, 0.6);
}



</style>