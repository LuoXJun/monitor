import * as ItemApi from '@/api/itemManage'
import * as DeptApi from '@/api/system/dept'
import { method, update } from 'lodash-es'

export const CONFIG_ITEM_TYPE = {
  img: 'img'
}

/**
 * 表格扩展类型
 */
export const CELL_EXTEND_MAP = {
  // 不扩展
  noExtend: '1',
  // 向下扩展
  expandToDownward: '2',
  // 向右扩展
  expandToRight: '3'
}

/**
 * 聚合类型
 */
export const AGGREGATE_TYPE_MAP = {
  // 列表
  list: 'list',
  // 分组
  group: 'group',
  // 汇总
  summary: 'summary'
}

export const BLOCK_AGGREGATE_TYPE_MAP = {
  // 列表
  list: 'list',
  // 分组
  group: 'group'
}

/**
 * 文本校验规则
 */
export const TEXT_VALID_RULE_MAP = {
  not: '0', // 无
  email: '1', // 邮箱
  mobile: '2', // 手机号
  idCard: '3', // 身份证
  custom: '99' // 自定义
}

// ========== 单元格值类型 ==========

export const VALUE_TYPE_MAP = new Map([
  [
    'text',
    {
      key: '1',
      label: '文本',
      show: true,
      fieldTypes: ['VARCHAR']
    }
  ],
  // BIGINT、INT
  [
    'date',
    {
      key: '3',
      label: '日期',
      show: true,
      fieldTypes: ['DATE', 'DATETIME']
    }
  ],
  [
    'select',
    {
      key: '4',
      label: '下拉单选',
      show: true
    }
  ],
  [
    'tree',
    {
      key: '5',
      label: '树形下拉框',
      show: false
    }
  ]
])

export const buildValueTypeOptions = () => {
  const options = []

  Array.from(VALUE_TYPE_MAP.values())?.forEach((ite) => {
    if (ite.show) {
      options.push({ value: ite.key, label: ite.label, fieldTypes: ite.fieldTypes })
    }
  })

  return options
}

export const VALUE_TYPE_OPTIONS = buildValueTypeOptions()

// ========== 单元格值类型为日期类型的格式化配置 ==========

export const DATA_FORMAT_MAP = new Map([
  [
    'date_yyyyMMdd',
    {
      key: 'yyyy.MM.dd',
      label: '年.月.日',
      type: 'date',
      format: 'YYYY.MM.DD'
    }
  ],
  [
    'date_yyyyMM',
    {
      key: 'yyyy-MM',
      label: '年-月',
      type: 'month',
      format: 'YYYY-MM'
    }
  ],
  [
    'date_yyyy',
    {
      key: 'yyyy',
      label: '年',
      type: 'year',
      format: 'YYYY'
    }
  ],
  [
    'dateTime_yyyyMMddHHmmss',
    {
      key: 'yyyy-MM-dd HH:mm:ss',
      label: '年-月-日 时:分:秒',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss'
    }
  ],
  [
    'dateTime_yyyyMMddHHmm',
    {
      key: 'yyyy-MM-dd HH:mm',
      label: '年-月-日 时:分',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm'
    }
  ]
  // [
  //   'dateTime_yyyyMMddHH',
  //   {
  //     key: 'yyyy-MM-dd HH',
  //     label: '年-月-日 时'
  //   }
  // ]
])

export const buildDateFormatOptions = () => {
  return Array.from(DATA_FORMAT_MAP.values())?.map((ite) => ({ value: ite.key, label: ite.label }))
}

export const DATA_FORMAT_OPTIONS = buildDateFormatOptions()

export function findFormatByValue(format, dateFormatMap = DATA_FORMAT_MAP) {
  for (let [key, value] of dateFormatMap) {
    if (value.key === format) {
      return [key, value]
    }
  }

  return []
}

/**
 * 默认单元格表单数据
 */
const DEFAULT_CELL_FORM = {
  cellExtend: CELL_EXTEND_MAP.noExtend,
  aggregateType: AGGREGATE_TYPE_MAP.list,
  extendRowOrColumn: '',
  valueType: VALUE_TYPE_MAP.get('text').key,
  dateFormat: DATA_FORMAT_MAP.get('date_yyyyMMdd').key,
  dataSourceId: '',
  // 下面的配置为后期可能新增的
  allowEdit: false, //是否允许编辑
  require: false, //必填项
  textValidRule: TEXT_VALID_RULE_MAP.not, //文本校验规则 0无 1邮箱 2手机号 3座机号 4身份证 99自定义
  regex: '', //自定义正则表达式
  isBaseData: false //是否为基础数据
}

export const getDefaultCellForm = () => ({ ...DEFAULT_CELL_FORM })

/**
 * 默认工作表配置数据
 */
const DEFAULT_SHEET_FORM = {
  dependSheetIndex: null,
  allowEdit: true //是否允许编辑
}

export const getDefaultSheetConfigForm = () => ({ ...DEFAULT_SHEET_FORM })

/**
 * 循环块默认数据
 */
const DEFAULT_BLOCK_FORM = {
  index: null, // 循环块索引
  startCell: '', // 起始单元格（左上角），如：A1
  endCell: '', // 结束单元格（右下角），如：E6
  aggregateType: BLOCK_AGGREGATE_TYPE_MAP.list, //聚合方式
  groupProperty: '', //分组属性
  loopCount: 1
}

export const getDefaultBlockForm = () => ({ ...DEFAULT_BLOCK_FORM })

export const TREE_API_MAP = {
  '/system/dept/list': {
    name: '部门信息',
    url: '/system/dept/list',
    api: DeptApi.getDeptPage,
    method: 'get',
    getParams: () => ({ pageNo: 1, pageSize: 100 })
  },
  '/projectInfo/list': {
    name: '项目信息',
    url: '/projectInfo/list',
    api: ItemApi.getItemList,
    method: 'get',
    getParams: () => ({})
  }
}

export const TREE_DATASOURCE_OPTIONS = [
  {
    label: TREE_API_MAP['/system/dept/list'].name,
    value: TREE_API_MAP['/system/dept/list'].url
  },
  {
    label: TREE_API_MAP['/projectInfo/list'].name,
    value: TREE_API_MAP['/projectInfo/list'].url
  }
]

export const TABLE_TYPE_MAP = {
  baseTable: {
    key: 1,
    label: '基础表',
    config: {
      allowEdit: false,
      isBaseData: true
    }
  },
  businessTable: {
    key: 2,
    label: '业务表',
    config: {
      allowEdit: true,
      isBaseData: false
    }
  }
}

export const PREVIEW_IMG_PREFIX = 'previewImg'

export const TZ_BASE_TABLE_NAME = 'tz_basetable'

export const judgeIsTzBaseTable = (tableName) => tableName === TZ_BASE_TABLE_NAME

export const BASIC_FIELDS_LABEL = [
  '报告发送方式',
  '厂家',
  '成型日期',
  '抽样数量',
  '代表数量',
  '工程部位',
  '工程名称',
  '规格型号',
  '检测类别',
  '检测项目',
  '检测依据',
  '判定标准',
  '品种',
  '取样地点',
  '取样日期',
  '收样人',
  '收样日期',
  '受检单位',
  '委托编号',
  '委托单位',
  '详情地址',
  '养护龄期',
  '样品编号',
  '样品名称',
  '样品状态',
  '已检样品处理'
]

export const BASIC_TABLE_REQUEST_STATUS_MAP = {
  init: {
    key: 'basicTable:init',
    label: '初始化'
  },
  updated: {
    key: 'basicTable:updated',
    label: '已更新'
  }
}
