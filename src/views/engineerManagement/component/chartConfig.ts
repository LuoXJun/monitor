import * as echarts from 'echarts';

export const basePieOption = {
    tooltip: {
        trigger: 'item'
    },
    legend: {
        top: '5%',
        left: 'center'
    },
    backgroundColor: '#000',
    series: [
        {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            padAngle: 2,
            itemStyle: {
                borderWidth: 10,
                borderColor: 'transparent'
            },
            label: {
                show: true,
                position: 'top '
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 40,
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: [
                { value: 1048, name: 'Search Engine' },
                { value: 735, name: 'Direct' },
                { value: 580, name: 'Email' },
                { value: 484, name: 'Union Ads' },
                { value: 300, name: 'Video Ads' }
            ]
        },
        {
            name: 'Access From',
            type: 'pie',
            radius: ['20%', '40%'],
            avoidLabelOverlap: false,
            padAngle: 2,
            itemStyle: {
                borderWidth: 10,
                borderColor: 'transparent',
                opacity: 0.3
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 40,
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: [
                { value: 1048, name: 'Search Engine' },
                { value: 735, name: 'Direct' },
                { value: 580, name: 'Email' },
                { value: 484, name: 'Union Ads' },
                { value: 300, name: 'Video Ads' }
            ],
            color: [
                new echarts.graphic.LinearGradient(
                    0,
                    1,
                    0,
                    0,
                    [
                        { offset: 0, color: '#cee7ff' },
                        { offset: 1, color: '#148afe' }
                    ],
                    false
                ),
                new echarts.graphic.LinearGradient(
                    0,
                    1,
                    0,
                    0,
                    [
                        { offset: 0, color: '#cee7ff' },
                        { offset: 1, color: '#148afe' }
                    ],
                    false
                ),
                new echarts.graphic.LinearGradient(
                    0,
                    1,
                    0,
                    0,
                    [
                        { offset: 0, color: '#cee7ff' },
                        { offset: 1, color: '#148afe' }
                    ],
                    false
                ),
                new echarts.graphic.LinearGradient(
                    0,
                    1,
                    0,
                    0,
                    [
                        { offset: 0, color: '#cee7ff' },
                        { offset: 1, color: '#148afe' }
                    ],
                    false
                ),
                new echarts.graphic.LinearGradient(
                    0,
                    1,
                    0,
                    0,
                    [
                        { offset: 0, color: '#cee7ff' },
                        { offset: 1, color: '#148afe' }
                    ],
                    false
                )
            ]
        }
    ]
};
