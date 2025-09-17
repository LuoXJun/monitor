import { extractTableNameAndVariable } from '../utils/util'

export const mockFields = [
  {
    desc: '姓名',
    value: 'name'
  },
  {
    desc: '年龄',
    value: 'age'
  },
  {
    desc: '籍贯',
    value: 'place'
  }
]

export const mockTreeFields = [
  {
    label: '表29',
    type: 'table',
    value: 'table29',
    children: [
      {
        dataSource: 'table29',
        label: '单元名称',
        value: 'unitName',
        type: 'field'
      },
      {
        dataSource: 'table29',
        label: '单位地址',
        value: 'unitAddress',
        type: 'field'
      },
      // 下面这4个字段用来当嵌套表字段
      {
        dataSource: 'table29',
        label: '姓名',
        value: 'name',
        type: 'field'
      },
      {
        dataSource: 'table29',
        label: '年龄',
        value: 'age',
        type: 'field'
      },
      {
        dataSource: 'table29',
        label: '身份证',
        value: 'idCard',
        type: 'field'
      },
      {
        dataSource: 'table29',
        label: '照片',
        value: 'pic',
        type: 'field'
      }
    ]
  },
  {
    label: '表1',
    type: 'table',
    value: 'table1',
    children: [
      {
        dataSource: 'table1',
        label: '姓名',
        value: 'name',
        type: 'field'
      },
      {
        dataSource: 'table1',
        label: '年龄',
        value: 'age',
        type: 'field'
      },
      {
        dataSource: 'table1',
        label: '身份证',
        value: 'idCard',
        type: 'field'
      }
    ]
  },
  {
    label: '混泥土表1',
    type: 'table',
    value: 'concrete_table_1',
    children: [
      {
        dataSource: 'concrete_table_1',
        label: '样品编号',
        value: 'yp_bh',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '混泥土部位',
        value: 'hnt_bw',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '设计等级',
        value: 'design_level',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '日期-成型',
        value: 'date_cx',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '日期-检测',
        value: 'date_jc',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '检测龄期',
        value: 'jc_lq',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '试件尺寸',
        value: 'sj_size',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '检测结果-破坏荷载-1',
        value: 'result_phhz_1',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '检测结果-破坏荷载-2',
        value: 'result_phhz_2',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '检测结果-破坏荷载-3',
        value: 'result_phhz_3',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '检测结果-强度-1',
        value: 'result_qd_1',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '检测结果-强度-2',
        value: 'result_qd_2',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '检测结果-强度-3',
        value: 'result_qd_3',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '检测结果-强度代表值',
        value: 'result_qd_dbz',
        type: 'field'
      },
      {
        dataSource: 'concrete_table_1',
        label: '达到设计百分数',
        value: 'reach_design_per',
        type: 'field'
      }
    ]
  }
]

export const MOCK_REPORT_DATA_KEY = 'mock_report_data'

export const setMockReportDataFromConfigs = (sheets = [], extraCustomCellConfigs = {}) => {
  // const data = {}
  // sheets?.map?.((sheet) => {
  //   const index = sheet.index
  //   sheet?.celldata?.map((cell) => {
  //     const { r, c, v } = cell
  //     if (v) {
  //       const { tableName, variableName } = extractTableNameAndVariable(v)
  //       console.log('🚀 ~ sheet?.celldata?.map ~ tableName:', tableName)
  //       console.log('🚀 ~ sheet?.celldata?.map ~ variableName:', variableName)
  //       // if(!data[index]) {
  //       //   data[index]
  //       // }
  //     }
  //   })
  // })
  const data = {
    1: {
      table1: [{ name: 'yzs', age: 255 }],
      table29: [
        { name: '姓名1', age: 18, pic: '备注1' },
        { name: '姓名2', age: '2024-09-18', pic: '备注2' },
        { name: '姓名3', age: 20, pic: '备注3' },
        { name: '姓名4', age: 21, pic: '备注4' },
        { name: '姓名5', age: 22, pic: '备注5' },
        { name: '姓名6', age: 23, pic: '备注6' },
        { name: '姓名7', age: 24, pic: '备注7' }
      ]
    }
  }
  // const data = {
  //   1: [
  //     { r: 2, '2_2': { name: '姓名1' }, '2_3': { age: 18 } },
  //     { r: 3, '3_2': { name: '姓名2' }, '3_3': { age: 19 } },
  //     { r: 4, '4_2': { name: '姓名3' }, '4_3': { age: 20 } },
  //     { r: 5, '5_2': { name: '姓名4' }, '5_3': { age: 21 } },
  //     { r: 6, '6_2': { name: '姓名5' }, '6_3': { age: 22 } },
  //     { r: 7, '7_2': { name: '姓名6' }, '7_3': { age: 23 } },
  //     { r: 8, '8_2': { name: '姓名7' }, '8_3': { age: 24 } }
  //   ]
  // }

  setMockReportData(data)
}

export const setMockReportData = (data) => {
  localStorage.setItem(MOCK_REPORT_DATA_KEY, JSON.stringify(data))
}

export const getMockReportData = () => {
  return JSON.parse(localStorage.getItem(MOCK_REPORT_DATA_KEY) || '{}')
}

export const mock_tableData = [{}]

export const mock_enterprise_data_1 = {
  url: 'enterprise_list_url',
  data: [
    { name: '企业1', value: '企业1' },
    { name: '企业2', value: '企业2' },
    { name: '企业3', value: '企业3' },
    { name: '企业4', value: '企业4' },
    { name: '企业5', value: '企业5' }
  ]
}
export const mock_enterprise_data_2 = {
  url: 'enterprise_list_url2',
  data: [
    { name: '企业2-1', value: '企业2-1' },
    { name: '企业2-2', value: '企业2-2' },
    { name: '企业2-3', value: '企业2-3' },
    { name: '企业2-4', value: '企业2-4' },
    { name: '企业2-5', value: '企业2-5' }
  ]
}

export const mock_enterprise_dataSourceOptions = [
  { label: '企业列表1', value: mock_enterprise_data_1.url },
  { label: '企业列表2', value: mock_enterprise_data_2.url }
]

export const get_mock_select_list = (dataSourceId) => {
  const dataSource = [mock_enterprise_data_1, mock_enterprise_data_2]
  return dataSource.find((ite) => ite.url === dataSourceId) ?? {}
}

export const mock_tree_data_1 = {
  url: 'tree_data_key_1',
  data: [
    {
      // value: 'project-1',
      value: '工程-1',
      label: '工程-1',
      children: [
        {
          // value: 'unit-project-1',
          value: '单位工程-1',
          label: '单位工程-1',
          children: [
            {
              // value: 'branch-project-1',
              value: '分部工程-1-1',
              label: '分部工程-1-1'
            },
            {
              // value: 'branch-project-1',
              value: '分部工程-1-2',
              label: '分部工程-1-2'
            }
          ]
        },
        {
          // value: 'unit-project-1',
          value: '单位工程-2',
          label: '单位工程-2',
          children: [
            {
              // value: 'branch-project-1',
              value: '分部工程-2-1',
              label: '分部工程-2-1'
            },
            {
              // value: 'branch-project-1',
              value: '分部工程-2-2',
              label: '分部工程-2-2'
            }
          ]
        }
      ]
    }
  ]
}

export const mock_tree_data_2 = {
  url: 'tree_data_key_2',
  data: [
    {
      // value: 'project-1',
      value: '工程-A',
      label: '工程-A',
      children: [
        {
          // value: 'unit-project-1',
          value: '单位工程-A',
          label: '单位工程-A',
          children: [
            {
              // value: 'branch-project-1',
              value: '分部工程-A-1',
              label: '分部工程-A-1'
            },
            {
              // value: 'branch-project-1',
              value: '分部工程-A-2',
              label: '分部工程-A-2'
            }
          ]
        },
        {
          // value: 'unit-project-1',
          value: '单位工程-B',
          label: '单位工程-B',
          children: [
            {
              // value: 'branch-project-1',
              value: '分部工程-B-1',
              label: '分部工程-B-1'
            },
            {
              // value: 'branch-project-1',
              value: '分部工程-B-2',
              label: '分部工程-B-2'
            }
          ]
        }
      ]
    }
  ]
}

export const mock_tree_dataSourceOptions = [
  { label: '工程1', value: mock_tree_data_1.url },
  { label: '工程2', value: mock_tree_data_2.url }
]

export const get_mock_tree_list = (dataSourceId) => {
  const dataSource = [mock_tree_data_1, mock_tree_data_2]
  return dataSource.find((ite) => ite.url === dataSourceId) ?? {}
}
