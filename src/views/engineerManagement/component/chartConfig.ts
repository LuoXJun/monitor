export const colorList = [
    'rgba(85, 108, 149, 1)',
    'rgba(111, 175, 175, 1)',
    'rgba(184, 153, 56, 1)',
    'rgba(199, 166, 165, 1)',
    'rgba(213, 194, 186, 1)',
    'rgba(200, 200, 200, 1)'
];
export const basePieOption = {
    legend: {
        show: false
    },
    color: colorList,
    series: [
        {
            name: 'Nightingale Chart',
            type: 'pie',
            radius: [20, 70],
            center: ['45%', '50%'],
            roseType: 'area',
            label: false,
            data: [
                { value: 40, name: 'rose 1' },
                { value: 38, name: 'rose 2' },
                { value: 32, name: 'rose 3' },
                { value: 30, name: 'rose 4' },
                { value: 28, name: 'rose 5' },
                { value: 26, name: 'rose 6' }
            ]
        }
    ]
};

export const baseBarOption = {
    grid: {
        top: 20,
        bottom: 30,
        right: 35
    },
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            barWidth: 18,
            data: colorList.map((v) => {
                return {
                    value: 200 * Math.random(),
                    itemStyle: {
                        color: v
                    }
                };
            }),
            type: 'bar'
        }
    ]
};

export const baseCircleOption = {
    title: {
        text: '60%',
        top: 'center',
        left: 'center',
        textStyle: {
            fontSize: 12
        }
    },
    series: [
        {
            // 进度圆环（深色）
            name: '进度',
            type: 'pie',
            radius: ['60%', '60%'],
            center: ['50%', '50%'],
            startAngle: 90,
            clockwise: false,
            label: {
                show: false
            },
            data: [
                {
                    value: 60,
                    itemStyle: {
                        color: 'rgba(229, 230, 235, 1)',
                        borderWidth: 8,
                        borderColor: 'rgba(229, 230, 235, 1)'
                    }
                },
                {
                    value: 70,
                    itemStyle: {
                        color: 'red',
                        borderWidth: 8,
                        borderColor: 'red'
                    }
                }
            ]
        }
    ]
};

export const basePieCircle = {
    graphic: {
        //图形中间文字
        elements: [
            {
                type: 'text',
                left: 'center',
                top: '30%',
                style: {
                    text: '设备总数',
                    textAlign: 'center',
                    fill: 'rgba(30, 41, 69, 1)',
                    fontFamily: 'PingFang SC',
                    fontSize: 14
                }
            },
            {
                type: 'text',
                left: 'center',
                top: '50%',
                style: {
                    text: '273',
                    textAlign: 'center',
                    fill: 'rgba(30, 41, 69, 1)',
                    fontSize: 22
                }
            },
            {
                type: 'text',
                left: '56%',
                top: '55%',
                style: {
                    text: '个',
                    textAlign: 'center',
                    fill: 'rgba(30, 41, 69, 1)',
                    fontSize: 10
                }
            }
        ]
    },
    series: [
        {
            name: '视频监控预警结果',
            type: 'pie',
            radius: ['80%', '100%'],
            avoidLabelOverlap: false,
            label: {
                show: true
            },
            labelLine: {
                show: true
            },
            color: ['rgba(81, 138, 131, 1)', 'rgba(110, 192, 170, 1)'],
            data: [
                { value: 1048, name: '在线设备' },
                { value: 735, name: '离线设备' }
            ]
        }
    ]
};
