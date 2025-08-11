import 'virtual:windi.css'
import { createApp } from 'vue'
import App from './App.vue'
import store from "./store/store"
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css'

// varlet
import Varlet from '@varlet/ui'
import '@varlet/ui/es/style'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { 
    faNetworkWired, 
    faRoute, 
    faLayerGroup, 
    faCircle, 
    faAngleRight, 
    faPlus, 
    faObjectUngroup, 
    faMagnifyingGlass, 
    faGear, 
    faCircleXmark, 
    faArrowUpWideShort, 
    faArrowDownWideShort, 
    faArrowDownShortWide,
    faToggleOn, 
    faXmark,
    faTrashCan,
    faEye,
    faEyeSlash,
    faDrawPolygon,
    faChartSimple,
    faCodeMerge,
    faShareNodes,
    faCalendarDays,
    faCubes,
    faPalette,
    faQuestion,
    faQuestionCircle,
    faPenRuler,
    faDatabase,
    faCircleCheck,
    faCaretRight,
    faCaretDown,
    faAnchor

} from '@fortawesome/free-solid-svg-icons'

library.add(
    faNetworkWired, 
    faRoute, 
    faLayerGroup, 
    faCircle, 
    faAngleRight, 
    faPlus, 
    faObjectUngroup, 
    faMagnifyingGlass, 
    faGear, 
    faCircleXmark, 
    faXmark,
    faArrowUpWideShort, 
    faArrowDownWideShort, 
    faArrowDownShortWide,
    faToggleOn,
    faTrashCan,
    faEye,
    faEyeSlash,
    faDrawPolygon,
    faChartSimple,
    faCodeMerge,
    faShareNodes,
    faCalendarDays,
    faCubes,
    faPalette,
    faQuestionCircle,
    faQuestion,
    faPenRuler,
    faDatabase,
    faCircleCheck,
    faCircleXmark,
    faCaretRight,
    faCaretDown,
    faAnchor
)

const app = createApp(App)
app
.use(PerfectScrollbar)
.use(store)
.use(Antd)
.use(Varlet)
.component('font-awesome-icon', FontAwesomeIcon)
.mount("#app")



