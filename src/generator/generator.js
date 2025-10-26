import * as d3 from "d3"

const lineGenerator = (xScale, yScale) => {
    return d3.line()
    .x(d => {
        return xScale(new Date(d.Time));
    })
    .y(d => {
        return yScale(d.value);
    })
    // .curve(d3.curveBasis)
}

export const generatePath = (data,xScale, yScale) => {
    return lineGenerator(xScale,yScale)(data) 
}

export const generateSelectedPath = (data,xScale, yScale) => {
    data.forEach(d => {
        d.Time = new Date(d.Time)
    })
    return lineGenerator(xScale,yScale)(data)
}


