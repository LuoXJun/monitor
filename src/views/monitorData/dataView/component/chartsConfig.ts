export const baseLineOption = {
    title: {
        text: 'Stacked Line',
        left: 'center'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: ['Email', 'Union Ads', 'Video Ads', 'Direct'],
        top: '30px'
    },
    grid: {
        left: '1%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'time'
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: 'Email',
            type: 'line',
            stack: 'Total',
            data: [120, 132, 101, 134, 90, 230, 210]
        }
    ]
};
