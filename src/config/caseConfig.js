// case configuration

const caseConfig  = [
    {
        "dataset": "Tour_Seasonal",
        "timeRange": ["2010-01-01", "2017-10-01"],
        "randomSeed": 666,
        "normalized": true
    },
    {
        "dataset": "PV",
        "timeRange": ["2022-12-16","2022-12-29"],
        //"timeRange": [],
        "randomSeed": 0,
        "normalized": false
    },
    {
        "dataset": "Stock",
        // "timeRange": ['2023-03-10', '2023-03-31'],
        // "timeRange": ['2023-03-10', '2023-03-18'],
        "timeRange": ['2023-03-10', '2023-03-31'],
        //"timeRange": ['2023-03-11', '2023-03-18'],
        "randomSeed":1200,
        "normalized":true
    }
]

export const getTimeRange = (dataset) => {
    return caseConfig.filter(config => config.dataset === dataset)[0].timeRange
}

export const getClusterNumber = (dataset) => {
    return caseConfig.filter(config => config.dataset === dataset)[0].clusterNumber
}

export const getRandomSeed = (dataset) => {
    return caseConfig.filter(config => config.dataset === dataset)[0].randomSeed
}

export const getNormalized = (dataset) => {
    return caseConfig.filter(config => config.dataset === dataset)[0].normalized
}






