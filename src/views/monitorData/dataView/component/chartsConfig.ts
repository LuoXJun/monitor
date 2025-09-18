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
    xAxis: {
        type: 'time',
        min: 1704038400000,
        max: 1704038460000
        // axisLabel: {
        //     show: true,
        //     showMaxLabel: true,
        //     showMinLabel: true,
        //     formatter: function (val, index) {
        //         let date = new Date(val); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        //         let m =
        //             (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        //         let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        //         return m + s;
        //     }
        // }
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
