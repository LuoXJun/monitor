<template>
  <div class="filling-view" id="fill-view">
    <div :class="['filling-view__content', { readonly: !runningFillTasks.length }]">
      <div v-show="false" class="toolbar">
        <el-button @click="handleSelectExcel">选择并填报</el-button>
        <el-button @click="handlePreview">预览</el-button>
        <el-button @click="printSheet(false, () => {}, {}, true)">打印</el-button>
        <el-button @click="printSheetAll">打印报告方案1</el-button>
        <el-button @click="printSheetAllWindowPrint">打印报告方案2</el-button>
        <el-button @click="handleExport">导出excel</el-button>
        <el-button id="printExcelBtn" style="display: none" plain v-print="printConfig">
          打印！
        </el-button>
        <!-- 供luckysheet打印按钮调用 -->
        <el-button id="printPreviewBtn" style="display: none" @click="handleTogglePrintForm">
          打开打印设置弹框
        </el-button>
        <!-- 供luckysheet导出按钮调用 -->
        <button id="exportXlsxBtn" style="display: none" @click="handleExport">导出xlsx</button>
        <!-- <el-button id="printPreviewBtn" style="display: none" @click="printExcel">打印预览</el-button> -->
        <!-- <el-button @click="downloadExcel">导出</el-button> -->
        <!-- <el-button @click="handlePrint">打印</el-button> -->
        <!-- <input id="uploadBtn" type="file" @change="loadExcel" /> -->
      </div>
      <div id="luckysheetWrap"></div>
      <div class="upload-wrap">
        <!-- <div class="upload-label">上传附件</div> -->
        <UploadFileChunk
          showUploadLabel
          wrapUseFlexRow
          useFlexRow
          class="min-w-80px"
          v-model="attachmentList"
          :disabled="!runningFillTasks.length"
          :accept="['*']"
          :limit="20"
          :limitFileSize="false"
          @success="handleUploadSuccess"
        />
        <!-- <UploadFile
          class="min-w-80px"
          @success="handleUploadSuccess"
          @remove="handleRemove"
          v-model="attachmentList"
          :disabled="!runningFillTasks.length"
          :file-type="['*']"
          :limit="10"
          :file-size="30"
        /> -->
      </div>
    </div>
    <div class="operation" v-if="runningFillTasks.length">
      <el-button color="#3F6297" @click="handleStore"><Icon icon="ep:document-add" class="mr-1"/>暂存</el-button>
      <el-button @click="handleToggleSubmitFillData"><Icon icon="ep:check" class="mr-1"/>提交</el-button>
     
    </div>
    <el-dialog v-model="dialogVisible" title="预览" width="850" center>
      <div class="modal-content">
        <img :src="screenshot" alt="" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="dialogVisible = false"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
    <div
      id="print_html"
      class="procedure"
      style="z-index: -998; display: none; text-align: center; opacity: 1"
    ></div>
    <CellEditDialog
      :visible="editDialogVisible"
      :data="{ ...editForm }"
      :cellConfig="{ ...cellConfig }"
      :selectData="selectData"
      :treeData="treeData"
      @confirm="handleConfirm"
      @cancel="handleCloseEditDialog"
    />
  </div>
  <SubmitFillData
    ref="submitFillDataRef"
    :approvalTask="sampleFillData.approvalTask"
    :approvalUser="sampleFillData.approvalUser"
    :approvalInfo="{
      approvalTask: sampleFillData.approvalTask,
      approvalUser: sampleFillData.approvalUser
    }"
    :equipmentId="sampleFillData.equipmentId"
    @submit="handleSubmitFillData"
    :uploadKey="uploadKey"
  />
  <PrintForm ref="printFormRef" @submit="handlePrint" />
  <ReportForm ref="reportFormRef" @submit="handlePrint" />
  <PreviewMakingDialog ref="previewMakingDialogRef" />
  <FilePreview ref="fileRef" />
</template>

<script setup>
import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import { clone, mergeDeepRight, isNil, isEmpty, is } from 'ramda'
import { ref, reactive, onMounted, nextTick } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { ElLoading } from 'element-plus'
import * as SampleTaskApi from '@/api/task'
import {
  getSheetConfig,
  a4SizeInPixels,
  checkIsSingleCellSelected,
  getStorage,
  setStorage,
  judgeIsBase64Image,
  generateImageObj,
  generateRandomImageId,
  extractValuesFromImageId,
  getCellWidthAndHeight,
  getCellTopAndLeft
} from '@/components/luckysheet/utils/util'
// import { exportExcel } from '@/utils/export'
import {
  getMockReportData,
  get_mock_select_list,
  get_mock_tree_list
} from '@/components/luckysheet/mock'
import { extractTableNameAndVariable } from '@/components/luckysheet/utils/util'
import {
  CELL_EXTEND_MAP,
  VALUE_TYPE_MAP,
  PREVIEW_IMG_PREFIX,
  TZ_BASE_TABLE_NAME,
  judgeIsTzBaseTable
} from '@/components/luckysheet/constants'
import CellEditDialog from '@/components/luckysheet/CellEditDialog/CellEditDialog.vue'
import {
  PRINT_LAYOUT_MAP,
  PRINT_OPTIONS,
  PRINT_RANGE_MAP,
  PRINT_RANGE_OPTIONS
} from '@/components/luckysheet/constants/print'
import {
  getDevicePixelRatioAlikeLuckysheet,
  calculateA4PaperSize
} from '@/components/luckysheet/utils/print'
import { exportSheetExcel } from '@/components/luckysheet/utils/export'
import { exportSheetExcel_2 } from '@/components/luckysheet/utils/export2'
import { getDictOptions, DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { useUserStore } from '@/store/modules/user'
import { judgeIsFillTask } from '@/utils/sampleTask'
import * as SampleApi from '@/api/sample'
import { convertExcel2Pdf } from '@/api/luckysheet/luckysheet'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import download from '@/utils/download'
import SubmitFillData from './dialog/SubmitFillData.vue'
import PrintForm from './dialog/PrintForm.vue'
import ReportForm from './dialog/ReportForm.vue'
import PreviewMakingDialog from './dialog/PreviewMakingDialog.vue'
import FilePreview from '@/components/FilePreview/index.vue'
import { getSimpleDictDataList } from '@/api/system/dict/dict.data'
import { useLuckySheetTool } from '@/components/luckysheet/hook/useLuckySheetTool.js'

const { exitLuckySheet } = useLuckySheetTool()

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
// 是否用后端生成pdf
const useServerPdf = true

const props = defineProps({
  processInstanceId: {
    type: String,
    default() {
      return ''
    }
  },
  sampleId: {
    type: String,
    default() {
      return ''
    }
  },
  processInstance: {
    type: Object,
    default() {
      return {}
    }
  },
  runningTasks: {
    type: Array,
    default() {
      return []
    }
  },
  //是否是自由节点模型
  uploadKey: {
    type: String,
    default() {
      return ''
    }
  }
})

const { httpRequest } = useUpload()

const userStore = useUserStore()

const userId = useUserStore().getUser.id // 当前登录的编号

const message = useMessage() // 消息弹窗

const { proxy } = getCurrentInstance()

const dictData = getDictOptions(DICT_TYPE.EXCEL_FILL_PROCESS_INSTANCE_STATUS)

const toolbarConfig = {
  showtoolbar: false,
  showtoolbarConfig: {
    undoRedo: true,
    image: true,
    print: true,
    exportXlsx: true
  }
}

const stashLuckySheetOption = ref(null)
const { width = 0 } = a4SizeInPixels()
const printConfig = ref({
  id: 'print_html',
  popTitle: '检测结果',
  preview: false
})
const dragEndRC = ref({ r: -1, c: -1 })
const extraCustomCellConfigs = reactive({
  data: {}
})
const sheetDataSource = reactive({
  data: {}
})
const extendCellOrigins = reactive({
  data: {}
})
const sheetConfigForm = reactive({
  data: {}
})

const dialogVisible = ref(false)
const screenshot = ref('')
const configData = ref([])

const editForm = reactive({ data: { cellContent: '', dateFormat: '' } })
const editDialogVisible = ref(false)
const editBeforeValue = ref()
const cellConfig = reactive({ data: {} })
const basicData = reactive({ data: {} })
// 表单对应的数据源数据
const dataSourceData = reactive({ data: {} })
// let selectData = reactive([])
const selectData = ref([])
let treeData = reactive([])
const sampleFillData = ref({})
const fillAuditForms = reactive({
  reason: ''
})
const fillAuditRule = reactive({
  reason: [{ required: true, message: '审批建议不能为空', trigger: 'blur' }]
})
const runningFillTasks = ref([])
const attachment = ref('')
const attachmentList = ref([])
const fileList = ref([])
const sampleDetail = ref({})

const requireFillCellBgInfo = ref({})

const printFormRef = ref()
const reportFormRef = ref()
const previewMakingDialogRef = ref()

/** 处理审批通过的操作 */
const submitFillDataRef = ref()
const simpleDictDataList = ref([])

const needToStore = ref(false)
const needBuildReportToUpdate = ref(false)
const submitFillDataParams = reactive({ data: {} })

const handleToggleSubmitFillData = async () => {
  exitLuckySheet()
  submitFillDataRef.value.open()
}

const findValueByMap = (
  data = [],
  sheetIndex,
  tableName,
  variableName,
  dataSourceIndex = 0,
  // 依赖工作表的索引
  dependSheetIndex
) => {
  console.log(
    '🚀findValueByMap ~ data:',
    data,
    sheetIndex,
    tableName,
    variableName,
    dataSourceIndex,
    dependSheetIndex
  )

  const targetTableData =
    data?.find?.((ite) => ite.sheetIndex == sheetIndex && ite.table === tableName) ?? {}
  const dependTableData =
    data?.find?.((ite) => ite.sheetIndex == dependSheetIndex && ite.table === tableName) ?? {}

  const fields = targetTableData?.fields ?? []
  const dependFields = dependTableData?.fields ?? []
  const mergeFields = []
  const fieldsLength = fields?.length ?? 0
  const dependFieldsLength = dependFields?.length ?? 0
  const dependLengthLongerOrEqual = dependFieldsLength >= fieldsLength
  let mainFields = []
  let subFields = []

  if (dependLengthLongerOrEqual) {
    mainFields = dependFields
    subFields = fields
  } else {
    mainFields = fields
    subFields = dependFields
  }

  mainFields?.forEach((mainField, index) => {
    const mergeField = dependLengthLongerOrEqual
      ? mergeDeepRight(subFields[index], mainField)
      : mergeDeepRight(mainField, subFields[index])

    mergeFields.push(mergeField)
  })
  // console.log('🚀 ~ mainFields?.forEach ~ mainFields:', sheetIndex, tableName, mergeFields)

  const findRow = mergeFields?.find?.((ite) => {
    const rowIndex = Number((ite?.index ?? '').split('|')?.pop() ?? '0')
    return dataSourceIndex === rowIndex
  })

  console.log('🚀 ~ findValueByMap ~ mergeFields:', mergeFields, mergeFields.length)

  return { dataValue: findRow?.data?.[variableName], mergeFields }
}

const handleSelectExcel = async (sheets = [], sheetsDataSheetConfigs = [], data = []) => {
  // const hasFillData = sheetsDataSheetConfigs && sheetsDataSheetConfigs.length > 0
  // 目前就都从sheets取数据
  const hasFillData = false
  const _sheets = hasFillData ? sheetsDataSheetConfigs : sheets
  const newSheets = clone(_sheets)
  const canFill = runningFillTasks.value.length

  console.log('🚀 ~ handleSelectExcel ~ newSheets:', newSheets)

  const sheetsData = []
  newSheets.map((sheet, idx) => {
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
      dataSourceConfig: _dataSourceConfig,
      extendCellOrigins: _extendCellOrigins,
      columnStartCoords: _columnStartCoords,
      sheetConfigForm: _sheetConfigForm
    } = sheet ?? {}

    console.log('🚀 ~ handleSelectExcel ~ sheetConfigForm:', _sheetConfigForm)

    const originSheet = sheetsDataSheetConfigs[idx] ?? {}
    const { images: originImages } = originSheet
    const mergeImages = { ...images, ...originImages }
    const dependImages = {}
    const newCellData = []

    celldata?.map?.((cell) => {
      const { r: cellRow, c: cellCol, v } = cell ?? {}
      const extendCellOrigin = _extendCellOrigins?.[`${cellRow}_${cellCol}`]

      if (extendCellOrigin) {
        const { r: originRow, c: originCol } = extendCellOrigin
        const extraCustomCellConfig = _extraCustomCellConfigs?.[`${originRow}_${originCol}`]
        const originCell = celldata?.find(
          (_cell) => _cell?.r === originRow && _cell?.c === originCol
        )

        if (originCell) {
          const {
            v: { v: originValue }
          } = originCell
          const { tableName, variableName } = extractTableNameAndVariable(originValue ?? '') ?? {}
          if (tableName && variableName) {
            if (extraCustomCellConfig) {
              const { cellExtend } = extraCustomCellConfig

              // TODO: 现在都用formInfo去取数据，记得处理图片相关的逻辑、还有循环块的逻辑
              if (cellExtend === '1') {
                // console.log('bg', v, v.bg)
                saveRequireFillCellBgInfo(index, cellRow, cellCol, { key: 'bg', value: v.bg })
                const dataSourceIndex = cellRow - originRow
                // 这里其实就是取值了，但暂时不能用formInfo配置数据去回显，是因为图片这些数据存在sheetsData里
                // let newValue =
                //   dataSourceData.data?.[index]?.[tableName]?.[dataSourceIndex]?.[variableName]

                const findInSampleDefaultValue = judgeIsTzBaseTable(tableName)
                  ? sampleDetail.value?.[variableName]
                  : null
                const dependSheetIndex = _sheetConfigForm?.dependSheetIndex ?? index
                const { dataValue } = findValueByMap(
                  data,
                  index,
                  tableName,
                  variableName,
                  dataSourceIndex,
                  dependSheetIndex,
                  cellRow,
                  cellCol
                )
                const isDependSheet = dependSheetIndex !== index
                // TODO: 这里要把被依赖的工作表的image深拷贝过来
                const isBase64Image = judgeIsBase64Image(dataValue)

                let image
                let imageId

                if (isDependSheet) {
                  // for (const key in mergeImages) {
                  //   const { r, c, mc } = extractValuesFromImageId(key)
                  //   if (r == cellRow && c == cellCol) {
                  //     delete mergeImages[key]
                  //   }
                  // }
                  if (isBase64Image) {
                    image = generateImageObj()
                    imageId = generateRandomImageId(
                      cellRow,
                      cellCol,
                      cell?.v?.mc,
                      PREVIEW_IMG_PREFIX
                    )
                    image.src = dataValue
                    image.focusRowIndex = cellRow
                    image.focusColumnIndex = cellCol
                    mergeImages[imageId] = image
                  } else {
                    for (const key in mergeImages) {
                      const { r, c, mc } = extractValuesFromImageId(key)
                      if (r == cellRow && c == cellCol) {
                        delete mergeImages[key]
                      }
                    }
                  }
                }

                const newValue = findInSampleDefaultValue || (isBase64Image ? '' : dataValue)

                for (const key in mergeImages) {
                  const image = mergeImages[key]
                  const hitImg =
                    image.focusRowIndex === cellRow && image.focusColumnIndex === cellCol
                  console.log('hitImg===1', hitImg, image)
                  if (hitImg) {
                    image.src = dataValue
                    if (!isBase64Image) {
                      image.default.width = 0
                    } else {
                      if (!image.default.width) {
                        image.default.width = image.crop.width
                      }
                    }
                  }
                }

                const newCell = {
                  ...cell,
                  v: {
                    ...v,
                    v: newValue,
                    // 优化日期格式
                    ct: {
                      fa: '@',
                      t: 's'
                    }
                  }
                }
                newCellData.push(newCell)
              } else if (cellExtend === '2') {
                saveRequireFillCellBgInfo(index, cellRow, cellCol, { key: 'bg', value: v.bg })
                const dataSourceIndex = cellRow - originRow
                const findInSampleDefaultValue = judgeIsTzBaseTable(tableName)
                  ? sampleDetail.value?.[variableName]
                  : null
                const dependSheetIndex = _sheetConfigForm?.dependSheetIndex ?? index

                const { dataValue } = findValueByMap(
                  data,
                  index,
                  tableName,
                  variableName,
                  dataSourceIndex,
                  dependSheetIndex,
                  cellRow,
                  cellCol
                )

                // console.log(
                //   `😒😒😒😒dataValue: ~~表字段${index}${tableName}.${variableName}`,
                //   dataValue
                // )

                const isDependSheet = dependSheetIndex !== index
                // TODO: 这里要把被依赖的工作表的image深拷贝过来

                // // base64图片单元格真实不回显，因为字符串太长，luckysheet会有性能问题
                const isBase64Image = judgeIsBase64Image(dataValue)
                let image
                let imageId

                if (isDependSheet) {
                  // for (const key in mergeImages) {
                  //   const { r, c, mc } = extractValuesFromImageId(key)
                  //   if (r == cellRow && c == cellCol) {
                  //     delete mergeImages[key]
                  //   }
                  // }
                  if (isBase64Image) {
                    image = generateImageObj()
                    imageId = generateRandomImageId(
                      cellRow,
                      cellCol,
                      cell?.v?.mc,
                      PREVIEW_IMG_PREFIX
                    )
                    image.src = dataValue
                    image.focusRowIndex = cellRow
                    image.focusColumnIndex = cellCol
                    mergeImages[imageId] = image
                  } else {
                    for (const key in mergeImages) {
                      const { r, c, mc } = extractValuesFromImageId(key)
                      if (r == cellRow && c == cellCol) {
                        delete mergeImages[key]
                      }
                    }
                  }
                }

                let activeLength = 1
                const sameRowBusinessFieldCell = celldata.find((cell) => {
                  const { tableName: cellTableName } =
                    extractTableNameAndVariable(cell.v?.v ?? '') ?? {}
                  return cell.r === originRow && cellTableName && cellTableName !== tableName
                })

                // console.log(0, sameRowBusinessFieldCell)

                if (sameRowBusinessFieldCell) {
                  const {
                    r: sameCellRow,
                    c: sameCellCol,
                    v: sameCellV
                  } = sameRowBusinessFieldCell ?? {}
                  const sameCellExtendCellOrigin =
                    _extendCellOrigins?.[`${sameCellRow}_${sameCellCol}`]

                  if (sameCellExtendCellOrigin) {
                    const { r: sameCellOriginRow, c: sameCellOriginCol } = sameCellExtendCellOrigin
                    const extraCustomCellConfig =
                      _extraCustomCellConfigs?.[`${sameCellOriginRow}_${sameCellOriginCol}`]
                    const sameCellOriginCell = celldata?.find(
                      (_cell) => _cell?.r === sameCellOriginRow && _cell?.c === sameCellOriginCol
                    )

                    // console.log(111, sameCellOriginCell)

                    if (sameCellOriginCell) {
                      const { tableName, variableName } =
                        extractTableNameAndVariable(sameCellOriginCell.v?.v ?? '') ?? {}
                      const { mergeFields } = findValueByMap(
                        data,
                        index,
                        tableName,
                        variableName,
                        dataSourceIndex,
                        dependSheetIndex,
                        sameCellRow,
                        sameCellCol
                      )

                      activeLength =
                        mergeFields.filter((f) => {
                          const dataEmpty = isEmpty(f.data)
                          let dataOnceKeyHasValue = false
                          if (!dataEmpty) {
                            dataOnceKeyHasValue = Object.values(f.data).find(
                              (d) => !(isNil(d) || isEmpty(d))
                            )
                          }

                          return !dataEmpty && dataOnceKeyHasValue
                        })?.length ?? 1

                      // console.log(222, mergeFields, dataSourceIndex, activeLength)
                    }
                  }
                }

                const newValue =
                  findInSampleDefaultValue && dataSourceIndex < activeLength
                    ? findInSampleDefaultValue
                    : isBase64Image
                      ? ''
                      : dataValue
                // console.log('newValue', newValue)

                for (const key in mergeImages) {
                  const image = mergeImages[key]
                  const hitImg =
                    image.focusRowIndex === cellRow && image.focusColumnIndex === cellCol
                  // console.log('hitImg===2', hitImg, image)
                  if (hitImg) {
                    image.src = dataValue
                    if (!isBase64Image) {
                      image.default.width = 0
                    } else {
                      if (!image.default.width) {
                        image.default.width = image.crop.width
                      }
                    }
                  }
                }

                const newCell = {
                  ...cell,
                  v: {
                    ...v,
                    v: newValue,
                    ct: {
                      fa: '@',
                      t: 's'
                    }
                  }
                }

                newCellData.push(newCell)
              } else {
                newCellData.push(cell)
              }
            } else {
              newCellData.push(cell)
            }
          } else {
            newCellData.push(originCell)
          }
        }
      } else {
        newCellData.push(cell)
      }
    })

    const authority = {
      isAlert: false,
      editObjects: 0,
      sheet: 0, //如果为1或true，则该工作表受到保护；如果为0或false，则该工作表不受保护。
      allowImageList: []
    }

    if (canFill) {
      for (const key in mergeImages) {
        const image = mergeImages[key]
        const { focusRowIndex, focusColumnIndex } = image ?? {}
        const rcKey = `${focusRowIndex}_${focusColumnIndex}`
        const originCell = _extendCellOrigins?.[rcKey]

        if (originCell) {
          const originCellKey = `${originCell.r}_${originCell.c}`
          const allowEdit = _extraCustomCellConfigs?.[originCellKey]?.allowEdit
          if (allowEdit) {
            authority.allowImageList.push({ r: focusRowIndex, c: focusColumnIndex })
          }
        }
      }
    }

    const sheetData = {
      calcChain,
      celldata: newCellData,
      // celldata,
      // config,
      config: { ...config, authority },
      frozen,
      hyperlink,
      // images: { ...images, ...originImages },
      images: mergeImages,
      index,
      name,
      order
    }

    // 已有填报数据
    // if (hasFillData) {
    //   sheetData.celldata = celldata
    // }

    sheetsData.push(sheetData)

    extendCellOrigins.data[index] = _extendCellOrigins ?? {}
    extraCustomCellConfigs.data[index] = _extraCustomCellConfigs ?? {}
    sheetDataSource.data[index] = _dataSourceConfig ?? []
    sheetConfigForm.data[index] = _sheetConfigForm ?? {}
  })

  // window.yzscelldata = newSheets;
  console.log('🚀 ~ newSheets.map ~ sheetsData:', sheetsData)

  stashLuckySheetOption.value = {
    container: 'luckysheetWrap',
    lang: 'zh',
    showinfobar: false,
    // allowEdit: false,
    ...clone(toolbarConfig),
    data: sheetsData,
    hook: {
      cellEditBefore: cellEditBefore,
      cellUpdateBefore: cellUpdateBefore,
      imageInsertAfter: handleImageInsertAfter,
      workbookCreateAfter: workbookCreateAfter
    },
    uploadImageBase64MaxSize: 200
    // title: exportJson.info.name,
    // userInfo: exportJson.info.name.creator
  }

  if (canFill) {
    stashLuckySheetOption.value.allowEdit = true
  } else {
    stashLuckySheetOption.value.allowEdit = false
    // stashLuckySheetOption.value.showtoolbar = true
  }

  window.luckysheet?.destroy?.()
  window.luckysheet?.create?.({ ...stashLuckySheetOption.value, ...toolbarConfig })
}

const saveRequireFillCellBgInfo = (
  sheetIndex,
  row,
  column,
  bgInfo = { key: 'bg', value: '#fff' }
) => {
  if (!requireFillCellBgInfo.value[sheetIndex]) {
    requireFillCellBgInfo.value[sheetIndex] = {}
  }

  requireFillCellBgInfo.value[sheetIndex][`${row}-${column}`] = bgInfo
}

/**
 * 切换必填项背景色
 * @param {boolean} toPrint true为隐藏必填项背景色，false为显示必填项背景色
 */
const toggleRequireFillCellBgInfo = (toPrint = true) => {
  for (const sheetIndex in requireFillCellBgInfo.value) {
    const sheetRequireFillCellBgInfo = requireFillCellBgInfo.value[sheetIndex]
    const allSheets = window.luckysheet.getAllSheets() ?? []
    const findSheet = allSheets?.find((sheet) => sheet.index === sheetIndex)

    if (!findSheet) {
      continue
    }

    const order = findSheet.order

    for (const cellKey in sheetRequireFillCellBgInfo) {
      const { key, value } = sheetRequireFillCellBgInfo[cellKey]
      const [row, column] = cellKey.split('-')
      if (toPrint) {
        window.luckysheet.setCellFormat(row, column, key, null, { order })
      } else {
        window.luckysheet.setCellFormat(row, column, key, value, { order })
      }
    }
  }
}

const buildFinallyData = () => {
  window.luckysheet.exitEditMode()

  const _data = processData()
  const _sheets = window.luckysheet.getAllSheets()
  const _sheetsData = []

  _sheets.forEach?.((sheet) => {
    const sheetConfig = getSheetConfig(sheet)
    console.log('🚀 ~ buildFinallyData ~ sheetConfig:', sheetConfig)
    const { index } = sheetConfig
    sheetConfig.extraCustomCellConfigs = extraCustomCellConfigs.data?.[index]
    sheetConfig.dataSourceConfig = sheetDataSource.data?.[index]
    sheetConfig.extendCellOrigins = extendCellOrigins.data?.[index]

    _sheetsData.push(sheetConfig)
  })

  console.log('🚀 ~ buildFinallyData ~ _data:', _data)

  return {
    data: _data,
    sheetsData: _sheetsData
  }
}

/**
 * 暂存or提交审批数据
 * @param {boolean} submitForApproval 是否要提交审批 true: 保存后提交审批;  false: 仅保存
 * @param {object} remainingPayload 其他参数
 * @param {boolean} emitSuccess 是否要触发成功事件
 */
const handleSave = async (submitForApproval = false, remainingPayload = {}, emitSuccess = true) => {
  console.log('🚀 ~ handleSave ~ submitForApproval:', submitForApproval, remainingPayload)
  const { data, sheetsData } = buildFinallyData()

  sheetsData.forEach?.((sheet) => {
    const images = sheet.images ?? {}
    for (const key in images) {
      const isPreviewImg = (key ?? '').split('_')?.[0] === PREVIEW_IMG_PREFIX
      if (isPreviewImg) {
        delete images[key]
      }
    }
  })

  const payload = {
    processInstanceId: props.processInstanceId,
    data: data,
    sheetsData: JSON.stringify({ sheetConfigs: sheetsData }),
    fillAttachment: JSON.stringify(attachmentList.value)
  }

  const { equipmentId, approvalUser } = clone(remainingPayload) ?? {}

  submitFillDataParams.data = {}
  console.log('🚀 ~ handleSave ~ submitFillDataParams.data:', submitFillDataParams.data)

  if (equipmentId) {
    payload.equipmentId = equipmentId
  }

  if (approvalUser) {
    payload.approvalUser = approvalUser
  }

  ElMessage.closeAll()

  const loading = ElLoading.service({
    fullscreen: false,
    text: submitForApproval ? '提交中...' : '保存中...',
    target: '#fill-view'
  })

  try {
    const data = await SampleTaskApi.updateSampleInfoDataFill(payload)

    // TAG: 提交审批
    if (submitForApproval) {
      console.log('🚀 ~ submitForApproval ~ data:', submitForApproval)
      const approvalPayload = {
        userVariables: {
          [props.uploadKey]: [approvalUser.userId]
        },
        id: runningFillTasks.value?.[0].id,
        reason: '填报完成'
      }

      await SampleTaskApi.fillProcessInstance(approvalPayload)
      loading?.close?.()
      message.success('保存并提交成功')
    } else {
      // TAG: 暂存
      loading?.close?.()
      message.success('保存成功')
    }

    submitFillDataRef.value.close?.()
  } finally {
    loading?.close?.()
    submitFillDataRef.value.close?.()
  }

  if (emitSuccess) {
    // 通知详情页刷新数据
    emit('success')
  }
}

const handleStore = () => {
  exitLuckySheet()

  const { data, sheetsData } = buildFinallyData()
  const { sheetConfigs, sheetsDataSheetConfigs } = getFormInfoAndSheetDataObjFromRefSampleFillData()
  // console.log('🚀 ~ handleStore ~ data:', data, sheetsData, sheetConfigs, sheetsDataSheetConfigs)

  handleSelectExcel(sheetConfigs, sheetsData, data)

  needToStore.value = true
}

const handleSubmitFillData = async (params) => {
  console.log('🚀 ~ handleSubmitFillData ~ params:', params)
  window.luckysheet.exitEditMode()

  const { data, sheetsData } = buildFinallyData()
  const { sheetConfigs, sheetsDataSheetConfigs } = getFormInfoAndSheetDataObjFromRefSampleFillData()

  const loading = ElLoading.service({
    fullscreen: false,
    text: '正在生成报告...',
    target: '#fill-view'
  })

  handleSelectExcel(sheetConfigs, sheetsData, data)
  submitFillDataRef.value.close?.()

  submitFillDataParams.data = params
  needBuildReportToUpdate.value = true
}

const handleBuildReportAndFillData = async () => {
  const cb = () => {
    toggleRequireFillCellBgInfo(false)
    handleSave(true, submitFillDataParams.data)
  }
  toggleRequireFillCellBgInfo(true)
  buildPdfFileByExcel([], cb)
}

const getFormInfoAndSheetDataObjFromRefSampleFillData = () => {
  const { formInfo, sheetsData, data = [] } = sampleFillData.value
  let formInfoObj = {}
  let sheetsDataObj = {}
  try {
    formInfoObj = JSON.parse(formInfo || '{}')
  } catch (error) {
    console.log('🚀 ~ setExcelConfig ~ error:', error)
  }

  try {
    sheetsDataObj = JSON.parse(sheetsData || '{}')
  } catch (error) {
    console.log('🚀 ~ setExcelConfig ~ error:', error)
  }

  const { sheetConfigs } = formInfoObj
  const { sheetConfigs: sheetsDataSheetConfigs } = sheetsDataObj
  return { sheetConfigs, sheetsDataSheetConfigs }
}

const processData = () => {
  const sheets = window.luckysheet.getAllSheets()
  const submitData = []
  const preData = {}
  const preImageData = {}

  sheets?.forEach?.((sheet) => {
    const { celldata, index, images } = sheet
    const _extendCellOrigins = extendCellOrigins.data?.[index]
    const _extraCustomCellConfigs = extraCustomCellConfigs.data?.[index]
    const _dataSourceConfig = sheetDataSource.data?.[index]
    const _sheetConfigForm = sheetConfigForm.data?.[index]

    Object.values(images ?? {})?.forEach?.((image) => {
      const { focusColumnIndex, focusRowIndex, src } = image
      if (!preImageData[index]) {
        preImageData[index] = {}
      }

      preImageData[index][`${focusRowIndex}_${focusColumnIndex}`] = src
    })

    celldata?.forEach((cell) => {
      const { r, c } = cell
      const originCell = _extendCellOrigins?.[`${r}_${c}`]
      if (originCell) {
        const cellDataDbMap = _dataSourceConfig?.[`${originCell.r}_${originCell.c}`]

        if (cellDataDbMap) {
          const { tableName, variableName } = cellDataDbMap
          let v = cell?.v?.v
          // 是base64图片则覆盖v
          const isBase64Image = judgeIsBase64Image(preImageData[index]?.[`${r}_${c}`])

          if (preImageData[index]?.[`${r}_${c}`] && isBase64Image) {
            v = preImageData[index]?.[`${r}_${c}`]
          }

          const extraCustomCellConfig = _extraCustomCellConfigs?.[`${originCell.r}_${originCell.c}`]
          let rowFlag = 0
          // 没扩展
          if (extraCustomCellConfig.cellExtend === CELL_EXTEND_MAP.noExtend) {
            rowFlag = 0
          } else if (extraCustomCellConfig.cellExtend === CELL_EXTEND_MAP.expandToDownward) {
            rowFlag = r - originCell.r
          }

          const rowKey = `${index}|${tableName}|${variableName}|${rowFlag}`
          let data = preData[rowKey]

          if (data) {
            data[variableName] = v
          } else {
            data = {}
            data[variableName] = v
            preData[rowKey] = data
          }
        }
      }
    })
  })

  for (const key in preData) {
    const [sheetIndex, tableName, variableName, r] = key.split('|')
    const data = preData[key]

    const hasTable = submitData.find((s) => s.table === tableName && s.sheetIndex === sheetIndex)
    if (hasTable) {
      const fields = hasTable.fields
      const sameRowData = fields.find((f) => f.index === `${sheetIndex}|${tableName}|${r}`)
      if (sameRowData) {
        sameRowData.data[variableName] = data[variableName]
      } else {
        fields.push({ index: `${sheetIndex}|${tableName}|${r}`, data: { ...data } })
      }
    } else {
      submitData.push({
        table: tableName,
        sheetIndex: sheetIndex,
        fields: [{ index: `${sheetIndex}|${tableName}|${r}`, data: { ...data } }]
      })
    }
  }

  const _submitData = []

  submitData.forEach((data) => {
    if (data.table === TZ_BASE_TABLE_NAME) {
      return
    }

    const { dependSheetIndex } = sheetConfigForm.data?.[data.sheetIndex] ?? {}
    const dependSheetData = submitData.find(
      (ite) => ite.sheetIndex === dependSheetIndex && ite.table === data.table
    )

    if (!dependSheetData) {
      const hasTable = _submitData.find(
        (s) => s.table === data.table && s.sheetIndex === data.sheetIndex
      )

      if (!hasTable) {
        _submitData.push(data)
      }

      return
    }

    console.log('🚀 ~ submitData.forEach ~ dependSheetData:', dependSheetData)
    const fields = data?.fields ?? []
    const dependFields = dependSheetData.fields ?? []
    const mergeFields = []
    const fieldsLength = fields?.length ?? 0
    const dependFieldsLength = dependFields?.length ?? 0
    const dependLengthLongerOrEqual = dependFieldsLength >= fieldsLength
    let mainFields = []
    let subFields = []

    if (dependLengthLongerOrEqual) {
      mainFields = dependFields
      subFields = fields
    } else {
      mainFields = fields
      subFields = dependFields
    }

    mainFields?.forEach((mainField, index) => {
      const mergeField = dependLengthLongerOrEqual
        ? mergeDeepRight(subFields[index], mainField)
        : mergeDeepRight(mainField, subFields[index])

      mergeFields.push(mergeField)
    })

    const finallyData = { ...dependSheetData }
    const hasTable = _submitData.find(
      (s) => s.table === finallyData.table && s.sheetIndex === finallyData.sheetIndex
    )

    if (hasTable) {
      hasTable.fields = mergeFields
    } else {
      finallyData.fields = mergeFields
      _submitData.push(finallyData)
    }
  })
  console.log('🚀 ~ submitData.forEach ~ submitData:', submitData)
  console.log('🚀 ~ submitData.forEach ~ _submitData:', _submitData)

  return _submitData
}

const downloadExcel = () => {
  // exportExcel(window.luckysheet.getAllSheets(), '下载')
}

const handlePreview = () => {
  const s = window.luckysheet.getScreenshot()
  window.luckysheet.getScreenshotPro(
    (imgSrc) => {
      screenshot.value = imgSrc
      dialogVisible.value = true
    },
    { layout: 'landscape' }
  )
}

const printExcel = () => {
  printSheet()
}

const base64toFile = (data, fileName) => {
  const dataArr = data.split(',')
  const byteString = atob(dataArr[1])
  const options = {
    type: 'image/png',
    endings: 'native'
  }
  const u8Arr = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    u8Arr[i] = byteString.charCodeAt(i)
  }
  return new File([u8Arr], fileName + '.png', options) //返回文件流
}

const printSheet = async (
  autoUpload = false,
  cb,
  printOptions = { layout: 'portrait' },
  useWindowPrint = false
) => {
  const isSingleCellSelected = checkIsSingleCellSelected()
  console.log('🚀 ~ printSheet ~ isSingle:', isSingleCellSelected)
  document.querySelector('#print_html').style.display = 'block'
  window.luckysheet.hideGridLines()
  //如果当前选中区只是一个单元格，则认为选取无效。

  if (!isSingleCellSelected) {
    // TAG: 选区打印
    console.log('进if')
    // screenshot.value = window.luckysheet.getScreenshot()
    // dialogVisible.value = true
    // 将打印区域生成base64图片（*将生成的base64编码复制粘贴到浏览器地址框，是可以预览图片样式的），生成后执行的后续打印操作，取用匿名委托函数做为参数传入
    window.luckysheet.getScreenshotPro(
      async (imgSrc) => {
        window.luckysheet.showGridLines()
        // * Lodop中的ADD_PRINT_IMAGE，也可以直接输出base64码图片，不用加img标签（如果加了img标签，会被当做超文本对待，受浏览器引擎解析的影响）
        const $img = `<img src=${imgSrc} style="max-width: 100%;" />`

        await nextTick()

        document.querySelector('#print_html').innerHTML = $img

        if (useWindowPrint) {
          // TODO: 这里是调打印机
          document.getElementById('printExcelBtn').click()
        }

        setTimeout(() => {
          document.querySelector('#print_html').style.display = 'none'
        }, 100)

        await nextTick()

        if (autoUpload) {
          // const img = document.getElementById('print_html').getElementsByTagName('img')[0]
          // // 创建一个新的canvas元素
          // const canvas = document.createElement('canvas')
          // canvas.width = img.width
          // canvas.height = img.height

          // // 将图片绘制到canvas上
          // var ctx = canvas.getContext('2d')
          // ctx.drawImage(img, 0, 0)
          // // 将canvas内容转换为Blob
          // canvas.toBlob(function (blob) {
          //   // 创建文件对象
          //   var file = new File(
          //     [blob],
          //     `${sampleDetail.value?.sampleName}-检验报告-${formatDate(new Date())}.png`,
          //     {
          //       type: 'image/png'
          //     }
          //   )

          //   httpRequest({ file, onSuccess: handleScreenshotAutoUploadSuccess })
          //     .then((res) => {
          //       console.log('🚀 ~ res:', res)
          //       cb?.()
          //     })
          //     .catch((err) => {
          //       console.log('🚀 ~ httpRequest ~ err:', err)
          //     })
          // }, 'image/png')
          const file = base64toFile(
            imgSrc,
            `${sampleDetail.value?.sampleName}-检验报告-${formatDate(new Date())}`
          )

          httpRequest({ file, onSuccess: handleScreenshotAutoUploadSuccess })
            .then((res) => {
              console.log('🚀 ~ res:', res)
              cb?.()
            })
            .catch((err) => {
              console.log('🚀 ~ httpRequest ~ err:', err)
            })
            .finally(() => {
              submitFillDataRef.value.close?.()
            })
        } else {
          cb?.()
        }
      },
      { ...printOptions }
      // { layout: 'landscape' }
    )
  } else {
    // TAG: 选单个单元格
    console.log('进else')
    // 获取打印区域的行列
    const RowColumn = getPrintSheetArea()
    // 因需要打印左边的边框，需重新设置第一列
    RowColumn.column[0] = 0
    console.log('🚀 ~ printSheet ~ RowColumn:', RowColumn)
    // 进行选区操作
    window.luckysheet.setRangeShow(RowColumn)

    // 简单粗暴全选，但效果不好
    // document.getElementById('luckysheet-left-top').click()
    // 将打印区域生成base64图片（*将生成的base64编码复制粘贴到浏览器地址框，是可以预览图片样式的），生成后执行的后续打印操作，取用匿名委托函数做为参数传入
    // screenshot.value = window.luckysheet.getScreenshot()
    // dialogVisible.value = true
    window.luckysheet.getScreenshotPro(
      async (imgSrc) => {
        window.luckysheet.showGridLines()
        // * Lodop中的ADD_PRINT_IMAGE，也可以直接输出base64码图片，不用加img标签（如果加了img标签，会被当做超文本对待，受浏览器引擎解析的影响）
        const $img = `<img src=${imgSrc} style="max-width: 90%;" />`

        await nextTick()

        document.querySelector('#print_html').innerHTML = $img

        if (useWindowPrint) {
          // TODO: 这里是调打印机
          document.getElementById('printExcelBtn').click()
        }

        setTimeout(() => {
          document.querySelector('#print_html').style.display = 'none'
        }, 100)

        await nextTick()

        if (autoUpload) {
          // const img = document.getElementById('print_html').getElementsByTagName('img')[0]
          // // 创建一个新的canvas元素
          // const canvas = document.createElement('canvas')
          // canvas.width = img.width
          // canvas.height = img.height

          // // 将图片绘制到canvas上
          // var ctx = canvas.getContext('2d')
          // ctx.drawImage(img, 0, 0)
          // 将canvas内容转换为Blob
          // canvas.toBlob(function (blob) {
          //   // 创建文件对象
          //   var file = new File(
          //     [blob],
          //     `${sampleDetail.value?.sampleName}-检验报告-${formatDate(new Date())}.png`,
          //     {
          //       type: 'image/png'
          //     }
          //   )

          //   httpRequest({ file, onSuccess: handleScreenshotAutoUploadSuccess })
          //     .then((res) => {
          //       console.log('🚀 ~ res:', res)
          //       cb?.()
          //     })
          //     .catch((err) => {
          //       console.log('🚀 ~ httpRequest ~ err:', err)
          //     })
          // }, 'image/png')

          const file = base64toFile(
            imgSrc,
            `${sampleDetail.value?.sampleName}-检验报告-${formatDate(new Date())}`
          )

          httpRequest({ file, onSuccess: handleScreenshotAutoUploadSuccess })
            .then((res) => {
              console.log('🚀 ~ res:', res)
              cb?.()
            })
            .catch((err) => {
              console.log('🚀 ~ httpRequest ~ err:', err)
            })
            .finally(() => {
              submitFillDataRef.value.close?.()
            })
        } else {
          cb?.()
        }
      },
      { ...printOptions }
      // { layout: 'landscape' },
    )
  }
}

const getPrintSheetArea = () => {
  const sheetData = window.luckysheet.getSheetData()
  console.log('🚀 ~ getPrintSheetArea ~ sheetData:', sheetData)
  let objRowColumn = {
    row: [0, 0], //行
    column: [0, 0] //列
  }
  // * item是行、index是行索引、it是一行里的一格、itemIndex是这一格在这一行里的列索引
  sheetData.forEach((item, index) => {
    //行数
    item.forEach((it, itemIndex) => {
      if (it !== null && it.ct) {
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

const getScreenshotBeforeSave = async () => {
  await printSheet(true)
}

const handleScreenshotAutoUploadSuccess = (res) => {
  const data = res.data ?? {}
  // fileList.value.filter((file) => (file.type ?? '').indexOf('image') && file.name !== data.name)
  // attachmentList.value.filter(
  //   (file) => (file.type ?? '').indexOf('image') && file.name !== data.name
  // )
  fileList.value.push(data)
  attachmentList.value.push(data)
}

// ============================== luckysheet hook ==============================
function cellEditBefore(range) {
  const r = range[0].row[0]
  const c = range[0].column[0]

  dragEndRC.value.r = r
  dragEndRC.value.c = c

  const key = `${r}_${c}`
  const sheetIndex = window.luckysheet.getSheet().index

  editBeforeValue.value = window.luckysheet.getCellValue(r, c)
  editForm.data.cellContent = editBeforeValue.value

  if (!extendCellOrigins.data?.[sheetIndex]) {
    return
  }

  const originCell = extendCellOrigins.data?.[sheetIndex][key]

  if (!originCell) {
    return
  }

  const originCellKey = `${originCell.r}_${originCell.c}`

  cellConfig.data = extraCustomCellConfigs.data?.[sheetIndex][originCellKey]
  console.log('🚀 ~ cellEditBefore ~ cellConfig:', cellConfig.data)
  const allowEdit = cellConfig.data?.allowEdit ?? true
  if (!allowEdit) {
    message.error('该单元格不允许进行编辑。')
    return false
  }

  if (cellConfig.data?.valueType === VALUE_TYPE_MAP.get('text')?.key) {
    return
  } else if (cellConfig.data?.valueType === VALUE_TYPE_MAP.get('date')?.key) {
    editForm.data.dateFormat = cellConfig.data.dateFormat
  } else if (cellConfig.data?.valueType === VALUE_TYPE_MAP.get('select')?.key) {
    if (cellConfig.data?.dataSourceId) {
      getEditDialogSelectList(cellConfig.data?.dataSourceId)
    }
  } else if (cellConfig.data?.valueType === VALUE_TYPE_MAP.get('tree')?.key) {
    if (cellConfig.data?.dataSourceId) {
      getEditDialogTreeList(cellConfig.data?.dataSourceId)
    }
  }

  editDialogVisible.value = true
  const { r: dragEndR, c: dragEndC } = dragEndRC.value

  let timer = setTimeout(() => {
    window.luckysheet.exitEditMode()
    window.luckysheet.setCellValue(dragEndR, dragEndC, editBeforeValue.value, {
      isRefresh: false
    })
    window.luckysheet.setRangeShow({
      row: [dragEndR, dragEndR],
      column: [dragEndC, dragEndC]
    })

    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }, 0)
}

function cellUpdateBefore(r, c, value, isRefresh) {
  // console.log('🚀 ~ cellUpdateBefore ~ rest:', value)
  if (is(String, value) && /\r\n|\r|\n/.test(value)) {
    const v = value.replace(/\n|\r\n|\r/g, '')
    window.luckysheet.setCellValue(r, c, { v, ct: { fa: '@', t: 's' } })
    return false
  }

  return true
}

function handleImageInsertAfter(params) {
  // console.log('🚀 ~ handleImageInsertAfter ~ params:', params)
  const sheetIndex = window.luckysheet.getSheet().index
  const sheets = window.luckysheet.getAllSheets()
  sheets?.forEach?.((sheet) => {
    if (sheet.index == sheetIndex) {
      // console.log('🚀 ~ handleImageInsertAfter ~ sheet.index == sheetIndex:', sheet, sheetIndex)

      sheet.config.authority.allowImageList.push({
        r: params.focusRowIndex,
        c: params.focusColumnIndex
      })
    }
  })

  luckysheet.updataSheet({
    data: sheets,
    success: () => {
      // console.log('handleImageInsertAfter.updataSheet success')
    }
  })
}

function workbookCreateAfter(params) {
  console.log('🚀 ~ workbookCreateAfter ~ params:', params)
  if (needBuildReportToUpdate.value) {
    needBuildReportToUpdate.value = false
    handleBuildReportAndFillData()
  }

  if (needToStore.value) {
    needToStore.value = false
    handleSave(false, {}, false)
  }

  updateImgWidthHeightTopLeft()
}

// ======

function updateImgWidthHeightTopLeft() {
  const sheets = window.luckysheet.getAllSheets()
  let defaultOrder = 0
  sheets?.forEach?.(async (sheet) => {
    if (sheet.status == 1) {
      defaultOrder = sheet.order
    }

    luckysheet.setSheetActive(sheet.order)

    const { images } = sheet ?? {}
    if (images) {
      for (const key in images) {
        const { r, c, mc } = extractValuesFromImageId(key)
        // console.log('🚀 ~ updateImgWidthHeightTopLeft ~ r, c, mc:', r, c, mc)
        const isPreviewImg = (key ?? '').split('_')?.[0] === PREVIEW_IMG_PREFIX
        if (isPreviewImg) {
          const img = images[key]
          const { width, height } = getCellWidthAndHeight({ r, c, mc }, window.luckysheet)
          console.log('🚀 ~ updateImgWidthHeightTopLeft ~ width, height:', width, height)
          const { top, left } = getCellTopAndLeft({ r, c }, window.luckysheet)
          img.crop.width = width
          img.crop.height = height
          img.default.width = width
          img.default.height = height
          img.default.top = top
          img.default.left = left
        }
      }
    }
  })

  luckysheet.setSheetActive(defaultOrder)

  luckysheet.updataSheet({
    data: sheets,
    success: () => {
      console.log('updateImgWidthHeightTopLeft success')
    }
  })
}

function handleConfirm(form = {}, visible) {
  console.log('🚀 ~ handleConfirm ~ form:', form)
  const { cellContent } = form
  editForm.data.cellContent = cellContent
  editDialogVisible.value = visible

  const { r, c } = dragEndRC.value

  window.luckysheet.setCellValue(
    r,
    c,
    {
      v: editForm.data.cellContent,
      ct: {
        fa: '@',
        t: 's'
      }
    },
    {
      isRefresh: true
    }
  )

  window.luckysheet.setRangeShow({
    row: [r, r],
    column: [c, c]
  })

  handleCloseEditDialog()
}

function handleCloseEditDialog(visible) {
  editForm.data.cellContent = ''
  editForm.data.dateFormat = ''
  cellConfig.data = {}
  // dictTypeDatas
  editBeforeValue.value = ''
  dragEndRC.value.r = -1
  dragEndRC.value.c = -1
  editDialogVisible.value = false
}

async function getEditDialogSelectList(dataSourceId) {
  let _simpleDictDataList = simpleDictDataList.value

  if (!_simpleDictDataList?.length) {
    _simpleDictDataList = await getSimpleDictDataList()
  }

  selectData.value = _simpleDictDataList?.filter((dictData) => dictData.dictType === dataSourceId)

  // TODO: 获取下拉数据
  // const { data } = get_mock_select_list(dataSourceId)
  // selectData = data
}

function getEditDialogTreeList(dataSourceId) {
  const { data } = get_mock_tree_list(dataSourceId)
  treeData = data
}

const fetchStorageFillData = () => {
  const storageData = getStorage('sampleFillData')
  return storageData
}

const fetchSampleFillData = async (keepLoading = false) => {
  const loading = ElLoading.service({
    fullscreen: false,
    text: '数据加载中...',
    target: '#fill-view'
  })

  try {
    await fetchSampleInfo()
    const data = await SampleTaskApi.getSampleFillData({
      processInstanceId: props.processInstanceId
    })
    console.log('🚀 ~ fetchSampleFillData ~ data:', data)
    if (!keepLoading) {
      loading?.close?.()
    }
    sampleFillData.value = data

    const fillAttachment = data?.fillAttachment ?? '[]'

    // let arr = []
    // fileList.value = JSON.parse(fillAttachment)
    // fileList.value.forEach((item) => arr.push(item.url))
    // attachment.value = arr.join(',')

    fileList.value = JSON.parse(fillAttachment)
    attachmentList.value = JSON.parse(fillAttachment)

    setExcelConfig()
  } finally {
    if (!keepLoading) {
      loading?.close?.()
    }
  }
}

const fetchSampleInfo = async () => {
  try {
    const data = await SampleApi.getSampleInfoDetailByProcessInstanceId(props.processInstanceId)
    const property = data?.property ?? {}
    const propertyObj = {}

    for (const key in property) {
      if (!propertyObj[key]) {
        propertyObj[key] = property[key]?.propertyValue
      }
    }

    sampleDetail.value = { ...data, ...propertyObj }
    console.log('🚀 ~ fetchSampleInfo ~ sampleDetail.value:', sampleDetail.value)
  } catch (error) {
    console.log('🚀 ~ fetchSampleInfo ~ error:', error)
  }
}

const setExcelConfig = () => {
  const { formInfo, sheetsData, data = [] } = sampleFillData.value
  let formInfoObj = {}
  let sheetsDataObj = {}
  try {
    formInfoObj = JSON.parse(formInfo || '{}')
  } catch (error) {
    console.log('🚀 ~ setExcelConfig ~ error:', error)
  }

  try {
    sheetsDataObj = JSON.parse(sheetsData || '{}')
  } catch (error) {
    console.log('🚀 ~ setExcelConfig ~ error:', error)
  }

  console.log('🚀 ~ setExcelConfig ~ formInfoObj:', formInfoObj)
  const { sheetConfigs } = formInfoObj
  const { sheetConfigs: sheetsDataSheetConfigs } = sheetsDataObj
  handleSelectExcel(sheetConfigs, sheetsDataSheetConfigs, data)
}

const handleUploadSuccess = (data) => {
  console.log('🚀 ~ handleUploadSuccess ~ data:', data)
  console.log('🚀 ~ handleUploadSuccess ~ data:', attachmentList.value)
  // fileList.value.push(data)
  // attachmentList.value.push(data)
}

const handleRemove = (index) => {
  // fileList.value.splice(index, 1)
  // attachmentList.value.splice(index, 1)
}

const handleTogglePrintForm = () => {
  printFormRef.value?.open?.()
}

const handlePrint = async (printOption) => {
  const cb = () => {
    toggleRequireFillCellBgInfo(false)
  }

  const { layout, range } = printOption

  if (useServerPdf) {
    if (range === PRINT_RANGE_MAP.current.key) {
      toggleRequireFillCellBgInfo(true)
      const sheetIndex = window.luckysheet.getSheet()?.index

      handlePrintByExcelBlob([sheetIndex], cb)
    } else {
      previewMakingDialogRef.value?.open?.()

      toggleRequireFillCellBgInfo(true)

      let t
      if (!t) {
        t = setTimeout(() => {
          handlePrintByExcelBlob([], cb)
          if (t) {
            clearTimeout(t)
            t = null
          }
        }, 0)
      }
    }
  } else {
    if (range === PRINT_RANGE_MAP.current.key) {
      toggleRequireFillCellBgInfo(true)
      printSheet(false, cb, { layout }, true)
    } else {
      previewMakingDialogRef.value?.open?.()

      toggleRequireFillCellBgInfo(true)

      let t
      if (!t) {
        t = setTimeout(() => {
          printSheetAll(cb)
          if (t) {
            clearTimeout(t)
            t = null
          }
        }, 0)
      }
    }
  }
}

function toBlob(base64Data) {
  let byteString = base64Data
  if (base64Data.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(base64Data.split(',')[1]) // base64 解码
  } else {
    byteString = unescape(base64Data.split(',')[1])
  }
  // 获取文件类型
  const mimeString = base64Data.split(';')[0].split(':')[1] // mime类型

  // ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区
  // let arrayBuffer = new ArrayBuffer(byteString.length) // 创建缓冲数组
  // let uintArr = new Uint8Array(arrayBuffer) // 创建视图

  const uintArr = new Uint8Array(byteString.length) // 创建视图

  for (let i = 0; i < byteString.length; i += 1) {
    uintArr[i] = byteString.charCodeAt(i)
  }
  // 生成blob
  const blob = new Blob([uintArr], {
    type: mimeString
  })
  // 使用 Blob 创建一个指向类型化数组的URL, URL.createObjectURL是new Blob文件的方法,可以生成一个普通的url,可以直接使用,比如用在img.src上
  return blob
}

function loadAndPrintPDF() {
  var embed = document.createElement('embed')
  embed.src = 'your-pdf-file.pdf'
  embed.type = 'application/pdf'
  document.body.appendChild(embed)

  // 等待PDF加载完成后打印
  embed.onload = function () {
    window.print()
  }
}

// 打印方案1

const reducePrint = (pdf, index = 0, sheet, sheets) => {
  window.luckysheet.setSheetActive(sheet.order)
  // 获取打印区域的行列
  const RowColumn = getPrintSheetArea()
  // 因需要打印左边的边框，需重新设置第一列
  RowColumn.column[0] = 0
  // 进行选区操作
  window.luckysheet.setRangeShow(RowColumn)
  if (index === 0) {
    document.querySelector('#print_html').style.display = 'block'
  }

  window.luckysheet.hideGridLines()

  window.luckysheet.getScreenshotPro(
    async (imgSrc) => {
      // TODO: 这里要判断
      window.luckysheet.showGridLines()
      // const $img = `<img src=${imgSrc} style="max-width: 100%;" />`
      const $div = document.createElement('div')
      const $img = document.createElement('img')
      $img.src = imgSrc
      $div.style.maxWidth = '100%'
      $img.style.maxWidth = '100%'
      // $img.style.pageBreakAfter = 'always'
      $div.classList.add('printImg')
      $div.appendChild($img)

      await nextTick()

      document.querySelector('#print_html').appendChild($div)
      // document.querySelector('#print_html').appendChild($img)

      await nextTick()

      const div = document.getElementById('print_html').getElementsByTagName('div')[index]
      const img = div.getElementsByTagName('img')[0]
      // const img = document.getElementById('print_html').getElementsByTagName('img')[index]
      console.log(
        '🚀 ~ img:',
        document.getElementById('print_html').getElementsByTagName('img'),
        index,
        img
      )
      const width = img.naturalWidth
      const height = img.naturalHeight
      // const width = img.width
      // const height = img.height
      const ratio = width / height

      const devicePixelRatio = getDevicePixelRatioAlikeLuckysheet()
      const a4Size = calculateA4PaperSize()
      const a4Width = 794 * devicePixelRatio
      const a4Height = 1123 * devicePixelRatio
      // const a4Width = (a4Size.width ?? 794) * devicePixelRatio
      // const a4Height = (a4Size.height ?? 1123) * devicePixelRatio
      // console.log('🚀 ~ a4Width:', a4Width, a4Height)

      const verticalPadding = 185 * devicePixelRatio
      const horizontalPadding = 256 * devicePixelRatio
      const portraitWidth = (a4Width - verticalPadding * 2) / devicePixelRatio
      const landscapeWidth = (a4Height - horizontalPadding * 2) / devicePixelRatio
      const criticalWidth = a4Width + (a4Height - a4Width) / 2
      // console.log('🚀 ~ criticalWidth:', criticalWidth)

      let pdfWidth = portraitWidth

      if (index === 0) {
        pdf.deletePage(1)
      }

      if (width < criticalWidth) {
        pdfWidth = portraitWidth
        pdf.addPage('a4', 'p')
      } else {
        pdfWidth = landscapeWidth
        pdf.addPage('a4', 'l')
      }

      // TODO: 暂时注释
      // html2canvas(img, {
      //   //Whether to allow cross-origin images to taint the canvas
      //   allowTaint: true,
      //   //Whether to test each image if it taints the canvas before drawing them
      //   taintTest: false
      //   // scale: 0.25
      //   // onrendered: function (canvas) {
      //   //   console.log('canvas💕111', canvas)
      //   //   // var contentWidth = canvas.width
      //   //   // var contentHeight = canvas.height
      //   //   // //一页pdf显示html页面生成的canvas高度;
      //   //   // var pageHeight = (contentWidth / 592.28) * 841.89
      //   //   // //未生成pdf的html页面高度
      //   //   // var leftHeight = contentHeight
      //   //   // //页面偏移
      //   //   // var position = 0
      //   //   // //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
      //   //   // var imgWidth = 595.28
      //   //   // var imgHeight = (592.28 / contentWidth) * contentHeight
      //   //   // var pageData = canvas.toDataURL('image/jpeg', 1.0)
      //   //   // //注①
      //   //   // // TODO: yzs先注释
      //   //   // // var pdf = new jsPDF('', 'pt', 'a4')
      //   //   // //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
      //   //   // //当内容未超过pdf一页显示的范围，无需分页
      //   //   // if (leftHeight < pageHeight) {
      //   //   //   pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
      //   //   // } else {
      //   //   //   while (leftHeight > 0) {
      //   //   //     //arg3-->距离左边距;arg4-->距离上边距;arg5-->宽度;arg6-->高度
      //   //   //     pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
      //   //   //     leftHeight -= pageHeight
      //   //   //     position -= 841.89
      //   //   //     //避免添加空白页
      //   //   //     if (leftHeight > 0) {
      //   //   //       //注②
      //   //   //       pdf.addPage()
      //   //   //     }
      //   //   //   }
      //   //   // }

      //   //   // pdf.save('name_hos.pdf')
      //   // }
      // }).then(async (canvas) => {
      //   // ======== 方法1 ========
      //   //创绘制切割后绘制canvas用的canvas标签以及对应的context对象
      //   // const perCanvas = document.createElement('canvas')
      //   // perCanvas.style.backgroundColor = '#fff'
      //   // const context = perCanvas.getContext('2d')

      //   // const canvasData = canvas.toDataURL('image/jpeg', 1.0)
      //   // console.log('11 canvas', canvas, canvas.width)
      //   // // pdf的尺寸
      //   // const pdfWidth = 578
      //   // const pdfHeight = pdfWidth * 1.414

      //   // //切割后的canvas图片的宽高，就等于每页pdf的宽高
      //   // perCanvas.width = 578
      //   // perCanvas.height = pdfHeight

      //   // console.log(perCanvas.width, perCanvas.height)

      //   // // 每张图片的高度：适当减少100，上下各留50页边距
      //   // const perHeight = pdfHeight - 50

      //   // // 计算切割次数
      //   // let splitCount = Math.ceil(canvas.height / perHeight)
      //   // if (splitCount * perHeight < canvas.height) splitCount++

      //   // //创建img对象，加载完整的canvas图片
      //   // const img = new Image()
      //   // img.src = canvasData

      //   // //待图片加载完成
      //   // await setTimeout(() => {}, 5000)

      //   // //创建pdf对象
      //   // // const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight])

      //   // //切割canvas图片，贴到每一页pdf中
      //   // for (let i = 0; i < splitCount; i++) {
      //   //   const startY = i * perHeight // 起始y坐标

      //   //   // 清空画布
      //   //   context.clearRect(0, 0, perCanvas.width, pdfHeight)
      //   //   context.fillStyle = '#fff'
      //   //   context.fillRect(0, 0, perCanvas.width, pdfHeight)
      //   //   // 绘制当前切割区域的图片
      //   //   context.drawImage(
      //   //     img,
      //   //     0,
      //   //     startY,
      //   //     perCanvas.width,
      //   //     perHeight,
      //   //     0,
      //   //     0,
      //   //     perCanvas.width,
      //   //     perHeight
      //   //   )
      //   //   const perCanvasData = perCanvas.toDataURL('image/jpeg', 1.0)
      //   //   pdf.addImage(perCanvasData, 'JPEG', 30, 10, perCanvas.width, perCanvas.height)
      //   //   if (i < splitCount - 1) pdf.addPage()
      //   // }
      //   // ======= 方法1 =======

      //   // ======= 方法2 =======

      //   const _pdfWidth = 578
      //   const _pdfHeight = 802
      //   var contentWidth = canvas.width
      //   var contentHeight = canvas.height
      //   //一页pdf显示html页面生成的canvas高度;
      //   var pageHeight = (contentWidth / _pdfWidth) * _pdfHeight
      //   // var pageHeight = (contentWidth / 592.28) * 841.89
      //   //未生成pdf的html页面高度
      //   var leftHeight = contentHeight
      //   //页面偏移
      //   var position = 0
      //   //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
      //   var imgWidth = _pdfWidth
      //   var imgHeight = (_pdfWidth / contentWidth) * contentHeight
      //   console.log(999, contentWidth, contentHeight, imgWidth, imgHeight, pageHeight)
      //   var pageData = canvas.toDataURL('image/jpeg', 1.0)
      //   //注①
      //   // TODO: yzs先注释
      //   // var pdf = new jsPDF('', 'pt', 'a4')
      //   //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
      //   //当内容未超过pdf一页显示的范围，无需分页
      //   if (leftHeight < pageHeight) {
      //     pdf.addImage(pageData, 'JPEG', 10, 20, imgWidth, imgHeight)
      //   } else {
      //     while (leftHeight > 0) {
      //       //arg3-->距离左边距;arg4-->距离上边距;arg5-->宽度;arg6-->高度
      //       pdf.addImage(pageData, 'JPEG', 10, position + 20, imgWidth, imgHeight)
      //       leftHeight -= pageHeight
      //       position -= _pdfHeight
      //       //避免添加空白页
      //       if (leftHeight > 100) {
      //         //注②
      //         pdf.addPage()
      //       }
      //     }
      //   }

      //   previewMakingDialogRef.value?.close?.()
      //   reportFormRef.value?.open?.(pdf.output('datauristring'))
      // })

      const pdfHeight = pdfWidth / ratio

      console.log('🚀 ~ width:', img.naturalWidth, img.naturalHeight, pdfWidth, pdfHeight)

      // TODO: 记得还原
      pdf.addImage(imgSrc, 'PNG', 12, 12, pdfWidth, pdfHeight)

      // TODO: 记得还原
      if (index === sheets.length - 1) {
        // if (index === 0) {
        // setTimeout(() => {
        //   document.querySelector('#print_html').style.display = 'none'
        // }, 100)
        // const link = window.URL.createObjectURL(toBlob(pdf.output('datauristring')))
        // const myWindow = window.open(link)
        // myWindow.print()
        // const iframe = document.getElementById('iframe123')
        // iframe.src = pdf.output('datauristring', 'yzs.pdf') //在iframe中显示
        // iframe.onload = function () {
        //   iframe.contentWindow.focus()
        //   iframe.contentWindow.print()
        // }
        // var embed = document.createElement('embed')
        // embed.src = pdf.output('datauristring')
        // embed.type = 'application/pdf'
        // document.body.appendChild(embed)
        // // 等待PDF加载完成后打印
        // embed.onload = function () {
        //   window.print()
        // }
        // pdf.save('yzs1.pdf')
        // pdf.output('dataurlnewwindow', 'yzs.pdf')

        // TODO: 记得打开
        previewMakingDialogRef.value?.close?.()
        reportFormRef.value?.open?.(pdf.output('datauristring'))
        // pdf.autoPrint()
      }
    },
    { layout: 'landscape' }
  )
}

const printSheetAll = async (cb) => {
  // // 获取打印区域的行列
  // const RowColumn = getPrintSheetArea()
  // // 因需要打印左边的边框，需重新设置第一列
  // RowColumn.column[0] = 0
  // console.log('🚀 ~ printSheet ~ RowColumn:', RowColumn)
  // // 进行选区操作
  // window.luckysheet.setRangeShow(RowColumn)
  // document.querySelector('#print_html').style.display = 'block'
  // window.luckysheet.hideGridLines()

  // 将打印区域生成base64图片（*将生成的base64编码复制粘贴到浏览器地址框，是可以预览图片样式的），生成后执行的后续打印操作，取用匿名委托函数做为参数传入
  const sheets = window.luckysheet.getAllSheets()

  // let index = 0
  const pdf = new jsPDF({
    // orientation: 'landscape'
    compress: true,
    autoFirstPage: false,
    unit: 'px'
    // TODO: 暂时和html2canvas保持一致，先关闭
    // unit: 'pt'
  })

  // TODO: 记得还原
  // for (let index = 0; index < 1; index++) {
  for (let index = 0; index < sheets.length; index++) {
    reducePrint(pdf, index, sheets[index], sheets)
  }

  // previewMakingDialogRef.value?.close?.()
  // reportFormRef.value?.open?.(pdf.output('datauristring'))

  await nextTick()

  setTimeout(() => {
    const print_html = document.querySelector('#print_html')
    // print_html.innerHTML = ''
    print_html.style.display = 'none'
    cb?.()
  }, 100)
}

// ================ 打印方案2：window.print ================
// 优点：分页方便
// 缺点：只能全部纵向or全部横向

const reducePrintWindowPrint = (pdf, index = 0, sheet, sheets) => {
  window.luckysheet.setSheetActive(sheet.order)
  // 获取打印区域的行列
  const RowColumn = getPrintSheetArea()
  // 因需要打印左边的边框，需重新设置第一列
  RowColumn.column[0] = 0
  // 进行选区操作
  window.luckysheet.setRangeShow(RowColumn)
  if (index === 0) {
    document.querySelector('#print_html').style.display = 'block'
  }

  window.luckysheet.hideGridLines()

  window.luckysheet.getScreenshotPro(
    async (imgSrc) => {
      // TODO: 这里要判断
      window.luckysheet.showGridLines()
      const $div = document.createElement('div')
      const $img = document.createElement('img')
      $img.src = imgSrc
      $div.style.maxWidth = '100%'
      $img.style.maxWidth = '100%'
      $div.classList.add('printImg')
      $div.appendChild($img)

      await nextTick()

      document.querySelector('#print_html').appendChild($div)

      await nextTick()

      const div = document.getElementById('print_html').getElementsByTagName('div')[index]
      const img = div.getElementsByTagName('img')[0]

      console.log(
        '🚀 ~ img:',
        document.getElementById('print_html').getElementsByTagName('img'),
        index,
        img
      )
    },
    { layout: 'landscape' }
  )
}

const printSheetAllWindowPrint = async () => {
  // args:
  // { useWindowPrint = true, printOptions = {} }
  const sheets = window.luckysheet.getAllSheets()

  const pdf = new jsPDF({
    // orientation: 'landscape'
    compress: true
  })

  for (let index = 0; index < sheets.length; index++) {
    reducePrintWindowPrint(pdf, index, sheets[index], sheets)
  }

  await nextTick()

  document.getElementById('printExcelBtn').click()

  setTimeout(() => {
    const print_html = document.querySelector('#print_html')
    print_html.innerHTML = ''
    print_html.style.display = 'none'
  }, 100)

  previewMakingDialogRef.value?.close?.()
}

// ================ 打印方案3：导出xlsx二进制流->后端转pdf->返回pdf二进制流or服务器地址 ================

const handlePrintByExcelBlob = async (printSheetIndexList = [], callback) => {
  const blob = await exportSheetExcel(
    window.luckysheet,
    `file_${new Date().getTime()}`,
    false,
    printSheetIndexList
  )

  const fileName = `file_${new Date().getTime()}.xlsx`
  console.log('🚀 ~ handleExport ~ url:', blob)

  const xlsxFile = new File([blob], fileName, {
    type: blob.type
  })
  // download.excel(xlsxFile, `${fileName}.xlsx`)

  const d = await convertExcel2Pdf({ file: xlsxFile })
  const _blob = new Blob([d], { type: 'application/pdf' })
  window.URL = window.URL || window.webkitURL
  const href = URL.createObjectURL(_blob)

  previewMakingDialogRef.value?.close?.()
  reportFormRef.value?.open?.(href)
  // reportFormRef.value?.open?.(pdf.output('datauristring'))

  callback?.()
}

const buildPdfFileByExcel = async (printSheetIndexList = [], callback) => {
  const blob = await exportSheetExcel(
    window.luckysheet,
    `file_${new Date().getTime()}`,
    false,
    printSheetIndexList
  )

  const fileName = `file_${new Date().getTime()}.xlsx`
  // console.log('🚀 ~ handleExport ~ url:', blob)

  const xlsxFile = new File([blob], fileName, {
    type: blob.type
  })

  const d = await convertExcel2Pdf({ file: xlsxFile })
  const _blob = new Blob([d], { type: 'application/pdf' })

  const pdfFileName = `${sampleDetail.value?.projectName}_${sampleDetail.value?.sampleName}_${sampleDetail.value?.sampleCode}_${sampleDetail.value?.examineProjectName}_检验报告_${formatDate(new Date())}.pdf`
  const pdfFile = new File([_blob], pdfFileName, {
    type: 'application/pdf'
  })

  httpRequest({ file: pdfFile, onSuccess: handleScreenshotAutoUploadSuccess })
    .then((res) => {
      console.log('🚀 ~ res:', res)
      ElMessage.closeAll()

      const loading = ElLoading.service({
        fullscreen: false,
        text: '生成报告成功',
        target: '#fill-view'
      })

      callback?.()
    })
    .catch((err) => {
      console.log('🚀 ~ httpRequest ~ err:', err)
    })
    .finally(() => {
      ElMessage.closeAll()
      submitFillDataRef.value.close?.()
    })
}

const fileRef = ref(null)

// 导出excel
const handleExport = async () => {
  const url = await exportSheetExcel(window.luckysheet, 'file', true)

  console.log('🚀 ~ handleExport ~ url:', url)
  // fileRef.value.open(url)
  // exportSheetExcel_2(window.luckysheet, 'file')
}

const fetchSimpleDictDataList = async () => {
  const res = await getSimpleDictDataList()
  simpleDictDataList.value = res
}

watch(
  () => props.runningTasks,
  (value) => {
    console.log('🚀 ~ fill view value:', value)
    // runningTasks外层已经筛选过一层，已经是status=1，是本人处理的，这里只需要过滤是否是填报任务
    runningFillTasks.value = value?.filter?.((task) => judgeIsFillTask(task.taskDefinitionKey))

    if (!stashLuckySheetOption.value) {
      return
    }

    if (runningFillTasks.value?.length) {
      stashLuckySheetOption.value.allowEdit = true
    } else {
      stashLuckySheetOption.value.allowEdit = false
      // stashLuckySheetOption.value.showtoolbar = true
    }

    // TODO: 不需要了
    // window.luckysheet?.destroy?.()
    // window.luckysheet?.create?.({ ...stashLuckySheetOption.value, ...toolbarConfig })
  },
  {
    deep: true,
    immediate: true
  }
)

onMounted(() => {
  // window.luckysheet?.create?.({
  //   container: 'luckysheetWrap',
  //   lang: 'zh',
  //   showinfobar: false,
  //   ...toolbarConfig
  // })

  fetchSimpleDictDataList()
  fetchSampleFillData()
})
</script>

<style lang="scss" scoped>
$operation-height: 40px;

.filling-view {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  // height: calc(100vh - var(--el-dialog-padding-primary) * 2 - 24px - 30px);
  height: calc(100vh - var(--el-dialog-padding-primary) * 2 - 55px);

  :deep(.el-loading-mask) {
    z-index: 999999 !important;
  }
}

.filling-view__content {
  // display: flex;
  width: 100%;
  height: calc(100% - #{$operation-height});
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(255 255 255 / 100%);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(236 245 255 / 100%);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgb(64 158 255 / 40%);
  }

  &::-webkit-scrollbar-corner {
    background: rgb(236 245 255 / 100%);
  }
}

.readonly {
  height: 100%;
}

.toolbar {
  width: 100%;
  height: 35px;
}

#luckysheetWrap {
  position: relative;

  /* width: 100%; */

  /* width: 76vw; */
  // width: calc(1150px - var(--el-dialog-padding-primary) * 2 - 15px * 2 - 20px);
  // width: 70%;
  // width: calc(99vw - var(--el-dialog-padding-primary) * 2 - 15px * 2 - 28vw - 80px - 10px);
  width: calc(80vw - var(--el-dialog-padding-primary) * 2 - 15px * 2 - 80px - 10px - 10px);

  /* height: calc(100vh - 35px - 65px); */

  /* 标签页用这个高度 */

  /* height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) -
      var(--app-footer-height) - var(--el-card-padding) * 2 - 15px
  ); */

  /* 弹框用这个高度 */

  // height: 70vh;
  // height: calc(100vh - 32px - 24px - 40px - 15px - 30px - 48px - 20px - 65px);
  height: calc(100vh - 32px - 24px - 40px - 65px);
  // min-width: 1060px;
  // height: calc(100% - 48px - 20px);
}

#uploadBtn {
  font-size: 16px;
}

#tip {
  position: absolute;
  inset: 0;
  z-index: 1000000;
  display: flex;
  font-size: 40px;
  text-align: center;
  background: rgb(17 11 11 / 80%);
  align-items: center;
  justify-content: center;
}

.operation {
  display: flex;
  height: $operation-height;
  justify-content: center;
  align-items: center;
}

.modal-content {
  display: flex;
  width: 100%;
  height: 500px;
  max-height: 600px;
  overflow: auto;
  justify-content: center;
  align-items: baseline;

  img {
    width: 794px;

    /* height: 100%; */
  }
}

.upload-wrap {
  display: flex;
  width: 100%;
  // width: 28vw;
  padding: 0 10px;
  margin: 10px 0;
}

.upload-label {
  display: flex;
  align-items: center;
  height: 32px;
  margin-right: 12px;
}
</style>
