import { clone } from 'ramda'
import { CONFIG_ITEM_TYPE, getDefaultCellForm } from '../constants'
import { isNumber, isString } from './common'

/**
 * 将单元格行列索引转换为字符串
 * @example convertToAbsoluteCellRef(0, 1) => `$A&1`
 * @param {number} row
 * @param {number} column
 * @returns {string}
 */
export const convertToAbsoluteCellRef = (row, column) => {
  column += 1
  row += 1

  // 将列号转换为列字母
  let colLetter = ''
  while (column > 0) {
    let remainder = (column - 1) % 26
    colLetter = String.fromCharCode(65 + remainder) + colLetter
    column = Math.floor((column - 1) / 26)
  }

  return `$${colLetter}$${row}`
}

export const buildAuthority = (allowList = []) => {
  const authority = {
    isAlert: false,
    selectLockedCells: 1, //选定锁定单元格
    selectunLockedCells: 1, //选定解除锁定的单元格
    formatCells: 1, //设置单元格格式
    formatColumns: 1, //设置列格式
    formatRows: 1, //设置行格式
    insertColumns: 1, //插入列
    insertRows: 1, //插入行
    insertHyperlinks: 1, //插入超链接
    deleteColumns: 1, //删除列
    deleteRows: 1, //删除行
    sort: 1, //排序
    filter: 1, //使用自动筛选
    usePivotTablereports: 1, //使用数据透视表和报表
    editObjects: 1, //编辑对象
    editScenarios: 1, //编辑方案
    sheet: 1, //如果为1或true，则该工作表受到保护；如果为0或false，则该工作表不受保护。
    hintText: '', //弹窗提示的文字
    algorithmName: 'None', //加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
    saltValue: null, //密码解密的盐参数，为一个自己定的随机数值
    allowRangeList: [
      // {
      //   //区域保护
      //   name: 'area', //名称
      //   password: '', //密码
      //   hintText: '555', //提示文字
      //   algorithmName: 'None', //加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
      //   saltValue: null, //密码解密的盐参数，为一个自己定的随机数值
      //   sqref: '$C$3:$E$3' //区域范围
      // },
      // {
      //   //区域保护
      //   name: 'area', //名称
      //   password: '', //密码
      //   hintText: '666', //提示文字
      //   algorithmName: 'None', //加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
      //   saltValue: null, //密码解密的盐参数，为一个自己定的随机数值
      //   sqref: '$D$4' //区域范围
      // }
    ]
  }

  allowList.map((ite) => {
    if (ite.type !== 'table') {
      const { r, c } = ite

      authority.allowRangeList.push({
        //区域保护
        name: 'area', //名称
        password: '', //密码
        hintText: '', //提示文字
        algorithmName: 'None', //加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
        saltValue: null, //密码解密的盐参数，为一个自己定的随机数值
        // '$C$3:$E$3' //区域范围
        sqref: convertToAbsoluteCellRef(r, c)
      })
      return
    }

    ite.value.map((row) => {
      row.columns?.map?.((col) => {
        const { r, c } = col

        authority.allowRangeList.push({
          //区域保护
          name: 'area', //名称
          password: '', //密码
          hintText: '', //提示文字
          algorithmName: 'None', //加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
          saltValue: null, //密码解密的盐参数，为一个自己定的随机数值
          // '$C$3:$E$3' //区域范围
          sqref: convertToAbsoluteCellRef(r, c)
        })
      })
    })
  })

  return authority
}

export const buildCellField = (field = {}) => {
  return `${field.table}.${'$'}{${field.value}}`
}

export const buildCellFieldLabel = (field = {}) => {
  return `${field.tableDesc}.${field.label}`
}

export function getDPI() {
  var tempDiv = document.createElement('div')
  tempDiv.style.width = '1in'
  tempDiv.style.visibility = 'hidden'
  document.body.appendChild(tempDiv)
  var dpi = tempDiv.offsetWidth
  document.body.removeChild(tempDiv)
  return dpi
}

export function mmToPixel(mm, dpi) {
  // 1 inch = 25.4 mm
  var inches = mm / 25.4
  var pixels = inches * dpi
  return Math.round(pixels)
}

export function a4SizeInPixels() {
  var dpi = getDPI()
  var width_mm = 210 // A4纸宽度，单位：毫米
  var height_mm = 297 // A4纸高度，单位：毫米
  var width_px = mmToPixel(width_mm, dpi)
  var height_px = mmToPixel(height_mm, dpi)
  return { width: width_px, height: height_px }
}

/**
 * 计算json数据大小，单位bytes
 * @param {*} str
 * @returns
 */
export function getActualByteSize(str) {
  if (typeof str !== 'string') {
    str = JSON.stringify(str)
  }

  let bytes = 0
  for (let i = 0; i < str.length; i++) {
    const codePoint = str.charCodeAt(i)
    if (codePoint <= 0x7f) {
      bytes += 1
    } else if (codePoint <= 0x7ff) {
      bytes += 2
    } else if (codePoint <= 0xffff) {
      bytes += 3
    } else {
      bytes += 4
      i++ // Surrogate pair takes 2 indices
    }
  }

  console.log('🚀 ~ getActualByteSize ~ bytes:', bytes / 1024, 'KB')
  return bytes
}

/**
 * 设置  本地localStorage缓存
 * @param {string} key
 * @param {any} obj
 */
export function setStorage(key, obj) {
  if (typeof obj === 'string') {
    localStorage.setItem(key, obj)
  } else {
    localStorage.setItem(key, JSON.stringify(obj))
  }
}

/**
 * 获取 本地localStorage缓存
 * @param {string} key
 * @returns {any}
 */
export function getStorage(key) {
  const val = localStorage.getItem(key)
  try {
    return JSON.parse(val)
  } catch (e) {
    return val
  }
}

/**
 * 检查选区是否只有一个单元格
 * @returns {boolean} true 表示选区只有一个单元格， false 表示选区有多个单元格
 */
export function checkIsSingleCellSelected() {
  const selection = window.luckysheet.getRange()?.[0] ?? []
  const mergeInfo = window.luckysheet.getConfig().merge ?? {}
  const r1 = selection?.row?.[0] ?? 0
  const r2 = selection?.row?.[1] ?? 0
  const c1 = selection?.column?.[0] ?? 0
  const c2 = selection?.column?.[1] ?? 0

  if (r2 - r1 === 0 && c2 - c1 === 0) {
    return true
  }

  for (const key in mergeInfo) {
    const item = mergeInfo[key]
    // 检查选中的单元格是否在合并单元格范围内
    if (
      r1 === item.r &&
      r2 === item.r + item.rs - 1 &&
      c1 === item.c &&
      c2 === item.c + item.cs - 1
    ) {
      return true
    }
  }

  return false
}

/**
 * 判断哪个sheet是激活的
 * @param {*} sheet
 * @returns {boolean} true: 是激活的sheet，false: 不是激活的sheet
 */
export const checkActiveSheet = (sheet = {}) => sheet?.status + '' === '1'

/**
 * 判断选区是否有空单元格
 * @param {*} luckysheet
 * @param {Array} sheets
 * @param {Array} range
 * @returns {boolean} true: 有空单元格，false: 没有空单元格
 */
export function checkRangeCellsHasEmptyField(luckysheet, sheets = [], range = []) {
  if (!luckysheet) {
    return
  }

  const rangeObj = {}

  range?.map?.((item) => (rangeObj[`${item.r}_${item.c}`] = item))

  const activeSheet = sheets?.find?.(checkActiveSheet)

  if (!activeSheet) {
    return true
  }

  const hasEmptyField = activeSheet?.celldata?.find?.((cell) => {
    const isSelected = `${cell.r}_${cell.c}` in rangeObj
    const isSingleCell = !cell.v.mc
    const isMergeTopLeftCell = cell.v.mc?.rs || cell.v.mc?.cs

    if ((isSelected && isSingleCell) || (isSelected && isMergeTopLeftCell)) {
      if (cell.v.v == null) {
        return true
      }
    }
  })

  return !!hasEmptyField
}

// ============ NOTE: 新的 luckysheet utils ============
/**
 * 获取当前选中的单元格
 * @returns {[[number, number]]}
 */
export function getSelectRangeCells() {
  if (!window.luckysheet) {
    return []
  }

  const cells = []
  const selectedRanges = window.luckysheet.getRange()

  selectedRanges?.map?.((range) => {
    for (let r = range.row[0]; r <= range.row[1]; r++) {
      for (let c = range.column[0]; c <= range.column[1]; c++) {
        const cell = [r, c]

        cells.push(cell)
      }
    }
  })

  return cells
}

/**
 * @description 返回luckysheet.getAllSheets()数组中单个sheet的配置信息
 * @param {Object} sheet luckysheet.getAllSheets()数组中的元素
 * @returns {Object} { calcChain, celldata, frozen, hyperlink, images, index, name, order }
 */
export function getSheetConfig(sheet) {
  const { calcChain, celldata, config, frozen, hyperlink, images, index, name, order, status } =
    sheet ?? {}

  formatCellData(celldata)
  return { calcChain, celldata, config, frozen, hyperlink, images, index, name, order, status }
}

export function getSheetExtraCustomCellConfigs(
  cellData = [],
  sheetIndex,
  extraCustomCellConfigs = {}
) {
  if (!extraCustomCellConfigs[sheetIndex]) {
    return {}
  }

  const res = {}

  cellData?.map?.((cell) => {
    if (checkIsSingleCellOrMergedCellTopLeft(cell)) {
      // TODO: 暂时空的单元格，但右侧配置了属性，也一起收集
      const obj = extraCustomCellConfigs[sheetIndex][`${cell.r}_${cell.c}`]

      if (obj) {
        res[`${cell.r}_${cell.c}`] = obj
      }
    }
  })

  return res
}

/**
 * @description 判断是否为单个单元格或合并单元格的左上角单元格
 * @param {Object} cell
 * @returns {Boolean}
 */
export function checkIsSingleCellOrMergedCellTopLeft(cell) {
  if (!cell.v) {
    return false
  }

  const isSingleCell = !cell.v.mc
  const isMergeTopLeftCell = cell.v.mc?.rs || cell.v.mc?.cs
  return isSingleCell || isMergeTopLeftCell
}

/**
 * @description 获取单元格行索引
 * @param {string} rcString
 * @returns {number | NaN}
 */
export function getRowColumnIndexFromCellKey(rcString = '') {
  const [r, c] = rcString.split('_')
  return [r !== '' ? Number(r) : NaN, r !== '' ? Number(c) : NaN]
}

/**
 * @description 提取嵌套表名和字段名
 * @param {string} str
 * @returns {object} {tableName: string, variableName: string}
 */
export function extractTableNameAndVariable(str = '') {
  if (typeof str !== 'string') {
    return {}
  }

  // 正则表达式匹配可能包含中文的表名
  const tableNamePattern = /([\w\u4e00-\u9fa5]+)(?=\.\$\{)/
  const tableNameMatch = str.match(tableNamePattern)

  // 正则表达式匹配可能包含中文的变量名
  const variableNamePattern = /([\w\u4e00-\u9fa5]+)(?=\})/
  const variableNameMatch = str.match(variableNamePattern)

  if (tableNameMatch && variableNameMatch) {
    return {
      tableName: tableNameMatch[1],
      variableName: variableNameMatch[1]
    }
  } else {
    return {}
  }
}

export function buildExtendCellOrigins(celldata = [], extraCustomCellConfig = {}) {
  const extendCellOrigins = {}

  celldata?.forEach?.((cell) => {
    const { r, c, v } = cell

    if (extendCellOrigins[`${r}_${c}`]) {
      return
    }

    if (!v) {
      // TODO: 这里后面看下会不会有bug
      return
    }

    if (!v.v) {
      if (v.mc && !v.mc.rs) {
        return
      }

      extendCellOrigins[`${r}_${c}`] = { r, c }
    }

    const cellCfg = extraCustomCellConfig[`${r}_${c}`]

    if (!cellCfg) {
      extendCellOrigins[`${r}_${c}`] = { r, c }
      return
    }

    extendCellOrigins[`${r}_${c}`] = { r, c }
    const { tableName, variableName } = extractTableNameAndVariable(v.v ?? '')

    if (!(tableName && variableName)) {
      return
    }

    const extendRowOrColumn = Number(cellCfg.extendRowOrColumn)

    for (let i = r; i <= extendRowOrColumn - 1; i++) {
      extendCellOrigins[`${i}_${c}`] = { r, c }
    }
  })

  return extendCellOrigins
}

export function completeExtraCustomCellConfigs(extendCellOrigins = {}, extraCustomCellConfig = {}) {
  const fullExtraCustomCellConfigs = { ...extraCustomCellConfig }
  for (const key in extendCellOrigins) {
    if (Object.prototype.hasOwnProperty.call(extendCellOrigins, key)) {
      if (!fullExtraCustomCellConfigs[key]) {
        fullExtraCustomCellConfigs[key] = getDefaultCellForm()
      }
    }
  }

  return fullExtraCustomCellConfigs
}

export function buildColumnStartCoords(extraCustomCellConfig = {}) {
  const columnStartCoords = {}
  for (const key in extraCustomCellConfig) {
    if (Object.prototype.hasOwnProperty.call(extraCustomCellConfig, key)) {
      const [rowIndex, colIndex] = getRowColumnIndexFromCellKey(key)
      columnStartCoords[key] = { r: rowIndex, c: colIndex }
    }
  }

  return columnStartCoords
}

export function buildOriginCellCoordsDbMapping(celldata = []) {
  const originCellCoordsDbMap = {}
  celldata?.forEach?.((cell) => {
    const { tableName, variableName } = extractTableNameAndVariable(cell.v?.v ?? '')
    if (tableName && variableName) {
      const { r, c } = cell
      originCellCoordsDbMap[`${r}_${c}`] = {
        tableName,
        variableName
      }
    }
  })

  return originCellCoordsDbMap
}

const MessyCodeFontStyleList = ['Times New Roman']

/**
 * 判断是否是乱码字体
 * @param {*} ff
 * @returns {Boolean} true: 会乱码 false: 不会乱码
 */
export const judgeFontStyleIsMessyCode = (ff) => !ff || MessyCodeFontStyleList.includes(ff)

/**
 * @deprecated 暂时废弃不用
 * @param {*} sheets
 * @returns
 */
export const convertCellDataFontStyle2ST = (celldata = []) => {
  celldata?.forEach?.((cell) => {
    // if (judgeFontStyleIsMessyCode(cell?.v?.ff)) {
    //   cell.v.ff = '宋体'
    // }
    cell.v.ff = '宋体'
  })

  return celldata
}

/**
 * @deprecated 暂时废弃不用
 * @param {*} sheets
 * @returns
 */
export const convertCellFontStyle = (sheets = []) => {
  sheets?.forEach?.((sheet) => {
    sheet.data = []
    convertCellDataFontStyle2ST(sheet.celldata)
  })

  return sheets
}

/**
 * 格式化单元格
 * @param {*} celldata
 * @returns
 */
export const formatCellData = (celldata = []) => {
  celldata?.forEach?.((cell) => {
    cell.v.ff = '宋体'
    if (cell?.v?.ct?.t !== 'inlineStr') {
      cell.v.ct = {
        fa: '@',
        t: 's'
      }
    }
  })

  return celldata
}

/**
 * 格式化所有工作表的单元格
 * @param {*} sheets
 * @returns
 */
export const formatSheetsCellData = (sheets = []) => {
  sheets?.forEach?.((sheet) => {
    sheet.data = []
    formatCellData(sheet.celldata)
  })

  return sheets
}

/**
 * 判断是否是base64图片
 * @param {*} str
 * @returns {boolean}
 */
export const judgeIsBase64Image = (str) => {
  // 正则表达式匹配Base64编码的图片
  const base64ImagePattern = /^data:image\/(png|jpg|jpeg|gif);base64,([A-Za-z0-9+/]{32,}={0,2})$/
  return base64ImagePattern.test(str)
}

export const generateImageObj = () => {
  const imageObj = {
    type: '1',
    src: '',
    originWidth: 73,
    originHeight: 54,
    default: {
      width: 0,
      height: 0,
      left: 0,
      top: 0
    },
    crop: {
      // width: 73,
      // height: 54,
      width: 0,
      height: 0,
      offsetLeft: 0,
      offsetTop: 0
    },
    isFixedPos: false,
    fixedLeft: 0,
    fixedTop: 0,
    border: {
      width: 0,
      radius: 0,
      style: 'solid',
      color: '#000'
    },
    focusColumnIndex: 0,
    focusRowIndex: 0
  }

  return imageObj
}

export const generateRandomImageId = (r, c, mc, prefix) => {
  if (prefix == null) {
    prefix = 'img'
  }

  let userAgent = window.navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').split('')

  let mid = ''

  for (let i = 0; i < 12; i++) {
    mid += userAgent[Math.round(Math.random() * (userAgent.length - 1))]
  }

  let time = new Date().getTime()

  const { rs, cs } = mc ?? {}

  if (rs != null && cs != null) {
    return `${prefix}_${mid}_${time}_r-${r}c-${c}rs-${rs}cs-${cs}`
  }

  // return `${prefix}_${mid}_${time}_${r}_${c}`
  return `${prefix}_${mid}_${time}_r-${r}c-${c}`
}

export const extractValuesFromImageId = (inputString) => {
  // 使用正则表达式匹配 r、c、rs 和 cs
  const rMatch = inputString.match(/r-(\d+)/)
  const cMatch = inputString.match(/c-(\d+)/)
  const rsMatch = inputString.match(/rs-(\d+)/)
  const csMatch = inputString.match(/cs-(\d+)/)

  // 初始化结果对象
  const result = {
    r: rMatch ? rMatch[1] : null,
    c: cMatch ? cMatch[1] : null
  }

  // 如果提取到 rs 和 cs，则添加 mc 对象
  if (rsMatch && csMatch) {
    result.mc = {
      rs: rsMatch[1],
      cs: csMatch[1]
    }
  }

  return result
}

// const cellTemplate = {
//   r: 0,
//   c: 0,
//   v: {
//     ct: {
//       fa: '@',
//       t: 's'
//     },
//     fs: 14,
//     fc: '#000000',
//     ff: '宋体',
//     bl: 1,
//     ht: 0,
//     vt: 0,
//     tb: 1,
//     v: '真实值',
//     qp: 1,
//     m: '显示值',
//     mc: {
//       r: 0,
//       c: 0,
//       rs: 1,
//       cs: 6
//     }
//   }
// }

export const getCellWidthAndHeight = (cell, luckysheet) => {
  let width = 0
  let height = 0

  if (!luckysheet) {
    return { width, height }
  }
  if (!cell) {
    return { width, height }
  }

  const { r, c, mc } = cell

  if (!mc) {
    return {
      width: luckysheet.getColumnWidth([c])[c],
      height: luckysheet.getRowHeight([r])[r]
    }
  }

  const { rs, cs } = mc

  for (let i = 0; i < rs; i++) {
    height += luckysheet.getRowHeight([r + i])[r + i]
    // console.log('🚀 ~ getCellWidthAndHeight ~ height:', height)
  }

  for (let i = 0; i < cs; i++) {
    width += luckysheet.getColumnWidth([c + i])[c + i]
    // console.log('🚀 ~ getCellWidthAndHeight ~ width:', width)
  }

  return {
    width,
    height
  }
}

export const getCellTopAndLeft = (cell, luckysheet) => {
  let top = 0
  let left = 0

  if (!luckysheet) {
    return { top, left }
  }

  if (!cell) {
    return { top, left }
  }

  const { r, c } = cell

  // 获取单元格的top和left
  for (let i = 0; i < r; i++) {
    // 2个循环内的1，是下边框高度1
    top += luckysheet.getRowHeight([i])[i] + 1
  }

  for (let j = 0; j < c; j++) {
    left += luckysheet.getColumnWidth([j])[j] + 1
  }

  return {
    top,
    left
  }
}

export const getSheetsHasConfigFields = () => {
  if (!window.luckysheet) {
    return []
  }

  const fields = []
  const sheets = window.luckysheet.getAllSheets()

  sheets.forEach((sheet) => {
    const { celldata, index, order } = { ...sheet }
    celldata.forEach((cell) => {
      const v = cell?.v?.v || ''
      const { r, c } = cell
      const { tableName, variableName } = { ...extractTableNameAndVariable(cell.v?.v ?? '') }
      if (tableName && variableName) {
        fields.push({
          tableName,
          variableName,
          r,
          c,
          sheetName: sheet.name
          // 先保留
          // index,
          // order
        })
      }
    })
  })

  return fields
}

/**
 * 获取打印区域，只要最右、最下的单元格有数据都会被算入打印区域的边界
 * @returns
 */
export const getPrintSheetArea = () => {
  const sheetData = window.luckysheet.getSheetData()
  // console.log('🚀 ~ util getPrintSheetArea ~ sheetData:', sheetData)
  let objRowColumn = {
    row: [0, 0], //行
    column: [0, 0] //列
  }
  // * item是行、index是行索引、it是一行里的一格、itemIndex是这一格在这一行里的列索引
  sheetData.forEach((item, index) => {
    //行数
    item.forEach((it, itemIndex) => {
      if (it) {
        if (objRowColumn.row[1] < index) {
          objRowColumn.row[1] = index //row第二位
        }
        if (objRowColumn.column[1] < itemIndex) {
          objRowColumn.column[1] = itemIndex //column第二位
        }
      }
    })
  })
  return objRowColumn
}

// 连续8行有数据时，列索引有效
const VALID_COLUMN_THRESHOLD = 8

function getValidRange(data) {
  let firstValidRow = null
  let lastValidRow = null
  let firstValidCol = null
  let lastValidCol = null

  // 遍历数据以确定有效矩形区域的边界
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      if (data[row][col] != null && data[row][col] != undefined) {
        if (firstValidRow == null) firstValidRow = row
        lastValidRow = row
        if (firstValidCol == null || col < firstValidCol) firstValidCol = col
      }
    }
  }

  for (let col = firstValidCol; col < data[0].length; col++) {
    let columnIsValid = false
    let validRowCount = 0
    for (let row = firstValidRow; row <= lastValidRow; row++) {
      if (data[row][col] != null && data[row][col] != undefined) {
        columnIsValid = true
        validRowCount++

        if (validRowCount >= VALID_COLUMN_THRESHOLD) {
          break
        }
      }
    }

    if (columnIsValid && validRowCount >= VALID_COLUMN_THRESHOLD) {
      // console.log(`true col: ${col}`)
      lastValidCol = col
    } else {
      // console.log(`break col: ${col}, lastValidCol: ${lastValidCol}`)
      // 一旦发现无效列，停止检查后续列
      break
    }
  }

  return {
    rows: [firstValidRow, lastValidRow],
    cols: [firstValidCol, lastValidCol]
  }
}

/**
 * 获取所有有效的单元格
 */
export const filterValidCells = (sheets = []) => {
  // console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ filterValidCells ~ sheets:', sheets)
  const newSheets = []

  sheets.map((sheet) => {
    const newCellData = []
    const { celldata, data, index, name } = sheet
    // const validRange = getValidRange(data)
    // console.log('🚀 ~ filterValidCells ~ rows, cols:', index, name, JSON.stringify(validRange))
    const { rows = [], cols = [] } = { ...getValidRange(data) }
    celldata.map((cell) => {
      const { r, c } = { ...cell }
      if (r >= rows[0] && r <= rows[1] && c >= cols[0] && c <= cols[1]) {
        newCellData.push(cell)
      }
    })

    newSheets.push({
      ...sheet,
      celldata: newCellData
    })
  })
  return newSheets ?? []
}
