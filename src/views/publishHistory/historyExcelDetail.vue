<template>
  <el-row :gutter="20">
    <el-col v-if="false" :span="4" :xs="24">
      <ContentWrap class="h-1/1" :bodyStyle="{ height: '100%' }">
        <DatasetTree class="datasetWrap" @node-dragend="onDataDragEnd" />
        <!-- <el-button><input id="uploadBtn" type="file" @change="loadExcel" /></el-button> -->
        <!-- <el-button type="primary" @click="handleEditConfig">读取并修改配置</el-button> -->
        <!-- <span>数据管理{{ JSON.stringify(cellForm) }}</span>
          <el-button type="primary">新增</el-button> -->
      </ContentWrap>
    </el-col>
    <el-col :span="centerColSpan" :xs="24">
      <div class="center">
        <div class="top-operation" v-if="false">
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
        <div class="preview-sheetRoot" id="luckysheetWrap"></div>
      </div>
    </el-col>
    <el-col v-if="publishHistoryId" :span="4" :xs="24">
      <ContentWrap>
        <CellConfigForm
          disabled
          :data="cellForm"
          :sheetBlockData="sheetBlockData"
          :selectDataSourceOptions="selectDataSourceOptions"
          :treeDataSourceOptions="treeDataSourceOptions"
          @change="handleCellFormChange"
          @change-block-form="handleBlockFormChange"
          @delete:block-form="handleDeleteBlock"
        />
      </ContentWrap>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import LuckyExcel from 'luckyexcel'
import { clone } from 'ramda'
import * as InspectionItemApi from '@/api/inspectionItem'
import * as SampleApi from '@/api/sample'
import CellConfigForm from '@/components/luckysheet/CellConfigForm/CellConfigForm.vue'
import {
  CELL_EXTEND_MAP,
  AGGREGATE_TYPE_MAP,
  getDefaultCellForm,
  getDefaultBlockForm,
  TREE_DATASOURCE_OPTIONS,
  VALUE_TYPE_OPTIONS
} from '@/components/luckysheet/constants'
import rsLogger from '@/components/luckysheet/utils/logger'
import {
  buildCellField,
  getStorage,
  setStorage,
  getSelectRangeCells,
  getSheetConfig,
  getSheetExtraCustomCellConfigs,
  buildExtendCellOrigins,
  buildColumnStartCoords,
  completeExtraCustomCellConfigs,
  buildOriginCellCoordsDbMapping
} from '@/components/luckysheet/utils/util'
import { is } from '@/utils/is'

const SUBMIT_TYPES = {
  save: 'save',
  publish: 'publish'
}

const message = useMessage() // 消息弹窗
const { query, path } = useRoute() // 查询参数

const publishHistoryId = query?.publishHistoryId
const fillRecordId = query?.fillRecordId
const centerColSpan = fillRecordId ? 24 : 20

const toolbarConfig = {
  showtoolbar: false // 默认就是true，可以不设置
}

// state
const formConfigId = ref('')
const sheetOption = ref({
  container: 'luckysheetWrap',
  lang: 'zh',
  showinfobar: false,
  ...toolbarConfig,
  hook: {
    workbookCreateAfter: () => {},
    cellDragStop: cellDragStop,
    rangeSelect: rangeSelect
  }
})
const dragEndRC = ref({ r: -1, c: -1 })
const jsonData = ref({})
const cellForm = reactive({ data: getDefaultCellForm() })
const blockForm = reactive({ data: getDefaultBlockForm() })
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

// ======== ↓ luckysheet hooks ↓ ========
function cellDragStop(cell, position) {
  dragEndRC.value.r = position.r
  dragEndRC.value.c = position.c
}

function rangeSelect(sheet, range) {
  const cellFormData = getExtraCustomCellConfigs(range[0].row[0], range[0].column[0])
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

function onDataDragEnd(data) {
  const { r, c } = dragEndRC.value
  if (r < 0 || c < 0) {
    return
  }

  // const luckysheetfile = window.luckysheet.getSheet()
  window.luckysheet.setCellValue(
    r,
    c,
    {
      v: buildCellField(data),
      m: data.label
      // bg: '#e5ffe5'
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

  const option = VALUE_TYPE_OPTIONS.find((ite) => {
    return ite.fieldTypes.find((ft) => ft === data.fieldType)
  })

  if (option) {
    config.valueType = option.value
  }

  setExtraCustomCellConfigs(r, c, config)
  updateCellForm(r, c, config)

  resetDragEndRC()
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

function handlePublish(submitType) {
  const sheets = window.luckysheet.getAllSheets()
  const sheetConfigs = []
  sheets.map((sheet) => {
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
      _extraCustomCellConfigs
    )
    const columnStartCoords = buildColumnStartCoords(_extraCustomCellConfigs)

    console.log('fullExtraCustomCellConfigs', fullExtraCustomCellConfigs)

    sheetConfig.extraCustomCellConfigs = fullExtraCustomCellConfigs
    sheetConfig.dataSourceConfig = _dataSourceConfig
    sheetConfig.extendCellOrigins = _extendCellOrigins
    sheetConfig.columnStartCoords = columnStartCoords

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

  postFunc(payload).then((res) => {
    const msg = isPublish ? '保存并发布成功' : '保存成功'
    message.success(msg)
  })

  setStorage('sheets', sheetConfigs)
}

const handleChange = (uploadFile) => {
  loadExcel({ target: { files: [uploadFile.raw] } })
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
    jsonData.value = exportJson

    window.luckysheet?.destroy?.()

    sheetOption.value.data = exportJson.sheets
    window.luckysheet.create(sheetOption.value)
  })
}

const handleEditConfig = (sheetConfigs = []) => {
  const sheets = sheetConfigs

  if (!sheets || sheets?.length === 0) {
    return
  }

  const newSheets = clone(sheets)
  const sheetsData = []
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
      extraCustomCellConfigs: _extraCustomCellConfigs,
      dataSourceConfig: _dataSourceConfig
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
      order
    }
    sheetsData.push(sheetData)

    extraCustomCellConfigs.data[index] = _extraCustomCellConfigs ?? {}
    sheetDataSource.data[index] = _dataSourceConfig ?? []
  })

  window.luckysheet?.destroy?.()
  window.luckysheet?.create?.({
    container: 'luckysheetWrap',
    lang: 'zh',
    showinfobar: false,
    allowEdit: false,
    ...toolbarConfig,
    data: sheetsData,
    hook: {
      workbookCreateAfter: () => {
        // NOTE: 上面用newSheets，这里用sheets
        sheets.map((sheet) => {
          sheet.celldata?.map?.((cell) => {
            if (cell.v.m) {
              window.luckysheet.setCellValue(
                cell.r,
                cell.c,
                { m: cell.v.m },
                { order: sheet.order }
              )
            }
          })
        })
      },
      cellDragStop: cellDragStop,
      rangeSelect: rangeSelect
    }
  })
}

function getSelectDataSource() {
  // ajax
  // TODO

  // MOCK
  selectDataSourceOptions.data = mock_enterprise_dataSourceOptions
}

function getTreeDataSource() {
  // ajax
  // TODO

  // MOCK
  treeDataSourceOptions.data = TREE_DATASOURCE_OPTIONS
}

async function getConfigs() {
  const res = await InspectionItemApi.getExamineProjectFormReleaseHistoryDetail({
    id: query.publishHistoryId
  })
  // sampleFillData.value = data
  const { id, formInfo } = res ?? {}
  const { sheetConfigs } = JSON.parse(formInfo || '{}')

  handleEditConfig(sheetConfigs)
}

async function fetchFillRecordConfigs() {
  const res = await SampleApi.getFillHistoryDetail({
    id: query.fillRecordId
  })

  const { sheetsData } = res ?? {}
  const { sheetConfigs } = JSON.parse(sheetsData || '{}')

  handleEditConfig(sheetConfigs)
}

onMounted(() => {
  if (query.publishHistoryId) {
    getConfigs()
  } else if (query.fillRecordId) {
    fetchFillRecordConfigs()
  }

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
  // height: calc(
  //   100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) - var(
  //       --app-footer-height
  //     )
  // );
  height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - 15px - var(--app-footer-height)
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
