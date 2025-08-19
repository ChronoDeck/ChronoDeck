import * as d3 from "d3"
import { topMargin, bottomMargin, xMargin, yMargin } from "../config/visConfig"


export const PLOT_Scale = (data, width, height) => {
    //因为涉及到x,y有负数，所以max,min都要求，然后取绝对值最大的那个,用它的正负作为最终的max,min

    let xValues = data.map(coord => coord.x);   
    let yValues = data.map(coord => coord.y);
    let xMin = Math.min(...xValues), xMax = Math.max(...xValues);
    let yMin = Math.min(...yValues), yMax = Math.max(...yValues);
    let maxX = Math.max(Math.abs(xMin), Math.abs(xMax));
    let maxY = Math.max(Math.abs(yMin), Math.abs(yMax));

    const xScale = d3.scaleLinear().domain([-maxX, maxX]).range([xMargin, width - xMargin]);
    const yScale = d3.scaleLinear().domain([-maxY, maxY]).range([height - yMargin, yMargin]);
    return { xScale, yScale };
}

export const getXScale = (data, width) => {
    console.log("data is", d3.extent(data, d => d.Time))
    return d3.scaleTime()
    .domain(d3.extent(data, d => d.Time))
    .range([0, width])
}

export const getYScale = (max, min, height) => {
    return d3.scaleLinear()
    .domain([min, max])
    .range([height-bottomMargin, topMargin])
}
