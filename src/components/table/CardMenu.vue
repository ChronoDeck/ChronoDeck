<template>
    <div class="menu-container" @contextmenu.prevent="showMenu">
        <ul v-if="menuVisible" class="menu-list">
            <li class=" text-xs" v-for="item in menuItems" :key="item" @click="handleMenuClick(item)">
                {{ item }}
            </li>
        </ul>
    </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { findPath, findLevelList, buildSubtree, getSubtreeIds } from "../../select/entitySelection"
export default {
    name: 'CardMenu',
    props: {
        menuItems: Array,
        node_id: Number,
        level: Number,
        index: Number
    },
    setup(props, { emit }) {
        const store = useStore()
        const selectionTree = computed(() => store.getters["tree/selectionTree"])
        const menuVisible = ref(false);
        const menuPosition = ref({ x: 0, y: 0 });

        const showMenu = (event) => {
            menuVisible.value = true;
            menuPosition.value = { x: event.clientX - 315 - 406 * (props.level - 1), y: event.clientY - 450 - 50 * props.index };
            document.addEventListener('click', hideMenu);
        };

        const hideMenu = () => {
            menuVisible.value = false;
            document.removeEventListener('click', hideMenu);
        };

        const handleMenuClick = (item) => {
            if (item === "node") {
                onClickNode();
            }
            else if (item === "path") {
                onClickPath();
            }
            hideMenu();
        };
        const onClickPath = () => {
            const paths = findPath(props.node_id, selectionTree.value);
            const levelList = paths.length > 0 ? findLevelList(selectionTree.value, paths[0]) : [];
            paths.forEach((path) => {
                const pathEntity = {
                    type: 'path',
                    path,
                    levelList,
                    flag: "selected"
                };
                store.dispatch('selection/addEntity', pathEntity);
            });
        }

        const onClickNode = () => {
            console.log("id is ", props.node_id)
            store.dispatch("selection/addEntity", { type: 'node', id: props.node_id, level: props.level , flag: "selected"});

        }

        return {
            menuVisible,
            menuPosition,
            showMenu,
            hideMenu,
            handleMenuClick,
        };
    },
};
</script>

<style scoped>
.menu-container {
    position: relative;
    /* display: inline-block; */
    height: auto;
}

.menu-list {
    position: absolute;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 5%;
    list-style: none;
    margin: 0;
    padding: 0;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    width: 80px;
    z-index: 1000;
}

.menu-list li {
    text-align: center;
    padding: 10px;
    font-size: 14px;
    font-weight: 550;
    font-family: 'Roboto';
    cursor: pointer;
}

.menu-list li:hover {
    background-color: #F24E1E;
    border-radius: 8%;
}
</style>