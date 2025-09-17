<template>
  <el-row :gutter="20" id="edit-view">
    <el-col v-if="!isPreview" :span="4" :xs="24">
      <ContentWrap class="h-1/1" :bodyStyle="{ height: '100%' }">
        <DatasetTree
          class="datasetWrap"
          @node-dragend="onDataDragEnd"
          :examineId="query.examineProjectId"
        />
        <!-- <el-button><input id="uploadBtn" type="file" @change="loadExcel" /></el-button> -->
        <!-- <el-button type="primary" @click="handleEditConfig">读取并修改配置</el-button> -->
        <!-- <span>数据管理{{ JSON.stringify(cellForm) }}</span>
          <el-button type="primary">新增</el-button> -->
      </ContentWrap>
    </el-col>
    <el-col :span="centerColSpan" :xs="24">
      <div class="center">
        <!-- 供luckysheet导出按钮调用 -->
        <button id="exportXlsxBtn" style="display: none" @click="handleExport">导出xlsx</button>
        <div class="top-operation" v-if="!isPreview">
          <el-upload
            ref="uploadRef"
            class="upload-btn"
            :style="{ width: '100%' }"
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleChange"
          >
            <template #trigger>
              <el-button color="#3F6297" :icon="Plus" :style="{ width: '100%' }">
                导入excel
              </el-button>
            </template>
          </el-upload>
        </div>
        <div :class="[isPreview ? 'preview-sheetRoot' : '', 'sheetRoot']" id="luckysheetWrap"></div>
        <div class="operation" v-if="!isPreview">
          <!-- 你们看情况放开 -->
          <!-- <el-button @click="handleCheckPrintArea">检测打印区域</el-button> -->
          <el-button @click="handleCancel">取消</el-button>
          <el-button color="#3F6297" plain @click="handlePublish(SUBMIT_TYPES.save)">保存</el-button>
          <el-button color="#3F6297" @click="handlePublish(SUBMIT_TYPES.publish)">
            保存并发布
          </el-button>
        </div>
      </div>
    </el-col>
    <el-col v-if="!isPreview" :span="4" :xs="24">
      <ContentWrap>
        <div>
          <el-tabs @tab-change="handleConfigFormChange" v-model="currentConfigFormType">
            <el-tab-pane label="单元格属性" name="cell">
              <!-- v-if="currentConfigFormType === 'cell'" -->
              <CellConfigForm
                :data="cellForm"
                :sheetBlockData="sheetBlockData"
                :selectDataSourceOptions="selectDataSourceOptions"
                :treeDataSourceOptions="treeDataSourceOptions"
                @change="handleCellFormChange"
                @change-block-form="handleBlockFormChange"
                @delete:block-form="handleDeleteBlock"
              />
            </el-tab-pane>
            <el-tab-pane label="工作表属性" name="sheet">
              <!-- v-if="currentConfigFormType === 'sheet'" -->
              <SheetConfigForm
                :data="sheetConfigForm.data[currentSheetIndex] ?? getDefaultSheetConfigForm()"
                :sheetsOptions="sheetsOptions.data"
                @change="handleSheetConfigChange"
              />
            </el-tab-pane>
          </el-tabs>
          <!-- <el-button type="primary" @click="handleConfigFormChange('cell')">单元格属性</el-button>
          <el-button type="primary" @click="handleConfigFormChange('sheet')">工作表属性</el-button> -->
        </div>
      </ContentWrap>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import LuckyExcel from 'luckyexcel'
import { clone, is, isNil } from 'ramda'
import * as InspectionItemApi from '@/api/inspectionItem'
import { useTagsViewStore } from '@/store/modules/tagsView'
import CellConfigForm from '@/components/luckysheet/CellConfigForm/CellConfigForm.vue'
import SheetConfigForm from '@/components/luckysheet/SheetConfigForm/SheetConfigForm.vue'
import {
  CELL_EXTEND_MAP,
  AGGREGATE_TYPE_MAP,
  getDefaultCellForm,
  getDefaultBlockForm,
  getDefaultSheetConfigForm,
  TREE_DATASOURCE_OPTIONS,
  VALUE_TYPE_OPTIONS,
  TABLE_TYPE_MAP,
  BASIC_FIELDS_LABEL,
  BASIC_TABLE_REQUEST_STATUS_MAP
} from '@/components/luckysheet/constants'
import rsLogger from '@/components/luckysheet/utils/logger'
import {
  buildCellField,
  buildCellFieldLabel,
  getStorage,
  setStorage,
  getSelectRangeCells,
  getSheetConfig,
  getSheetExtraCustomCellConfigs,
  buildExtendCellOrigins,
  buildColumnStartCoords,
  completeExtraCustomCellConfigs,
  buildOriginCellCoordsDbMapping,
  getRowColumnIndexFromCellKey,
  convertCellFontStyle,
  formatSheetsCellData,
  extractTableNameAndVariable,
  getPrintSheetArea,
  filterValidCells
} from '@/components/luckysheet/utils/util'
import { exportSheetExcel } from '@/components/luckysheet/utils/export'
import * as DictDataApi from '@/api/system/dict/dict.type'
import { useEmitt } from '@/hooks/web/useEmitt'
import DatasetTree from './DatasetTree.vue'

const SUBMIT_TYPES = {
  save: 'save',
  publish: 'publish'
}

const AUTO_FILL_TYPES = {
  autoFill: 'autoFill'
}

const { delView } = useTagsViewStore() // 视图操作
const message = useMessage() // 消息弹窗
const { query, path } = useRoute() // 查询参数
const { push, currentRoute } = useRouter() // 路由

const isPreview = ref(path === '/inspectionItem/preview')
const centerColSpan = isPreview.value ? 24 : 16

const toolbarConfig = {
  showtoolbar: true, // 默认就是true，可以不设置
  showtoolbarConfig: {
    currencyFormat: false, //货币格式
    percentageFormat: false, //百分比格式
    numberDecrease: false, // '减少小数位数'
    numberIncrease: false // '增加小数位数
  }
}

// state
const formConfigId = ref('')
const sheetOption = ref({
  container: 'luckysheetWrap',
  lang: 'zh',
  showinfobar: false,
  ...toolbarConfig,
  hook: {
    sheetActivate: sheetActivate,
    cellEditBefore: cellEditBefore,
    cellUpdated: cellUpdated,
    workbookCreateAfter: () => {
      workbookCreateAfter(AUTO_FILL_TYPES.autoFill)
    },
    cellDragStop: cellDragStop,
    rangeSelect: rangeSelect
  },
  uploadImageBase64MaxSize: 200
})
const dragEndRC = ref({ r: -1, c: -1 })
const jsonData = ref({})
const cellForm = reactive({ data: getDefaultCellForm() })
const blockForm = reactive({ data: getDefaultBlockForm() })
const sheetConfigForm = reactive({ data: {} })
const blockData = reactive({})
let sheetBlockData = ref([])
const extraCustomCellConfigs = reactive({
  data: {}
})

// 暂无用到
const sheetDataSource = reactive({
  data: {}
})
const extendCellOrigins = reactive({
  data: {}
})

// 格式-单选下拉框-数据
const selectDataSourceOptions = reactive({ data: [] })
// 格式-树形选择器-数据
const treeDataSourceOptions = reactive({ data: [] })
// 工作表下拉框数据
const sheetsOptions = reactive({ data: [] })
const currentConfigFormType = ref('cell')
const currentSheetIndex = ref(null)
const sheetsDisplayValueOriginValueAndRCMap = reactive({ data: {} })
const baseTableMap = ref({})
const workbookCreated = ref(false)
const isAutoFillingBasicFields = ref(false)

const handleAddBasicTableEvent = (colsMap) => {
  baseTableMap.value = colsMap

  if (workbookCreated.value) {
    autoFillBasicFields()
  }
}

const { emitter } = useEmitt({
  name: BASIC_TABLE_REQUEST_STATUS_MAP.init,
  callback: handleAddBasicTableEvent
})

const setSheetsOptions = () => {
  const sheets = window.luckysheet.getAllSheets()
  const data = sheets.map((sheet) => ({
    label: sheet.name,
    value: sheet.index
  }))

  sheetsOptions.data = data
}

const handleConfigFormChange = (type) => {
  if (type === 'cell') {
    currentConfigFormType.value = type
  } else if (type === 'sheet') {
    currentConfigFormType.value = type
    setSheetsOptions()
  }
}

const handleSheetConfigChange = (key, value) => {
  const sheetIndex = window.luckysheet.getSheet().index

  if (!sheetConfigForm.data[sheetIndex]) {
    sheetConfigForm.data[sheetIndex] = getDefaultSheetConfigForm()
  }

  sheetConfigForm.data[sheetIndex][key] = value
  console.log('🚀 ~ handleSheetConfigChange ~ sheetConfigForm:', sheetConfigForm)
}

const renderField = (data) => `${data.label}[${data.value}]`

function handleCellFormChange(key, value) {
  rsLogger.log('🚀 ~ handleCellFormChange ~ key:', key, value)
  cellForm.data[key] = value

  changeCellAttr(key)
}

function handleBlockFormChange(blockForm = {}) {
  const { startCell, endCell, aggregateType, groupProperty, loopCount } = blockForm
  const _data = { startCell, endCell, aggregateType, groupProperty, loopCount }
  const sheetIndex = window.luckysheet.getSheet().index

  if (blockForm.index != null) {
    blockData[sheetIndex][blockForm.index] = _data
  } else {
    if (!blockData[sheetIndex]) {
      blockData[sheetIndex] = []
    }

    blockData[sheetIndex].push(_data)
  }

  sheetBlockData.value = blockData[sheetIndex]
}

function handleDeleteBlock(index) {
  const sheetIndex = window.luckysheet.getSheet().index
  blockData[sheetIndex].splice(index, 1)
  sheetBlockData.value = blockData[sheetIndex]
}

function setCurrentSheetIndex(sheetIndex) {
  currentSheetIndex.value = sheetIndex
}

function updateSheetsDisplayValueOriginValueAndRCMap() {
  const index = currentSheetIndex.value
  const activeSheetsDisplayValueOriginValueAndRCMap =
    sheetsDisplayValueOriginValueAndRCMap.data[index] ?? {}

  for (const key in activeSheetsDisplayValueOriginValueAndRCMap) {
    const { m, v } = activeSheetsDisplayValueOriginValueAndRCMap[key]
    const [r, c] = getRowColumnIndexFromCellKey(key)
    window.luckysheet.setCellValue(r, c, { m, v })
  }
}

// ======== ↓ luckysheet hooks ↓ ========
function workbookCreateAfter(fillType) {
  workbookCreated.value = true
  const { index: sheetIndex, order } = { ...window.luckysheet.getSheet() }
  const sheets = window.luckysheet.getAllSheets()

  sheets.map((sheet, index) => {
    const { order } = sheet
    window.luckysheet.setSheetActive(order)
  })

  window.luckysheet.setSheetActive(order)
  setCurrentSheetIndex(sheetIndex)
  setSheetsOptions()

  autoFillBasicFields()
  // if (fillType === AUTO_FILL_TYPES.autoFill) {
  // }
}

function autoFillBasicFields() {
  console.log('🚀 ~ autoFillBasicFields ~ autoFillBasicFields进入自动填充方法')
  if (isAutoFillingBasicFields.value) {
    return
  }

  console.log('🚀 ~ autoFillBasicFields ~ autoFillBasicFields执行！！！！自动填充方法')
  isAutoFillingBasicFields.value = true

  const matchBasicFieldsMap = {}
  const sheets = window.luckysheet.getAllSheets()
  const _currentSheetIndex = currentSheetIndex.value
  console.log('🚀 ~ autoFillBasicFields ~ _currentSheetIndex:', _currentSheetIndex)

  sheets.forEach((sheet) => {
    const { celldata, index, order, config: { merge } = {} } = { ...sheet }
    // window.luckysheet.setSheetActive(order)

    celldata.forEach((cell) => {
      const { r, c, v } = { ...cell }
      const { v: trueV, ct, mc } = { ...v }

      const value =
        ct?.t === 'inlineStr'
          ? (ct.s?.map((item) => item.v).join('') ?? '')?.replace(/\s+/g, '')
          : trueV
      const pureCellValue = is(String, value)
        ? (value ?? '').replace(/(\s+|[:：](?=\s*$))/g, '')
        : value
      const matchBasicField = baseTableMap.value[pureCellValue]

      if (matchBasicField) {
        const { r: mcR, c: mcC, rs, cs } = { ...merge[`${r}_${c}`] }

        if (!matchBasicFieldsMap[index]) {
          matchBasicFieldsMap[index] = {}
        }

        const fillCellC = c + (cs ?? 1)

        matchBasicFieldsMap[index][`${r}_${fillCellC}`] = {
          label: matchBasicField.fieldRemark,
          fillCellR: r,
          fillCellC,
          labelCellR: r,
          labelCellC: c,
          canFill: false
        }
      }

      if (matchBasicFieldsMap?.[index]?.[`${r}_${c}`]) {
        if (!value) {
          // console.log(
          //   '🚀 ~~ 命中自动填充:===============🎈🎈🎈🎈🎈',
          //   index,
          //   r,
          //   c,
          //   cell,
          //   matchBasicFieldsMap
          // )

          const matchField = baseTableMap.value[matchBasicFieldsMap?.[index]?.[`${r}_${c}`].label]
          const m = `${matchField?.tableDesc}.${matchField?.fieldRemark}`
          const v = `${matchField?.tableName}.\${${matchField?.fieldName}}`

          window.luckysheet.setCellValue(r, c, { m, v, bg: '#e6f4ff' }, { order })

          matchBasicFieldsMap[index][`${r}_${c}`].canFill = true

          if (!sheetsDisplayValueOriginValueAndRCMap?.data?.[index]) {
            sheetsDisplayValueOriginValueAndRCMap.data[index] = {}
          }

          sheetsDisplayValueOriginValueAndRCMap.data[index][`${r}_${c}`] = { m, v }
        } else {
          // TODO: 目前感觉有点影响性能
          const { m, v } = { ...sheetsDisplayValueOriginValueAndRCMap.data?.[index]?.[`${r}_${c}`] }
          if (m && v) {
            window.luckysheet.setCellValue(r, c, { m, v }, { order })
          }
        }
      } else {
        // TODO: 目前感觉有点影响性能
        const { m, v } = { ...sheetsDisplayValueOriginValueAndRCMap.data?.[index]?.[`${r}_${c}`] }
        if (m && v) {
          window.luckysheet.setCellValue(r, c, { m, v }, { order })
        }
      }
    })
  })

  // console.log('🚀 ~ autoFillBasicFields ~ matchBasicFieldsMap:', matchBasicFieldsMap)
  let hasAutoFill = false
  for (const key in matchBasicFieldsMap) {
    const cellFill = matchBasicFieldsMap[key]

    for (const key in cellFill) {
      const { canFill } = { ...cellFill[key] }
      if (canFill) {
        hasAutoFill = true
        break
      }
    }

    if (hasAutoFill) {
      break
    }
  }

  if (hasAutoFill) {
    ElMessage.closeAll()
    message.success({
      message: '基础字段已填充，请及时保存！',
      customClass: 'custom-message',
      offset: 150
    })
  }

  const initOrder = window.luckysheet
    .getAllSheets()
    .find((sheet) => sheet.index == _currentSheetIndex)?.order

  if (!isNil(initOrder)) {
    window.luckysheet.setSheetActive(initOrder)
  }

  isAutoFillingBasicFields.value = false
}

function sheetActivate(sheetIndex) {
  console.log('🚀 ~ sheetActivate ~ sheetIndex:', sheetIndex)
  setCurrentSheetIndex(sheetIndex)
  setTimeout(() => {
    updateSheetsDisplayValueOriginValueAndRCMap()
  }, 0)
}

function cellEditBefore(range) {
  // console.log('🚀 ~ cellEditBefore ~ range:', range)
  const r = range[0].row[0]
  const c = range[0].column[0]
  const editBeforeValue = window.luckysheet.getCellValue(r, c)

  // 加入判断，当前单元格行处于其他单元格扩展行数内
  const exData = extraCustomCellConfigs.data[currentSheetIndex.value] ?? {}
  for (const key in exData) {
    const [eR, eC] = key.split('_')
    if (c == eC) {
      const config = exData?.[key]
      const isExtend = config?.cellExtend === '2'
      const extendRowOrColumn = config?.extendRowOrColumn
      if (isExtend && r < Number(extendRowOrColumn) && r > eR) {
        // console.log('🚀 ~ onDataDragEnd ~ isExtend:', r, c, isExtend, Number(extendRowOrColumn))
        ElMessage.closeAll()
        message.warning({
          message: '编辑失败：当前单元格行处于其他单元格扩展行数内',
          customClass: 'custom-message',
          offset: 150
        })

        let timer = setTimeout(() => {
          window.luckysheet.exitEditMode()
          window.luckysheet.setCellValue(r, c, editBeforeValue, {
            isRefresh: true
          })

          if (timer) {
            clearTimeout(timer)
            timer = null
          }
        }, 0)
        return
      }
    }
  }
}

function cellUpdated(r, c, oldValue, newValue, isTriggeredByAPI) {
  // console.log(
  //   '🚀 ~ cellUpdated ~ r,c, oldValue, newValue, isTriggeredByAPI:',
  //   r,
  //   c,
  //   oldValue,
  //   newValue,
  //   isTriggeredByAPI
  // )

  const oldV = oldValue?.v ?? ''
  const newV = newValue?.v ?? ''
  const { tableName, variableName } = { ...extractTableNameAndVariable(oldV) }

  if (tableName && variableName && !newV && newV !== oldV) {
    console.log('🚀 ~ cellUpdated ~ oldV !== newV:', oldV, newV, r, c)
    window.luckysheet.setCellValue(r, c, { bg: '#ffffff' })

    // 同时移除扩展行的背景
    const extraCustomCellConfig = getExtraCustomCellConfigs(r, c)
    const { cellExtend, extendRowOrColumn } = { ...extraCustomCellConfig }
    const extendRowIndex = extendRowOrColumn ? Number(extendRowOrColumn) - 1 : 0
    const rowCount = extendRowIndex - r

    if (cellExtend === '2' && rowCount >= 0) {
      for (let rowIndex = r; rowIndex <= extendRowIndex; rowIndex++) {
        const originV = window.luckysheet.getCellValue(r, c, { type: 'v' })
        const o = window.luckysheet.getCellValue(rowIndex, c)
        const m = window.luckysheet.getCellValue(rowIndex, c, { type: 'm' })
        const v = window.luckysheet.getCellValue(rowIndex, c, { type: 'v' })

        window.luckysheet.setCellValue(rowIndex, c, { m, v, bg: '#ffffff' })
      }
    }

    const index = window.luckysheet.getSheet()?.index
    sheetsDisplayValueOriginValueAndRCMap.data[index][`${r}_${c}`] = {}
  }
}

function cellDragStop(cell, position) {
  dragEndRC.value.r = position.r
  dragEndRC.value.c = position.c
}

function rangeSelect(sheet, range) {
  console.log('🚀 ~ rangeSelect ~ range:', range)
  const cellFormData = getExtraCustomCellConfigs(range[0].row[0], range[0].column[0])
  rsLogger.log('🚀 ~ rangeSelect ~ cellFormData:', cellFormData)
  if (cellFormData) {
    cellForm.data = JSON.parse(JSON.stringify(cellFormData))
  } else {
    cellForm.data = getDefaultCellForm()
  }
}

// ======== ↑ luckysheet hooks ↑ ========

/**
 * @description 返回单元格自定义配置
 * @param {number} r 行索引
 * @param {number} c 列索引
 * @param {string} sheetIndex 工作表索引
 * @returns {Object | undefined}
 */
function getExtraCustomCellConfigs(r, c, sheetIndex) {
  console.log('🚀 ~ getExtraCustomCellConfigs ~ r, c:', r, c)
  if (!sheetIndex) {
    sheetIndex = window.luckysheet.getSheet().index
  }

  return extraCustomCellConfigs.data?.[sheetIndex]?.[`${r}_${c}`]
}

/**
 * @description 设置单元格自定义配置
 * @param {number} r 行索引
 * @param {number} c 列索引
 * @param {Object} config 单元格自定义配置
 */
function setExtraCustomCellConfigs(r, c, config) {
  const sheetIndex = window.luckysheet.getSheet().index

  if (!extraCustomCellConfigs.data?.[sheetIndex]) {
    extraCustomCellConfigs.data[sheetIndex] = {}
  }

  // 6, 用let targetCell = xxx变量引用赋值，居然set不了，Vue你真是个好框架
  if (extraCustomCellConfigs.data[sheetIndex][`${r}_${c}`]) {
    extraCustomCellConfigs.data[sheetIndex][`${r}_${c}`] = {
      ...extraCustomCellConfigs.data[sheetIndex][`${r}_${c}`],
      ...config
    }
  } else {
    extraCustomCellConfigs.data[sheetIndex][`${r}_${c}`] = config
  }
}

/**
 * @description 修改单元格自定义配置
 * @param {string} attr
 */
function changeCellAttr(attr) {
  const cells = getSelectRangeCells()
  const sheetRowColData = window.luckysheet.getSheetData()

  const extendStatusMap = {}
  const cellMap = {}
  const cellBaseAttrMap = new Map()

  cells?.map?.((cell) => {
    const r = cell[0]
    const c = cell[1]
    let config = getExtraCustomCellConfigs(r, c)

    if (!config) {
      config = getDefaultCellForm()
      setExtraCustomCellConfigs(r, c, config)
    }

    const cellData = sheetRowColData?.[r]?.[c]

    cellMap[`${r}_${c}`] = { origin: { r, c }, cellData }

    const newValue = cellForm.data[attr]
    // console.log('🚀 ~ changeCellAttr ~ newValue:', newValue, Number(newValue))

    if (attr === 'extendRowOrColumn' && cellForm.data.cellExtend === '2') {
      const extendRowIndex = newValue ? Number(newValue) - 1 : 0
      const rowCount = extendRowIndex - r
      if (rowCount >= 0) {
        extendStatusMap[`${r}_${c}`] = true

        for (let rowIndex = r; rowIndex <= extendRowIndex; rowIndex++) {
          const cellData = sheetRowColData?.[rowIndex]?.[c]
          cellMap[`${rowIndex}_${c}`] = { origin: { r, c }, cellData }
        }
      } else {
        extendStatusMap[`${r}_${c}`] = false
      }
    } else {
      // config[attr] = cellForm.data[attr]
    }

    if (attr === 'cellExtend') {
      if (newValue === '2') {
        // const extendRowOrColumn = cellForm.data.extendRowOrColumn
        // const extendRowIndex = extendRowOrColumn ? Number(extendRowOrColumn) - 1 : 0
        const extendRowIndex = config.extendRowOrColumn ? Number(config.extendRowOrColumn) - 1 : 0
        const rowCount = extendRowIndex - r

        if (rowCount >= 0) {
          extendStatusMap[`${r}_${c}`] = true

          for (let rowIndex = r; rowIndex <= extendRowIndex; rowIndex++) {
            const cellData = sheetRowColData?.[rowIndex]?.[c]
            cellMap[`${rowIndex}_${c}`] = { origin: { r, c }, cellData }
          }
        } else {
          extendStatusMap[`${r}_${c}`] = false
        }
      }

      if (config[attr] === '1') {
        // message.success('取消扩展成功')
      }

      // config[attr] = cellForm.data[attr]
    } else {
      // config[attr] = cellForm.data[attr]
    }
  })

  const recordValidRows = []

  for (const key in cellMap) {
    const [currentR, currentC] = key.split('_')
    const {
      origin: { r, c },
      cellData
    } = cellMap[key]
    const { mc, ct, v } = { ...cellData }
    const originCell = cellMap[`${r}_${c}`]
    const { cellData: originCellData } = originCell
    const { mc: originMc } = { ...originCellData }
    const currentCellIsOriginCell = `${currentR}_${currentC}` === `${r}_${c}`
    const cellHasValue = currentCellIsOriginCell
      ? false
      : (ct?.t === 'inlineStr' && ct?.s?.length) || v

    if (cellHasValue) {
      const cellBaseAttrPassObj = cellBaseAttrMap.get(currentR)

      if (cellBaseAttrPassObj) {
        cellBaseAttrPassObj[`${currentC}`] = false
      } else {
        cellBaseAttrMap.set(currentR, { [currentC]: false })
      }
    } else if (!mc && !originMc) {
      const cellBaseAttrPassObj = cellBaseAttrMap.get(currentR)

      if (cellBaseAttrPassObj) {
        cellBaseAttrPassObj[`${currentC}`] = true
      } else {
        cellBaseAttrMap.set(currentR, { [currentC]: true })
      }
    } else {
      const { r, c, rs, cs } = { ...mc }
      const { r: originR, c: originC, rs: originRs, cs: originCs } = { ...originMc }

      // 向下扩展的格式不需要判断r === originR
      if (c === originC && rs === originRs && cs === originCs) {
        const cellBaseAttrPassObj = cellBaseAttrMap.get(currentR)

        if (cellBaseAttrPassObj) {
          cellBaseAttrPassObj[`${currentC}`] = true
        } else {
          cellBaseAttrMap.set(currentR, { [currentC]: true })
        }
      } else {
        const cellBaseAttrPassObj = cellBaseAttrMap.get(currentR)

        if (cellBaseAttrPassObj) {
          cellBaseAttrPassObj[`${currentC}`] = false
        } else {
          cellBaseAttrMap.set(currentR, { [currentC]: false })
        }
      }
    }
  }

  // console.log('🚀 ~ changeCellAttr ~ cellBaseAttrMap:', cellBaseAttrMap)

  const validRowIndex = []
  for (const [rowIndex, value] of cellBaseAttrMap) {
    // console.log('🚀 ~ changeCellAttr ~ value:', rowIndex, value)
    const values = Object.values(value)
    const allTrue = values.length && !values.filter((v) => !v).length
    if (allTrue) {
      validRowIndex.push(rowIndex)
    }
  }
  // console.log('🚀 ~ changeCellAttr ~ validRowIndex:', validRowIndex)
  const cellBaseAttrAllSuccess = validRowIndex.length === cellBaseAttrMap.size
  // console.log('🚀 ~ cellBaseAttrValues:', cellBaseAttrAllSuccess)

  const extendStatusValues = Object.values(extendStatusMap)
  const allSuccess = extendStatusValues.length && !extendStatusValues.filter((v) => !v).length
  // console.log('🚀 ~ extendStatusValues:', extendStatusMap, extendStatusValues, allSuccess)

  // 赋值阶段
  if (attr === 'cellExtend') {
    const newValue = cellForm.data[attr]
    // const extendRowOrColumn = cellForm.data.extendRowOrColumn

    cells?.map?.((cell) => {
      const r = cell[0]
      const c = cell[1]
      let config = getExtraCustomCellConfigs(r, c)

      if (!config) {
        config = getDefaultCellForm()
        setExtraCustomCellConfigs(r, c, config)
      }

      config[attr] = newValue

      if (newValue === '2' && validRowIndex.length && cellBaseAttrAllSuccess && allSuccess) {
        // const extendRowIndex = extendRowOrColumn ? Number(extendRowOrColumn) - 1 : 0
        const extendRowIndex = config.extendRowOrColumn ? Number(config.extendRowOrColumn) - 1 : 0
        const rowCount = extendRowIndex - r
        if (rowCount >= 0) {
          for (let rowIndex = r; rowIndex <= extendRowIndex; rowIndex++) {
            const originV = window.luckysheet.getCellValue(r, c, { type: 'v' })
            const o = window.luckysheet.getCellValue(rowIndex, c)
            const m = window.luckysheet.getCellValue(rowIndex, c, { type: 'm' })
            const v = window.luckysheet.getCellValue(rowIndex, c, { type: 'v' })

            // 设置背景颜色，只是根据原始单元格有无值来判断
            const { tableName, variableName } = { ...extractTableNameAndVariable(originV ?? '') }
            tableName &&
              variableName &&
              window.luckysheet.setCellValue(rowIndex, c, { m, v, bg: '#e6f4ff' })
          }
        }
      }
    })

    if (newValue === '1') {
      cells?.map?.((cell) => {
        const r = cell[0]
        const c = cell[1]
        let config = getExtraCustomCellConfigs(r, c)

        if (!config) {
          config = getDefaultCellForm()
          setExtraCustomCellConfigs(r, c, config)
        }

        const extendRowIndex = config.extendRowOrColumn ? Number(config.extendRowOrColumn) - 1 : 0
        const rowCount = extendRowIndex - r
        if (rowCount >= 0) {
          for (let rowIndex = r + 1; rowIndex <= extendRowIndex; rowIndex++) {
            const originV = window.luckysheet.getCellValue(r, c, { type: 'v' })
            const o = window.luckysheet.getCellValue(rowIndex, c)
            const m = window.luckysheet.getCellValue(rowIndex, c, { type: 'm' })
            const v = window.luckysheet.getCellValue(rowIndex, c, { type: 'v' })

            window.luckysheet.setCellValue(rowIndex, c, { m, v, bg: '#ffffff' })
          }
        }

        config.extendRowOrColumn = ''
      })

      cellForm.data.extendRowOrColumn = ''

      ElMessage.closeAll()
      message.success({
        message: '取消扩展成功',
        customClass: 'custom-message',
        offset: 150
      })
    } else if (newValue === '2') {
      if (validRowIndex.length && cellBaseAttrAllSuccess && allSuccess) {
        ElMessage.closeAll()
        message.success({
          message: '扩展成功',
          customClass: 'custom-message',
          offset: 150
        })
      } else {
        ElMessage.closeAll()
        message.warning({
          message: '扩展失败，请检查扩展行数',
          customClass: 'custom-message',
          offset: 150
        })
      }
    }
  } else if (attr === 'extendRowOrColumn') {
    // 新增
    if (validRowIndex.length) {
      const extendRowOrColumn = cellForm.data.extendRowOrColumn
      if (validRowIndex.length && cellBaseAttrAllSuccess && extendStatusValues && allSuccess) {
        cells?.map?.((cell) => {
          const r = cell[0]
          const c = cell[1]
          let config = getExtraCustomCellConfigs(r, c)

          if (!config) {
            config = getDefaultCellForm()
            setExtraCustomCellConfigs(r, c, config)
          }

          const cellData = sheetRowColData?.[r]?.[c]
          cellMap[`${r}_${c}`] = { origin: { r, c }, cellData }

          // config[attr] = cellForm.data[attr]
          const newValue = cellForm.data[attr]

          if (attr === 'extendRowOrColumn' && config.cellExtend === '2') {
            const prevExtendRowIndex = config.extendRowOrColumn
              ? Number(config.extendRowOrColumn) - 1
              : 0
            const prevRowCount = prevExtendRowIndex - r
            if (prevRowCount >= 0) {
              for (let rowIndex = r; rowIndex <= prevExtendRowIndex; rowIndex++) {
                const originV = window.luckysheet.getCellValue(r, c, { type: 'v' })
                const o = window.luckysheet.getCellValue(rowIndex, c)
                const m = window.luckysheet.getCellValue(rowIndex, c, { type: 'm' })
                const v = window.luckysheet.getCellValue(rowIndex, c, { type: 'v' })

                window.luckysheet.setCellValue(rowIndex, c, { m, v, bg: '#ffffff' })
              }
            }

            const extendRowIndex = newValue ? Number(newValue) - 1 : 0
            const rowCount = extendRowIndex - r
            if (rowCount >= 0) {
              for (let rowIndex = r; rowIndex <= extendRowIndex; rowIndex++) {
                const originV = window.luckysheet.getCellValue(r, c, { type: 'v' })
                const o = window.luckysheet.getCellValue(rowIndex, c)
                const m = window.luckysheet.getCellValue(rowIndex, c, { type: 'm' })
                const v = window.luckysheet.getCellValue(rowIndex, c, { type: 'v' })

                // 设置背景颜色，只是根据原始单元格有无值来判断
                const { tableName, variableName } = {
                  ...extractTableNameAndVariable(originV ?? '')
                }
                tableName &&
                  variableName &&
                  window.luckysheet.setCellValue(rowIndex, c, { m, v, bg: '#e6f4ff' })
              }
            }

            config[attr] = cellForm.data[attr]
          } else {
            // config[attr] = cellForm.data[attr]
          }

          if (attr === 'cellExtend') {
            if (config[attr] === '2') {
              const extendRowIndex = config.extendRowOrColumn
                ? Number(config.extendRowOrColumn) - 1
                : 0
              if (extendRowIndex - r >= 0) {
                if (!extendStatusMap[`${r}_${c}`]) {
                  extendStatusMap[`${r}_${c}`] = true
                }
              } else {
                if (!extendStatusMap[`${r}_${c}`]) {
                  extendStatusMap[`${r}_${c}`] = false
                }
              }
            }

            if (config[attr] === '1') {
              // message.success('取消扩展成功')
            }
          }
        })

        ElMessage.closeAll()
        message.success({
          message: '扩展成功',
          customClass: 'custom-message',
          offset: 150
        })
      } else {
        if (attr === 'cellExtend') {
          cells?.map?.((cell) => {
            const r = cell[0]
            const c = cell[1]
            let config = getExtraCustomCellConfigs(r, c)

            if (!config) {
              config = getDefaultCellForm()
              setExtraCustomCellConfigs(r, c, config)
            }

            config[attr] = cellForm.data[attr]
          })
        }

        ElMessage.closeAll()
        message.warning({
          message: '扩展失败，请检查扩展行数',
          customClass: 'custom-message',
          offset: 150
        })
      }
    }
  } else {
    cells?.map?.((cell) => {
      const r = cell[0]
      const c = cell[1]
      let config = getExtraCustomCellConfigs(r, c)

      if (!config) {
        config = getDefaultCellForm()
        setExtraCustomCellConfigs(r, c, config)
      }

      config[attr] = cellForm.data[attr]
    })
  }
}

function onDataDragEnd(data) {
  // console.log('🚀 ~ onDataDragEnd ~ evt:', extraCustomCellConfigs.data)
  const { r, c } = dragEndRC.value
  if (r < 0 || c < 0) {
    return
  }

  // 加入判断，当前单元格行处于其他单元格扩展行数内
  const exData = extraCustomCellConfigs.data[currentSheetIndex.value] ?? {}
  for (const key in exData) {
    const [eR, eC] = key.split('_')
    if (c == eC) {
      const config = exData?.[key]
      const isExtend = config?.cellExtend === '2'
      const extendRowOrColumn = config?.extendRowOrColumn
      if (isExtend && r < Number(extendRowOrColumn) && r > eR) {
        // console.log('🚀 ~ onDataDragEnd ~ isExtend:', r, c, isExtend, Number(extendRowOrColumn))
        ElMessage.closeAll()
        message.warning({
          message: '配置失败：当前单元格行处于其他单元格扩展行数内',
          customClass: 'custom-message',
          offset: 150
        })
        return
      }
    }
  }

  if (checkCurrentSheetHasSameTableField(data, r, c)) {
    ElMessage.closeAll()
    message.warning({
      message: '当前工作表中存在重复字段，请确认配置无误。',
      customClass: 'custom-message',
      offset: 150
    })
  }

  // const luckysheetfile = window.luckysheet.getSheet()
  const v = buildCellField(data)
  const m = buildCellFieldLabel(data)
  window.luckysheet.setCellValue(
    r,
    c,
    {
      v,
      m,
      bg: '#e6f4ff'
    },
    {
      // 目前看来不设置也不会有bug
      // order: luckysheetfile.order
    }
  )

  let config = getExtraCustomCellConfigs(r, c)

  if (!config) {
    config = getDefaultCellForm()
  }

  if (data.tableType === TABLE_TYPE_MAP.baseTable.key) {
    config.allowEdit = TABLE_TYPE_MAP.baseTable.config.allowEdit
    config.isBaseData = TABLE_TYPE_MAP.baseTable.config.isBaseData
  } else {
    config.allowEdit = TABLE_TYPE_MAP.businessTable.config.allowEdit
    config.isBaseData = TABLE_TYPE_MAP.businessTable.config.isBaseData
  }

  // config.allowEdit = true

  const option = VALUE_TYPE_OPTIONS.find((ite) => {
    return ite.fieldTypes.find((ft) => ft === data.fieldType)
  })

  if (option) {
    config.valueType = option.value
  }

  setExtraCustomCellConfigs(r, c, config)
  updateCellForm(r, c, config)

  const index = window.luckysheet.getSheet()?.index
  if (v && m) {
    if (!sheetsDisplayValueOriginValueAndRCMap?.data?.[index]) {
      sheetsDisplayValueOriginValueAndRCMap.data[index] = {}
    }

    sheetsDisplayValueOriginValueAndRCMap.data[index][`${r}_${c}`] = {
      m,
      v
    }
  }

  // 同时高亮扩展行的背景
  const extraCustomCellConfig = getExtraCustomCellConfigs(r, c)
  const { cellExtend, extendRowOrColumn } = { ...extraCustomCellConfig }
  const extendRowIndex = extendRowOrColumn ? Number(extendRowOrColumn) - 1 : 0
  const rowCount = extendRowIndex - r

  if (cellExtend === '2' && rowCount >= 0) {
    for (let rowIndex = r; rowIndex <= extendRowIndex; rowIndex++) {
      const originV = window.luckysheet.getCellValue(r, c, { type: 'v' })
      const o = window.luckysheet.getCellValue(rowIndex, c)
      const m = window.luckysheet.getCellValue(rowIndex, c, { type: 'm' })
      const v = window.luckysheet.getCellValue(rowIndex, c, { type: 'v' })

      window.luckysheet.setCellValue(rowIndex, c, { m, v, bg: '#e6f4ff' })
    }
  }

  resetDragEndRC()
}

function checkCurrentSheetHasSameTableField(dragData = {}, r, c) {
  const sheetIndex = window.luckysheet.getSheet().index
  const celldata =
    window.luckysheet.getAllSheets()?.find?.((sheet) => sheet.index === sheetIndex)?.celldata ?? []
  const hasSameTableField = celldata?.find((cell) => {
    const hasSame = cell?.v?.v === buildCellField(dragData)

    return hasSame && (cell.r !== r || cell.c !== c)
  })

  return !!hasSameTableField
}

function updateCellForm(r, c, form) {
  const cellFormData = getExtraCustomCellConfigs(r, c)
  if (cellFormData) {
    cellForm.data = { ...JSON.parse(JSON.stringify(cellFormData)), ...form }
  } else {
    cellForm.data = form
  }
}

function resetDragEndRC() {
  dragEndRC.value.r = -1
  dragEndRC.value.c = -1
}

async function handleCancel() {
  delView(unref(currentRoute))
  await push({ name: 'InspectionItem' })
}

async function handlePublish(submitType) {
  window.luckysheet.exitEditMode()
  const sheets = window.luckysheet.getAllSheets()

  if (!sheets?.length) {
    ElMessage.closeAll()
    message.warning({
      message: '检测项目表单未设计，请先设计表单',
      customClass: 'custom-message',
      offset: 150
    })

    return
  }

  const sheetConfigs = []
  const _sheets = filterValidCells(sheets)

  _sheets.map((sheet) => {
    const sheetConfig = getSheetConfig(sheet)
    const _extraCustomCellConfigs = getSheetExtraCustomCellConfigs(
      sheetConfig.celldata,
      sheet.index,
      extraCustomCellConfigs.data
    )

    rsLogger.log('🚀 ~ 279 sheets.map ~ _extraCustomCellConfigs:', _extraCustomCellConfigs)

    const _dataSourceConfig = buildOriginCellCoordsDbMapping(sheetConfig.celldata)
    const _extendCellOrigins = buildExtendCellOrigins(sheetConfig.celldata, _extraCustomCellConfigs)
    const fullExtraCustomCellConfigs = completeExtraCustomCellConfigs(
      _extendCellOrigins,
      _extraCustomCellConfigs,
      sheetConfig.celldata
    )
    const columnStartCoords = buildColumnStartCoords(_extraCustomCellConfigs)

    console.log('😒fullExtraCustomCellConfigs', fullExtraCustomCellConfigs)

    sheetConfig.extraCustomCellConfigs = fullExtraCustomCellConfigs
    sheetConfig.dataSourceConfig = _dataSourceConfig
    sheetConfig.extendCellOrigins = _extendCellOrigins
    sheetConfig.columnStartCoords = columnStartCoords
    sheetConfig.sheetConfigForm = sheetConfigForm.data?.[sheet.index]

    if (blockData[sheet.index] && blockData[sheet.index].length) {
      // TODO:
      sheetConfig.blockData = blockData[sheet.index]
    } else {
      //
    }
    sheetConfigs.push(sheetConfig)
  })

  const payload = {
    examineProjectId: query.examineProjectId,
    formInfo: JSON.stringify({ sheetConfigs })
  }

  // if (formConfigId.value) {
  //   payload.id = formConfigId.value
  // }

  const isPublish = submitType === SUBMIT_TYPES.publish

  const postFunc = isPublish
    ? InspectionItemApi.publishExamineProjectForm
    : InspectionItemApi.saveOrUpdateExamineProjectForm

  const loading = ElLoading.service({
    fullscreen: false,
    text: isPublish ? '发布中...' : '保存中...',
    target: '#edit-view'
  })

  postFunc(payload)
    .then(async (res) => {
      const msg = isPublish ? '保存并发布成功' : '保存成功'
      message.success(msg)

      loading?.close?.()
      if (isPublish) {
        delView(unref(currentRoute))
        await push({ name: 'InspectionItem' })
      }
    })
    .finally(() => {
      loading?.close?.()
    })
}

const handleChange = (uploadFile) => {
  loadExcel({ target: { files: [uploadFile.raw] } })
}

const resetConfig = () => {
  extraCustomCellConfigs.data = {}
  sheetsDisplayValueOriginValueAndRCMap.data = {}
}

const loadExcel = (evt) => {
  rsLogger.log('🚀 ~ loadExcel ~ evt:', evt)
  const files = evt.target.files
  if (files == null || files.length == 0) {
    alert('没有文件被选中')
    return
  }

  let name = files[0].name
  const suffixArr = name.split('.')
  let suffix = suffixArr[suffixArr.length - 1]
  if (suffix != 'xlsx') {
    alert('当前只支持导入xlsx文件')
    return
  }

  LuckyExcel.transformExcelToLucky(files[0], function (exportJson, luckysheetfile) {
    if (exportJson.sheets == null || exportJson.sheets.length == 0) {
      alert('无法读取excel文件的内容，目前只支持xlsx文件！')
      return
    }

    rsLogger.log('exportJson', exportJson)
    // convertCellFontStyle(exportJson.sheets)
    formatSheetsCellData(exportJson.sheets)
    jsonData.value = exportJson

    const activeIndex = exportJson.sheets?.find((sheet) => sheet.status)?.index
    setCurrentSheetIndex(activeIndex)

    resetConfig()

    window.luckysheet?.destroy?.()
    workbookCreated.value = false

    sheetOption.value.data = exportJson.sheets
    window.luckysheet.create(sheetOption.value)
  })
}

const handleEditConfig = (sheetConfigs = []) => {
  // const sheets = Array.isArray(sheetConfigs) ? sheetConfigs : getStorage('sheets')
  const sheets = sheetConfigs

  if (!sheets || sheets?.length === 0) {
    return
  }

  const newSheets = clone(sheets)
  rsLogger.log('🚀 ~ handleEditConfig ~ sheets:', newSheets)
  const sheetsData = []
  const _sheetsDisplayValueOriginValueAndRCMap = {}

  newSheets.map((sheet) => {
    const {
      calcChain,
      celldata,
      config,
      frozen,
      hyperlink,
      images,
      index,
      name,
      order,
      status,
      extraCustomCellConfigs: _extraCustomCellConfigs,
      dataSourceConfig: _dataSourceConfig,
      sheetConfigForm: _sheetConfigForm
    } = sheet ?? {}
    const sheetData = {
      calcChain,
      celldata,
      config,
      frozen,
      hyperlink,
      images,
      index,
      name,
      order,
      status
    }
    sheetsData.push(sheetData)

    extraCustomCellConfigs.data[index] = _extraCustomCellConfigs ?? {}
    sheetDataSource.data[index] = _dataSourceConfig ?? []
    sheetConfigForm.data[index] = _sheetConfigForm ?? {}

    if (status) {
      setCurrentSheetIndex(index)
    }

    celldata?.forEach?.((cell) => {
      if (cell.v?.m) {
        if (!_sheetsDisplayValueOriginValueAndRCMap[index]) {
          _sheetsDisplayValueOriginValueAndRCMap[index] = {}
        }

        _sheetsDisplayValueOriginValueAndRCMap[index][`${cell.r}_${cell.c}`] = {
          m: cell.v.m,
          v: cell.v.v
        }
      }
    })
  })

  sheetsDisplayValueOriginValueAndRCMap.data = _sheetsDisplayValueOriginValueAndRCMap

  window.luckysheet?.destroy?.()
  workbookCreated.value = false

  window.luckysheet?.create?.({
    container: 'luckysheetWrap',
    lang: 'zh',
    showinfobar: false,
    ...toolbarConfig,
    data: sheetsData,
    hook: {
      sheetActivate: sheetActivate,
      cellEditBefore: cellEditBefore,
      cellUpdated: cellUpdated,
      workbookCreateAfter: () => {
        // NOTE: 上面用newSheets，这里用sheets
        workbookCreateAfter()
      },
      cellDragStop: cellDragStop,
      rangeSelect: rangeSelect
    },
    uploadImageBase64MaxSize: 200
  })
}

async function getSelectDataSource() {
  // ajax
  // TODO
  const dictOptions = await DictDataApi.getSimpleDictTypeList({ useType: 1 })
  const data = dictOptions?.map((dict) => ({ label: dict.name, value: dict.type }))

  selectDataSourceOptions.data = data
  console.log('🚀 ~ getSelectDataSource ~ dictOptions:', dictOptions)
  console.log('🚀 ~ getSelectDataSource ~ selectDataSourceOptions:', selectDataSourceOptions)

  // MOCK
  // selectDataSourceOptions.data = mock_enterprise_dataSourceOptions
}

function getTreeDataSource() {
  // ajax
  // TODO

  // MOCK
  treeDataSourceOptions.data = TREE_DATASOURCE_OPTIONS
}

async function getConfigs() {
  window.luckysheet?.destroy?.()

  const loading = ElLoading.service({
    fullscreen: false,
    text: '数据加载中...',
    target: '#edit-view'
  })

  try {
    const res = await InspectionItemApi.getExamineProjectForm({
      examineProjectId: query.examineProjectId
    })

    loading.close()

    const { id, formInfo } = res ?? {}
    const { sheetConfigs } = JSON.parse(formInfo || '{}')

    formConfigId.value = id
    handleEditConfig(sheetConfigs)
  } finally {
    loading.close()
  }
}

// 导出excel
const handleExport = async () => {
  await exportSheetExcel(window.luckysheet, 'file', true)
}

const handleCheckPrintArea = () => {
  const RowColumn = getPrintSheetArea()
  RowColumn.column[0] = 0
  console.log('🚀 ~ printSheet ~ RowColumn:', RowColumn)
  // 进行选区操作
  window.luckysheet.setRangeShow(RowColumn)
}

onMounted(() => {
  getConfigs()
  getSelectDataSource()
  getTreeDataSource()
})
</script>

<style lang="scss" scoped>
$operate-box-height: 50px;
$el-button-height: 40px;

.datasetWrap {
  height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) - var(
        --app-footer-height
      ) - var(--el-card-padding) * 2 - 15px
  );

  :deep(.tree-wrap) {
    height: calc(100% - 32px - 20px);
    overflow-y: auto;
  }
}

.center {
  flex: 1;
  width: 100%;
  height: 100%;
  height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) - var(
        --app-footer-height
      )
  );
  background-color: #fff;

  .operation {
    display: flex;
    height: 50px;
    justify-content: center;
    align-items: center;
  }
}

:deep(.upload-btn) {
  .el-upload {
    width: 100%;
  }
}

.publishBtn {
  z-index: 999;
  margin-left: 30px;
  font-size: 16px;
}

.sheetRoot {
  width: 100%;
  height: calc(100% - #{$el-button-height} - #{$operate-box-height}) !important;
}

.preview-sheetRoot {
  height: 100% !important;
}
</style>
<style lang="scss">
.custom-message {
  font-size: 18px;

  .el-message__content {
    font-size: 18px;
  }
}
</style>
