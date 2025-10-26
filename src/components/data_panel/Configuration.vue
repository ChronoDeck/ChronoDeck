<template>
  <div class="container w-full h-full p-2 flex flex-col justify-between" id="configContainer">
    <!-- select bar of data set -->
    <div class="w-full h-1/14 name text-[1em] text-[#9E9E9E]  ">
      DATA VIEW
    </div>
    <div class="w-full h-1/8 ">
      <var-select :hint="false" v-model="dataSet" text-color="#ABABAB" style="--select-label-font-size: 0.8em">
        <var-option v-for="(item, index) in dataSetOptions" :key="index" :label="item"
          style="--option-font-size: 1.1em" />
      </var-select>
    </div>

    <!-- info of node and level -->
    <div class="flex flex-row w-full h-1/8  justify-center items-center mt-4">
      <div class="flex flex-row w-1/2 h-full items-center">
        <div class="w-1/6 h-full  flex items-center">
          <font-awesome-icon :icon="['fas', 'share-nodes']" :style="{ color: themeColor }" size="xl" class="" />
        </div>
        <div class="ml-[1em] flex flex-col w-2/3 h-full justify-center items-center">
          <div class="name text-[#3182BD] text-[1.1em] ">{{ node_numbers }}</div>
          <div class="w-full h-1/5 flex flex-row justify-between">
            <div class="black-line w-1/3 mt-[0.3em]"></div>
            <div class="node_number text-[#ABABAB]">node</div>
            <div class="black-line w-1/3 mt-[0.3em]"></div>
          </div>
        </div>
      </div>
      <div class="flex flex-row w-1/2 h-full ml-2 items-center">
        <div class="w-1/6 h-full  flex items-center">
          <font-awesome-icon :icon="['fas', 'layer-group']" size="lg" :style="{ color: themeColor }" class="mt-1" />
        </div>
        <div class="ml-[1em] flex flex-col w-2/3 h-full justify-center items-center">
          <div class="name text-[#3182BD] text-[1.1em] ">{{ levels_length }}</div>
          <div class="w-full h-1/5 flex flex-row justify-between">
            <div class="black-line w-1/3 mt-[0.3em]"></div>
            <div class="node_number text-[#ABABAB]">level </div>
            <div class="black-line w-1/3 mt-[0.3em]"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- info of data -->
    <div class="flex flex-row w-full h-1/5 mt-3">
      <div class="flex flex-row w-full h-full">
        <div class="w-1/12 h-full  flex ">
          <font-awesome-icon :icon="['fas', 'calendar-days']" size="lg" :style="{ color: themeColor }"
            class="mt-[0.3em]" />
        </div>

        <div class="flex flex-col w-11/12">
          <!-- start time and line -->

          <div class="flex flex-col w-full h-full pl-[1em] ">
            <div class="node_number h-1/5">start time</div>

            <div class="w-full h-3/5 ">
              <var-input class="name" :text-color=themeColor v-model="start_time" :hint="false" style="
                  --field-decorator-standard-normal-margin-bottom: 0px;
                  --field-decorator-standard-normal-margin-top: -10px;
                  --input-input-height: 80%;
                  --input-input-font-size: 0.8em;
                  --field-decorator-line-focus-size: 0px;
                  --field-decorator-line-size: 0px;
                  --field-decorator-placeholder-size: 80%;
                " :style="{ color: themeColor }" />
            </div>
            <div class="black-line w-full"></div>
          </div>
          <!-- end time -->
          <div class="flex flex-col w-full h-full pl-[1em] mt-1">
            <div class="node_number h-1/5">end time</div>
            <div class="w-full h-3/5">
              <var-input v-model="end_time" :text-color=themeColor :hint="false" style="
                --field-decorator-standard-normal-margin-bottom: 0px;
                --field-decorator-standard-normal-margin-top: -10px;
                --input-input-height: 80%;
                --input-input-font-size: 0.8em;
                --field-decorator-line-focus-size: 0px;
                --field-decorator-line-size: 0px;
                --field-decorator-placeholder-size: 80%;
              " />
            </div>
            <div class="black-line w-full"></div>
          </div>
        </div>

      </div>
    </div>
    <div class="flex flex-row w-full mt-5">
      <div class="w-1/12 h-full  flex ">
        <font-awesome-icon :icon="['fas', 'pen-ruler']" :style="{ color: themeColor }" size="lg" class="mt-[0.4em]" />
      </div>

      <div class="flex flex-col w-11/12 h-full pl-[1em]">
        <div class="w-full h-3/5">
          <var-select :hint="false" text-color="#ababab" v-model="daily_content" style="
          --field-decorator-blur-color: #ffffff;
          --field-decorator-focus-color: #ffffff;
          --select-label-font-size: 0.6em;
            ">
            <var-option v-for="(item, index) in daily_options" :key="index" :label="item"
              style="---option-font-size: 0.6em" />
          </var-select>
        </div>
        <div class="black-line w-full mt-[0.3em]"></div>
      </div>
    </div>
    <!-- raw -->
    <div class="flex flex-row w-full">
      <div class="w-1/12 h-full  flex">
        <font-awesome-icon :icon="['fas', 'database']" :style="{ color: themeColor }" size="lg" class="mt-[0.4em]" />
      </div>

      <div class="flex flex-col w-11/12 h-full pl-[1em] truncate">
        <div class="w-full h-3/5">
          <var-select  :hint="false" text-color="#ababab" :options="options" v-model="raw_content" style="
          --field-decorator-blur-color: #ffffff;
          --field-decorator-focus-color: #ffffff;
          --select-label-font-size: 0.6em;
          ">
          </var-select>

        </div>
        <div class=" w-full black-line mt-[0.3em]"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, watchEffect, onMounted } from "vue";
import { Slider, InputNumber } from "ant-design-vue";
export default {
  name: "Configuration",
  components: {
    "a-slider": Slider,
    "a-input-numer": InputNumber,
  },
  setup() {
    const store = useStore();
    const configContainer = ref(null);
    const configHeight = ref(0)
    const inputValue = ref(1);
    const dataSet = ref("Tourism");
    const dataSetOptions = ["Photovoltaic", " Stock Market", "Tourism"];
    const daily_content = ref("quarterly")
    const daily_options = ["hourly", "daily", "weekly", "quarterly"]
    const start_time = computed(() => store.getters["time/startTime"])
    const end_time = computed(() => store.getters["time/endTime"])
    const layer_name = ref("")
    const raw_content = ref("raw");
    const raw_options = ref()
    const options = ref([])
    const originalTree = computed(() => store.getters["tree/originalTree"])
    const levels_length = computed(() => {
      return store.getters["tree/level_id_list"].length
    })
    const node_numbers = computed(() => {
      return originalTree.value.length;
    })
    const start_time_place = computed(() => {
      return store.getters["time/wholeTimeRange"].Tour_Seasonal[0]
    })
    const end_time_place = computed(() => {
      return store.getters["time/wholeTimeRange"].Tour_Seasonal[1]
    })

    watchEffect(() => {
      // console.log("input value is", inputValue.value)
      store.dispatch("scatterPlot/updateClusterNumber", inputValue.value);
    });

    const themeColor = computed(() => store.getters["color/themeColor"]);

    // get some size
    onMounted(() => {
      configContainer.value = document.querySelector('#configContainer');
      configHeight.value = configContainer.value.offsetHeight;
      configContainer.value.style.fontSize = `${configHeight / 300}px`;
    })

    return {
      inputValue,
      themeColor,
      dataSet,
      dataSetOptions,
      start_time,
      raw_content,
      raw_options,
      daily_content,
      end_time,
      daily_content,
      daily_options,
      layer_name,
      node_numbers,
      levels_length,
      start_time_place,
      end_time_place,
      options
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
  color: themeColor;
}

:root {
  --select-font-family: 'Inter', sans-serif;
  --select-font-weight: 500;
  --select-font-style: "semibold";
  --select-font-variation-settings: "slnt" 0;
}

.var-select,
.var-option {
  font-family: var(--select-font-family);
  font-weight: var(--select-font-weight);
  font-style: var(--select-font-style);
  font-variation-settings: var(--select-font-variation-settings);


}
.var-select :deep(.var-select__selection) {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
}

.var-input__input {
  font-family: 'Inter', sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: "semibold";
  font-variation-settings: "slnt" 0;
}

.node_number {
  font-size: 10px;
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: "semibold";
  font-variation-settings: "slnt" 0;
  color: #ababab;
}

.black-line {
  border-width: 0.02em;
  background-color: #ababab;
}
</style>