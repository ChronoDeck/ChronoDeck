<template>
    <div class="w-full flex flex-col relative overflow-visible">

        <div v-for="(id, index) in visibleNodeIdList" :key="id" class="relative" :ref="setItemRef"
            @mousedown="onMouseDown($event, index,level_id)">
            <TSCard :seriesData="findSeriesData(id)" :level="level_id" :node_id="id" :node_name="findNodeName(id)"
                :index="index" :groupedNode="groupedNodeFlag(id)" />
        </div>
        <div class="w-full p-0.8 py-0" v-show="level_id > alignLevel">
            <div class="w-full flex flex-col">
                <div class="w-full h-27px flex flex-row justify-center items-center" v-if="configureShow">
                    <div v-if="foldState">
                        <CircleIcon :number="hideSeriesNumber" />
                    </div>
                    <div class="flex-1"></div>
                    <div class="flex flex-row" v-if="!foldState">
                        <ConfigureButton class="mr-1" buttonName='sort' @click="sortSection()" />
                        <ConfigureButton buttonName='hide' @click="toggleFoldState()" />
                    </div>
                    <div class="flex flex-row" v-else-if="foldState">
                        <ConfigureButton buttonName='unfold' @click="toggleFoldState()" />
                    </div>
                </div>
                <div class="w-full h-4px cursor-pointer mt-4px" @click="toggleConfigureShow()">
                    <svg class="w-full h-full">
                        <line x1="0" y1="0" x2="100%" y2="0" :stroke="themeColor" stroke-width="2px"
                            stroke-dasharray="8,8">
                        </line>
                    </svg>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import TSCard from './TSCard.vue'
import ConfigureButton from './ConfigureButton.vue'
import CircleIcon from './CircleIcon.vue'
import { useStore } from 'vuex'
import { computed, ref, onUnmounted, watch } from 'vue'
import { ifEmphasize } from '../../computation/treeComputation'

export default {
    name: 'Section',
    props: ['node_id_list', 'level_id', 'checkCollection'],
    components: {
        TSCard,
        ConfigureButton,
        CircleIcon
    },
    setup(props) {
        const store = useStore()
        const seriesCollection = computed(() => store.getters["tree/seriesCollection"])
        const selectionTree = computed(() => store.getters["tree/selectionTree"])
        const level_id_list = computed(() => store.getters["tree/level_id_list"])
        const themeColor = computed(() => store.getters["color/themeColor"])


        const configureShow = ref(false)
        const foldState = ref(false)

        const alignState = computed(() => store.getters["align/alignState"])
        const alignLevel = computed(() => store.getters["align/alignLevel"])
        const draggedIndex = ref(null);
        const visibleNodeIdList = computed(() =>
            props.node_id_list.filter(id =>
                !foldState.value ||
                ifEmphasize(selectionTree.value, id, props.level_id, level_id_list.value)
            )
        );

        const itemRefs = ref([]);
        const setItemRef = (el) => {
            if (el) itemRefs.value.push(el);
        };
        let dragIndex = null;      // 被拖卡片的原始索引
        let startY = 0;            // 鼠标按下时的 clientY
        let placeholder = null;    // 占位元素
        let draggingEl = null;     // 真正在拖的克隆节点

        /* 4. 右键按下开始拖动 */
        function onMouseDown(evt, idx) {
            if(props.level_id < 3) {
                // 仅右键
                if (evt.button !== 1) return;
                document.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                });

                dragIndex = idx;
                startY = evt.clientY;
                draggingEl = itemRefs.value[idx].cloneNode(true);
                draggingEl.style.position = 'fixed';
                draggingEl.style.pointerEvents = 'none';
                draggingEl.style.opacity = 0.8;
                draggingEl.style.zIndex = 9999;
                document.body.appendChild(draggingEl);

                // 占位
                placeholder = document.createElement('div');
                placeholder.style.height = itemRefs.value[idx].offsetHeight + 'px';
                itemRefs.value[idx].style.visibility = 'hidden';
                itemRefs.value[idx].parentNode.insertBefore(placeholder, itemRefs.value[idx]);
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        }

        function onMouseMove(evt) {
            if (dragIndex === null) return;
            evt.preventDefault();
            draggingEl.style.left = evt.clientX + 'px';
            draggingEl.style.top = evt.clientY + 'px';

            // 计算当前鼠标落在哪个卡片
            let newIndex = null;
            for (let i = 0; i < itemRefs.value.length; i++) {
                const rect = itemRefs.value[i].getBoundingClientRect();
                if (evt.clientY < rect.top + rect.height / 2) {
                    newIndex = i;
                    break;
                }
            }
            if (newIndex === null) newIndex = itemRefs.value.length - 1;
            if (newIndex === dragIndex) return;

            // 交换 DOM 顺序（防止闪烁）
            const parent = placeholder.parentNode;
            if (newIndex < dragIndex) {
                parent.insertBefore(placeholder, itemRefs.value[newIndex]);
            } else {
                parent.insertBefore(placeholder, itemRefs.value[newIndex].nextSibling);
            }
            // dragIndex = newIndex;
        }

        /* 6. 松开右键完成重排 */
        function onMouseUp(evt) {
            if (dragIndex === null) return;
            evt.preventDefault();

            // 清理 DOM
            document.body.removeChild(draggingEl);
            placeholder.parentNode.insertBefore(itemRefs.value[dragIndex], placeholder);
            placeholder.parentNode.removeChild(placeholder);
            itemRefs.value.forEach(el => (el.style.visibility = ''));

            // 生成新的顺序并提交
            const list = [...visibleNodeIdList.value];
            const [removed] = list.splice(dragIndex, 1);
            list.splice(dragIndex, 0, removed); // 已经在正确位置
            store.dispatch('tree/moveNodeToTop', {
                level: props.level_id,
                nodeId: visibleNodeIdList.value[dragIndex]
            });

            // 重置
            dragIndex = null;
            document.removeEventListener('mousemove', onMouseUp);
            document.removeEventListener('mouseup', onMouseUp);
        }
        const findSeriesData = (id) => {
            return seriesCollection.value.find(node => node.id == id)?.seriesData ?? []
        }

        const findNodeName = (id) => {
            return seriesCollection.value.find(node => node.id == id)?.node_name ?? ""
        }

        const groupedNodeFlag = (id) => {
            const attribute = selectionTree.value.find(node => node.id == id)?.attribute ?? ""
            if (attribute.includes("group")) {
                return true
            }
            else {
                return false
            }
        }

        const toggleConfigureShow = () => {
            configureShow.value = !configureShow.value
        }

        const toggleFoldState = () => {
            foldState.value = !foldState.value
            store.dispatch("align/updateSectionState")
        }

        const sortSection = () => {
            store.dispatch("tree/sortSelectionTree", { "id_list": props.node_id_list, "mode": 'asc' })

        }

        const hideSeriesNumber = computed(() => {
            const hide_node_list = props.node_id_list.filter(id => !ifEmphasize(selectionTree.value, id, props.level, level_id_list.value))
            return hide_node_list.length
        })
        watch(visibleNodeIdList, () => {
            itemRefs.value = [];   // 清空旧引用
        }, { flush: 'post' });   // 等 DOM 更新完再清
        onUnmounted(() => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        });



        return {
            themeColor,
            seriesCollection,
            selectionTree,
            level_id_list,
            findSeriesData,
            findNodeName,
            groupedNodeFlag,
            configureShow,
            foldState,
            alignState,
            alignLevel,
            toggleConfigureShow,
            toggleFoldState,
            sortSection,
            ifEmphasize,
            hideSeriesNumber,
            onMouseDown,
            onMouseUp,
            onMouseMove,
            setItemRef,
            visibleNodeIdList
        }

    }
}

</script>

<style>
.selectCheck {
    position: absolute;
    top: 20%;
    left: 97%;
    transform: translate(-50%, -50%);
    z-index: 40;
    /* 确保这个值高于其他内容 */

}

.selectDeny {
    position: absolute;
    top: 50%;
    left: 98%;
    transform: translate(-50%, -50%);
    z-index: 40;
    /* 确保这个值高于其他内容 */

}
</style>
