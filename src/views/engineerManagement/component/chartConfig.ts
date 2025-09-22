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
            radius: [20, 100],
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
