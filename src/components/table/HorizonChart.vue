<template>
  
</template>

<script>
import * as d3 from 'd3';
import { onMounted, watch, ref } from 'vue';

export default {
  name: 'HorizonChart',
  props: {
    data: Array,
    bands: Number,
    height: Number,
    width: Number,
    chartType: String,
    svgContainer: Object // 接收父组件传递的SVG容器引用
  },
  setup(props) {
    const horizonGRef = ref(null)
    const drawChart = () => {
      const { data, bands, svgContainer } = props;
      if (props.chartType !== 'horizon chart') {

        if (horizonGRef.value) {
          d3.select(horizonGRef.value).selectAll('*').remove(); 
        }
        return; 
      }
      else {
        d3.select(horizonGRef.value).selectAll('*').remove();
      }
      if (!data || !Array.isArray(data)) {
        console.error("Data is not an array or is undefined", data);
        return;
      }

      const colors = [
        "#9ecae1", "#6baed6",
        "#4292c6", "#2171b5", "#08519c", "#08306b"
      ];

      const marginTop = 10;
      const width = props.width;
      const size = props.height - marginTop;
      const padding = 0;
      const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.Time))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.value), d3.max(data, d => d.value)])
        .range([size, size - bands * (size - padding)]);
      
      const area = d3.area()
        .defined(d => !isNaN(d.value))
        .x(d => x(d.Time))
        .y0(size)
        .y1(d => y(d.value));

      const uid = `O-${Math.random().toString(16).slice(2)}`;
      const svg = d3.select(props.svgContainer);
      let g = svg.select("g.horizon-chart");
      if (!g.node()) {
        g = svg.append("g")
          .attr("class", "horizon-chart")
          .attr("transform", `translate(0,${marginTop})`);
      } else {
        // g.selectAll('*').remove();
      }
      horizonGRef.value = g.node();
      const defs = g.append("defs");
      defs.append("clipPath")
        .attr("id", `${uid}-clip`)
        .append("rect")
        .attr("y", padding)
        .attr("width", width)
        .attr("height", size - padding);

      defs.append("path")
        .attr("id", `${uid}-path`)
        .attr("d", area(data));

      g.append("g")
        .attr("clip-path", `url(${new URL(`#${uid}-clip`, location)})`)
        .selectAll("use")
        .data(new Array(bands).fill(0))
        .enter().append("use")
        .attr("xlink:href", `${new URL(`#${uid}-path`, location)}`)
        .attr("fill", (_, i) => colors[i])
        .attr("transform", (_, i) => `translate(0,${i * size})`);
    };

    onMounted(() => {
      drawChart(); 
    });

    watch(
      [() => props.data, () => props.chartType, () => props.svgContainer],
      () => {
        drawChart(); 
      },
      { deep: true }
    );
    return {
      horizonGRef
    }
  }
};
</script>