/**
 * 打印方向
 */
export const PRINT_LAYOUT_MAP = {
  // 纵向
  portrait: {
    key: 'portrait',
    label: '纵向'
  },
  // 横向
  landscape: {
    key: 'landscape',
    label: '横向'
  }
}

export const PRINT_OPTIONS = [
  {
    label: PRINT_LAYOUT_MAP.portrait.label,
    value: PRINT_LAYOUT_MAP.portrait.key
  },
  {
    label: PRINT_LAYOUT_MAP.landscape.label,
    value: PRINT_LAYOUT_MAP.landscape.key
  }
]

export const PRINT_RANGE_MAP = {
  current: {
    key: 'current',
    label: '当前工作表'
  },
  all: {
    key: 'all',
    label: '所有工作表'
  }
}

export const PRINT_RANGE_OPTIONS = [
  {
    label: PRINT_RANGE_MAP.current.label,
    value: PRINT_RANGE_MAP.current.key
  },
  {
    label: PRINT_RANGE_MAP.all.label,
    value: PRINT_RANGE_MAP.all.key
  }
]
