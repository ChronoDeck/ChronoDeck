export const caseConfig  = [
    {
        "dataset": "Tour_Seasonal",
        "timeRange": ["2010-01-01", "2017-10-01"],
        "randomSeed": 666,
        "normalized": true
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






