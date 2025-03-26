# ChronoDeck: A Visual Analytics Approach for Hierarchical Time Series Analysis

## Basic Introduction

ChronoDeck is a visual analytics system we have developed for hierarchical time series analysis. 
It leverages the combination of dimension reduction and small multiples visualizations in a multi-column layout, alongside interactions including highlight, align, filter, and select, to support six analytical tasks: **summarize**, **compare**, **relate**, **compute**, **rearrange**, and **reshape**.

## Implementation

We implement ChronoDeck from two modules: frontend and backend. 

### Frontend

JavaScript, Vue.js, Vite, Vuex, and D3.

### Backend Server

Python, Flask, numpy, and sklearn.

## Dataset of Hierarchical Time Series

Hierarchical time series is defined as in [1]: multiple time series that are hierarchically organized and can be aggregated at several different levels in groups based on products, geography or some other features.

In the repo, we introduce two datasets of hierarchical time series: the stock market dataset and the tourism dataset.

#### The Stock Market Dataset

This dataset consists of three levels: index, sector, and individual stock.
We obatin relevant time series through **Yahoo Finance API** and organize them in a tree structure.

#### The Tourism Dataset

This dataset also consists of three levels: country, state, and region.
It is introduced in [2].

## References

[1]: R. J. Hyndman, R. A. Ahmed, G. Athanasopoulos, and H. L. Shang, "Optimal combination forecasts for hierarchical time series," *Computational Statistics & Data Analysis*, vol. 55, no. 9, pp. 2579-2589, 2011. DOI: 10.1016/j.csda.2011.03.006. 

[2]: R. J. Hyndman and G. Athanasopoulos, *Forecasting: principles and practice*. OTexts, 2018.
