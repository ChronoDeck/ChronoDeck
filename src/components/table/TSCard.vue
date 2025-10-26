<template>
    <div class=" relative overflow-visible">
        <div 
        :class="['w-full p-0.8 hover:opacity-100', { 'opacity-30': !ifEmphasize(selectionTree, node_id, level, level_id_list) }, { 'emphasizeCard': ifEmphasize(selectionTree, node_id, level, level_id_list) }]"
        :id="'card' + node_id" 
        :style="{ height: rowHeight + 'px' }" 
        @mouseover="handleMouseOver(node_id)"
        @mouseout="handleMouseOut(node_id)"
        @click="!hasChildren(selectionTree, node_id) ? unfold(node_id) : fold(node_id)"
        @dblclick="splitCard(node_id)">
            <div :class="['w-full h-full card ', { 'emphasize-effect': ifEmphasize(selectionTree, node_id, level, level_id_list) }]"
                id="cardContainer" class="relative" @contextmenu.prevent="showMenu">
                <svg class="w-full h-full bg-stone-100" ref="svgContainer">
                    <text x="2" :y=topMargin class="node-name text-ms" :fill="themeColor">{{ node_name }}</text>
                    <g v-if="chartType === 'line chart'">
                        <path :stroke="themeColor" fill="none" stroke-width="2"
                            :d="generatePath(seriesData, xScale, yScale)">
                        </path>
                    </g>
                    <g ref="brushRef"></g>
                </svg>
                <HorizonChart :data="seriesData" :bands="4" :height="cardHeight" :width="cardWidth"
                    :svgContainer="svgContainer" :chartType="chartType" />
            </div>
        </div>
        <div class="absolute top-[40%] left-[50%] ">
            <CardMenu :menuItems="menuItems"  ref="menuComponent" :node_id="node_id" :level="level" :index="index"/>
        </div>
    </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { ref, computed, onMounted, watchEffect, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import { generatePath } from "../../generator/generator"
import { calculateSeriesAverage } from "../../computation/basicComputation"
import { hasChildren, ifEmphasize, findAllRelatedNodeIds, highlightLinks, findChildrenIds } from '../../computation/treeComputation'
import { highlightNodes, deHighlightNodes, highlightEmphaizeCards, deHighlightEmphasizeCards } from "../../highlight/highlight"
import { topMargin, bottomMargin } from "../../config/visConfig"

import HorizonChart from './HorizonChart.vue';
import CardMenu from './CardMenu.vue';

// Define props
const props = defineProps({
    seriesData: Array,
    level: Number,
    node_id: Number,
    node_name: String,
    groupedNode: Boolean,
    index: Number
})

const store = useStore()
const dataset = computed(() => store.getters["tree/dataset"])
const themeColor = computed(() => store.getters["color/themeColor"])
const selectionTree = computed(() => store.getters["tree/selectionTree"])
const level_id_list = computed(() => store.getters["tree/level_id_list"])
const rowHeight = computed(() => store.getters['size/rowHeight'])
const cardHeight = computed(() => store.getters['size/cardHeight'])
const cardWidth = computed(() => store.getters['size/cardWidth'])

const timeRange = computed(() => store.getters['tree/timeRange'])

const chartType = computed(() => store.getters['card/chartType'])
const svgContainer = ref(null);
const chart = ref(null);

const xScale = computed(() => store.getters['size/xScale'])
const yScale = computed(() => {
    if (dataset.value == 'PV') {
        return store.getters['size/yScale'][props.level - 1]
    }
    else {
        const max = Math.max(...props.seriesData.map(item => item.value))
        const min = Math.min(...props.seriesData.map(item => item.value))
        return d3.scaleLinear().domain([min, max]).range([cardHeight.value - bottomMargin, topMargin])
    }
})

const originalTree = computed(() => store.getters["tree/originalTree"])
const plot_X_Scale = computed(() => store.getters["scatterPlot/plot_X_Scale"])
const plot_Y_Scale = computed(() => store.getters["scatterPlot/plot_Y_Scale"])
const coordinateCollection = computed(() => {
    return store.getters["scatterPlot/coordinateCollection"]
})
const columnWidth = computed(() => store.getters["scatterPlot/columnWidth"])
const highlightVisible = computed(() => store.getters["scatterPlot/highlightVisible"])
const brushRef = ref(null)
const averageValue = ref(0)

const menuItems = ref(['node', 'layer', 'path', 'tree']);
const menuComponent = ref(null);

watchEffect(() => {
    if (timeRange.value.length > []) {
        averageValue.value = calculateSeriesAverage(props.seriesData)
    }
})

const setupBrush = () => {
    const brush = d3.brushX()
        .extent([[0, 0], [cardWidth.value, cardHeight.value]])
        .on('end', brushed)
    d3.select(brushRef.value).call(brush);
    brushRef.value.brush = brush;
};

const brushed = (event) => {
    const selection = event.selection;
    if (selection) {
        const newTimeRange = selection.map(xScale.value.invert)
        store.dispatch('tree/updateTimeRange', newTimeRange)
        console.log('Selected Time Range:', newTimeRange)
        d3.select(brushRef.value).call(brushRef.value.brush.move, null)
    }
}

const unfold = (id) => {
    store.dispatch('tree/selectNodeAndChildren', id)
}

const fold = (id) => {
    store.dispatch('tree/deselectNodeAndChildren', id)
}

const splitCard = (id) => {
    const obj = {}
    store.dispatch('tree/addYearLayer', obj)   
}

const handleMouseOver = (id) => {
    if (highlightVisible.value) {
        if (ifEmphasize(selectionTree.value, id, props.level, level_id_list.value)) {
            deHighlightEmphasizeCards()
        }
        const id_list = findChildrenIds(id, originalTree.value)
        highlightNodes(id_list)
        store.dispatch('scatterPlot/updateBezierPaths',
            highlightLinks(
                id,
                originalTree.value,
                coordinateCollection.value,
                plot_X_Scale.value,
                plot_Y_Scale.value,
                columnWidth.value
            ))
    }
};

const handleMouseOut = (id) => {
    if (highlightVisible.value) {
        if (ifEmphasize(selectionTree.value, id, props.level, level_id_list.value)) {
            highlightEmphaizeCards()
        }
        const id_list = findChildrenIds(id, originalTree.value)
        deHighlightNodes(id_list)
        store.dispatch('scatterPlot/updateBezierPaths', [])
    }
}

const showMenu = (event) => {
    if (menuComponent.value) {
        menuComponent.value.showMenu(event);
    }
};
const moveBrushToEnd = () => {
    nextTick(() => {
        if (brushRef.value) {
            svgContainer.value.appendChild(brushRef.value);
        }
    });
};

onMounted(() => {
    cardContainer.value = document.querySelector("#cardContainer")
    store.dispatch('size/updateCardWidth', cardContainer.value?.offsetWidth)
    store.dispatch('size/updateCardHeight', cardContainer.value?.offsetHeight)
    setupBrush()
})

watch([() => props.seriesData, chartType], () => {
    moveBrushToEnd();
});
</script>

<style>
.brush .selection {
    fill: rgb(100, 102, 102);
    opacity: 0.3;
}

.emphasize-effect {
    box-shadow: 0 5px 4px -2.5px rgba(151, 192, 204, 0.6);
}

.card :hover {
    box-shadow: 0 5px 4px -2.5px rgba(151, 192, 204, 0.6);
}

.node-name {
    font-size: 6px;
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-style: "semibold italic";
    font-variation-settings:
        "slnt" 0;

}
</style>
