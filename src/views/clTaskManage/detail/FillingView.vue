<template>
  <div class="container">
    <div v-show="false" class="toolbar">
      <el-button @click="handleSelectExcel">选择并填报</el-button>
      <el-button @click="handlePreview">预览</el-button>
      <el-button @click="printSheet(true)">打印</el-button>
      <el-button id="printExcelBtn" style="display: none" plain v-print="printConfig">
        打印！
      </el-button>
      <el-button id="printPreviewBtn" style="display: none" @click="printExcel">打印预览</el-button>
      <!-- <el-button @click="downloadExcel">导出</el-button> -->
      <!-- <el-button @click="handlePrint">打印</el-button> -->
      <!-- <input id="uploadBtn" type="file" @change="loadExcel" /> -->
    </div>
    <div id="luckysheetWrap"></div>
    <div class="upload-wrap">
      <!-- v-model="attachment" -->
      <UploadFileChunk
        class="min-w-80px"
        v-model="attachmentList"
        :disabled="!runningFillTasks.length"
        :accept="['*']"
        :limit="10"
        :limitFileSize="false"
        @success="handleUploadSuccess"
      />
    </div>
    <div class="operation" v-if="runningFillTasks.length">
      <el-button color="#3F6297" @click="handleSave(false)">
        <Icon icon="ep:document-add" class="mr-1"/>
        暂存</el-button>
      <!-- <el-button @click="handleSave(true)">提交</el-button> -->
      <el-button @click="handleToggleSubmitFillData">
         <Icon icon="ep:check" class="mr-1"/>
        提交</el-button>
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
      style="z-index: -998; display: none; text-align: center; opacity: 0"
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
  />
</template>

<script setup>
import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import { clone } from 'ramda'
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as SampleTaskApi from '@/api/task'
import {
  getSheetConfig,
  a4SizeInPixels,
  checkIsSingleCellSelected,
  getStorage,
  setStorage
} from '@/components/luckysheet/utils/util'
// import { exportExcel } from '@/utils/export'
import {
  getMockReportData,
  get_mock_select_list,
  get_mock_tree_list
} from '@/components/luckysheet/mock'
import { extractTableNameAndVariable } from '@/components/luckysheet/utils/util'
import { CELL_EXTEND_MAP, VALUE_TYPE_MAP } from '@/components/luckysheet/constants'
import CellEditDialog from '@/components/luckysheet/CellEditDialog/CellEditDialog.vue'
import { getDictOptions, DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { useUserStore } from '@/store/modules/user'
import { judgeIsFillTask } from '@/utils/sampleTask'
import * as SampleApi from '@/api/sample'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import SubmitFillData from './dialog/SubmitFillData.vue'

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const props = defineProps({
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
    print: true
  }
}

const stashLuckySheetOption = ref(null)
const { width = 0 } = a4SizeInPixels()
const printConfig = ref({ id: 'print_html', popTitle: 'test111', preview: false })
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
let selectData = reactive([])
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

/** 处理审批通过的操作 */
const submitFillDataRef = ref()

const handleToggleSubmitFillData = async () => {
  submitFillDataRef.value.open()
}

const findValueByMap = (data = [], sheetIndex, tableName, variableName, dataSourceIndex = 0) => {
  const targetTableData =
    data?.find?.((ite) => ite.sheetIndex == sheetIndex && ite.table === tableName) ?? {}

  const fields = targetTableData?.fields ?? []
  const findRow = fields?.find?.((ite) => {
    const rowIndex = Number((ite?.index ?? '').split('|')?.pop() ?? '0')
    return dataSourceIndex === rowIndex
  })

  return findRow?.data?.[variableName]
}

const handleSelectExcel = async (sheets = [], sheetsDataSheetConfigs = [], data = []) => {
  console.log('🚀 ~ handleSelectExcel ~ sheets:', sheets)
  console.log('🚀 ~ handleSelectExcel ~ sheetsDataSheetConfigs:', sheetsDataSheetConfigs)

  // TODO: 原来的逻辑，记得还原
  // const hasFillData = sheetsDataSheetConfigs && sheetsDataSheetConfigs.length > 0
  // TODO: mock，记得注释
  const hasFillData = false
  const _sheets = hasFillData ? sheetsDataSheetConfigs : sheets
  const newSheets = clone(_sheets)

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
      columnStartCoords: _columnStartCoords
    } = sheet ?? {}
    // ===== ↓暂时先按初始和有
    // if (hasFillData) {
    //   originSheet = sheets[idx] ?? {}
    // }

    // const {
    //   calcChain: originCalcChain,
    //   celldata: originCelldata,
    //   config: originConfig,
    //   frozen: originFrozen,
    //   hyperlink: originHyperlink,
    //   images: originImages,
    //   index: originIndex,
    //   name: originName,
    //   order: originOrder,
    //   extraCustomCellConfigs: _originExtraCustomCellConfigs,
    //   dataSourceConfig: _originDataSourceConfig,
    //   extendCellOrigins: _originExtendCellOrigins,
    //   columnStartCoords: _originColumnStartCoords
    // } = originSheet
    const originSheet = sheetsDataSheetConfigs[idx] ?? {}
    const { images: originImages } = originSheet

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
                const dataSourceIndex = cellRow - originRow
                // 这里其实就是取值了，但暂时不能用formInfo配置数据去回显，是因为图片这些数据存在sheetsData里
                // let newValue =
                //   dataSourceData.data?.[index]?.[tableName]?.[dataSourceIndex]?.[variableName]

                const findInSampleDefaultValue = sampleDetail.value?.[variableName]
                const newValue =
                  findInSampleDefaultValue ||
                  findValueByMap(data, index, tableName, variableName, dataSourceIndex)

                console.log('🚀 ~ newSheets.map ~ newValue:', newValue)

                const newCell = {
                  ...cell,
                  v: {
                    ...v,
                    v: newValue
                  }
                }
                newCellData.push(newCell)
              } else if (cellExtend === '2') {
                const dataSourceIndex = cellRow - originRow
                const findInSampleDefaultValue = sampleDetail.value?.[variableName]
                const newValue =
                  findInSampleDefaultValue ||
                  findValueByMap(data, index, tableName, variableName, dataSourceIndex)
                const newCell = {
                  ...cell,
                  v: {
                    ...v,
                    v: newValue
                  }
                }

                newCellData.push(newCell)
              } else {
                newCellData.push(cell)
              }
            } else {
              // TODO: 未知
              newCellData.push(cell)
            }
          } else {
            // TODO: 先暂定这么处理
            newCellData.push(originCell)
          }
        }
      } else {
        // TODO: 先暂定这么处理
        newCellData.push(cell)
      }
    })

    const sheetData = {
      calcChain,
      celldata: newCellData,
      // celldata,
      config,
      frozen,
      hyperlink,
      images: originImages,
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
  })
  console.log('🚀 ~ newSheets.map ~ sheetsData:', sheetsData)

  stashLuckySheetOption.value = {
    container: 'luckysheetWrap',
    lang: 'zh',
    showinfobar: false,
    // allowEdit: false,
    ...toolbarConfig,
    data: sheetsData,
    hook: {
      cellEditBefore: cellEditBefore,
      imageInsertAfter: handleImageInsertAfter
    }
    // title: exportJson.info.name,
    // userInfo: exportJson.info.name.creator
  }

  console.log('🚀 ~ handleSelectExcel ~ runningFillTasks.value:', runningFillTasks.value)
  if (!runningFillTasks.value.length) {
    stashLuckySheetOption.value.allowEdit = false
  } else {
    stashLuckySheetOption.value.allowEdit = true
  }

  window.luckysheet?.destroy?.()
  window.luckysheet?.create?.(stashLuckySheetOption.value)
}

const handleSave = async (submitForApproval = false, remainingPayload = {}) => {
  const submitData = processData()
  const _sheets = window.luckysheet.getAllSheets()
  const _sheetsData = []
  _sheets.forEach?.((sheet) => {
    const sheetConfig = getSheetConfig(sheet)
    const { index } = sheetConfig
    sheetConfig.extraCustomCellConfigs = extraCustomCellConfigs.data?.[index]
    sheetConfig.dataSourceConfig = sheetDataSource.data?.[index]
    sheetConfig.extendCellOrigins = extendCellOrigins.data?.[index]
    // TODO: 还有个循环块，待处理

    _sheetsData.push(sheetConfig)
  })

  const payload = {
    businessKey: props.sampleId,
    data: submitData,
    sheetsData: JSON.stringify({ sheetConfigs: _sheetsData }),
    // TODO: 暂存的时候不传行不行？
    // approvalUser: {
    //   firstApproveUser: '1',
    //   secondApproveUser: '1',
    //   thirdApproveUser: '1'
    // },
    fillAttachment: JSON.stringify(fileList.value)
  }

  const { equipmentId, approvalUser } = remainingPayload ?? {}

  if (equipmentId) {
    payload.equipmentId = equipmentId
  }

  if (approvalUser) {
    payload.approvalUser = approvalUser
  }

  // setStorage('sampleFillData', JSON.stringify(payload))

  const data = await SampleTaskApi.updateSampleInfoDataFill(payload)

  if (submitForApproval) {
    const approvalPayload = {
      id: runningFillTasks.value?.[0].id,
      reason: '填报完成'
    }

    await SampleTaskApi.fillProcessInstance(approvalPayload)

    message.success('保存并提交成功')
  } else {
    message.success('保存成功')
  }

  // 通知详情页刷新数据
  emit('success')
}

const handleSubmitFillData = async (params) => {
  const func = async () => {
    await handleSave(true, params)
    submitFillDataRef.value.close?.()
  }

  await printSheet(true, func)
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
          // 有图片则覆盖v
          if (preImageData[index]?.[`${r}_${c}`]) {
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

  console.log('🚀 ~ processData ~ preData:', preData)
  console.log('🚀 ~ processData ~ submitData:', submitData)

  return submitData
}

const downloadExcel = () => {
  // exportExcel(window.luckysheet.getAllSheets(), '下载')
}

const handlePreview = () => {
  const s = window.luckysheet.getScreenshot()
  window.luckysheet.getScreenshotPro((imgSrc) => {
    screenshot.value = imgSrc
    dialogVisible.value = true
  })
}

const printExcel = () => {
  printSheet()
}

const printSheet = async (autoUpload = false, cb) => {
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
    window.luckysheet.getScreenshotPro(async (imgSrc) => {
      window.luckysheet.showGridLines()
      // * Lodop中的ADD_PRINT_IMAGE，也可以直接输出base64码图片，不用加img标签（如果加了img标签，会被当做超文本对待，受浏览器引擎解析的影响）
      const $img = `<img src=${imgSrc} style="max-width: 90%;" />`

      await nextTick()

      document.querySelector('#print_html').innerHTML = $img

      document.getElementById('printExcelBtn').click()
      setTimeout(() => {
        document.querySelector('#print_html').style.display = 'none'
      }, 100)

      await nextTick()

      if (autoUpload) {
        const img = document.getElementById('print_html').getElementsByTagName('img')[0]
        // 创建一个新的canvas元素
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        // 将图片绘制到canvas上
        var ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        // 将canvas内容转换为Blob
        canvas.toBlob(function (blob) {
          // 创建文件对象
          var file = new File(
            [blob],
            `${sampleDetail.value?.sampleName}-检验报告-${formatDate(new Date())}.png`,
            {
              type: 'image/png'
            }
          )

          httpRequest({ file, onSuccess: handleScreenshotAutoUploadSuccess })
            .then((res) => {
              console.log('🚀 ~ res:', res)
              cb?.()
            })
            .catch((err) => {
              console.log('🚀 ~ httpRequest ~ err:', err)
            })
        }, 'image/png')
      }
    })
  } else {
    // TAG: 选单个单元格
    console.log('进else')
    // 获取打印区域的行列
    const RowColumn = getPrintSheetArea()
    // 因需要打印左边的边框，需重新设置第一列
    RowColumn.column[0] = 0
    // 进行选区操作
    window.luckysheet.setRangeShow(RowColumn)

    // 简单粗暴全选，但效果不好
    // document.getElementById('luckysheet-left-top').click()
    // 将打印区域生成base64图片（*将生成的base64编码复制粘贴到浏览器地址框，是可以预览图片样式的），生成后执行的后续打印操作，取用匿名委托函数做为参数传入
    // screenshot.value = window.luckysheet.getScreenshot()
    // dialogVisible.value = true
    window.luckysheet.getScreenshotPro(async (imgSrc) => {
      window.luckysheet.showGridLines()
      // * Lodop中的ADD_PRINT_IMAGE，也可以直接输出base64码图片，不用加img标签（如果加了img标签，会被当做超文本对待，受浏览器引擎解析的影响）
      const $img = `<img src=${imgSrc} style="max-width: 90%;" />`

      await nextTick()

      document.querySelector('#print_html').innerHTML = $img
      document.getElementById('printExcelBtn').click()
      setTimeout(() => {
        document.querySelector('#print_html').style.display = 'none'
      }, 100)

      await nextTick()
      if (autoUpload) {
        const img = document.getElementById('print_html').getElementsByTagName('img')[0]
        // 创建一个新的canvas元素
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        // 将图片绘制到canvas上
        var ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        // 将canvas内容转换为Blob
        canvas.toBlob(function (blob) {
          // 创建文件对象
          var file = new File(
            [blob],
            `${sampleDetail.value?.sampleName}-检验报告-${formatDate(new Date())}.png`,
            {
              type: 'image/png'
            }
          )

          httpRequest({ file, onSuccess: handleScreenshotAutoUploadSuccess })
            .then((res) => {
              console.log('🚀 ~ res:', res)
              cb?.()
            })
            .catch((err) => {
              console.log('🚀 ~ httpRequest ~ err:', err)
            })
        }, 'image/png')
      }
    })
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
      if (it !== null) {
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

function handleImageInsertAfter(params) {
  console.log('🚀 ~ handleImageInsertAfter ~ params:', params)
}

// ======

function handleConfirm(form = {}, visible) {
  console.log('🚀 ~ handleConfirm ~ form:', form)
  const { cellContent } = form
  editForm.data.cellContent = cellContent

  const { r, c } = dragEndRC.value

  window.luckysheet.setCellValue(r, c, editForm.data.cellContent, {
    isRefresh: true
  })

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

function getEditDialogSelectList(dataSourceId) {
  const { data } = get_mock_select_list(dataSourceId)
  selectData = data
}

function getEditDialogTreeList(dataSourceId) {
  const { data } = get_mock_tree_list(dataSourceId)
  treeData = data
}

const fetchStorageFillData = () => {
  const storageData = getStorage('sampleFillData')
  return storageData
}

const fetchSampleFillData = async () => {
  await fetchSampleInfo()
  const data = await SampleTaskApi.getSampleFillData({ sampleId: props.sampleId })
  console.log('🚀 ~ fetchSampleFillData ~ data:', data)
  sampleFillData.value = data

  const fillAttachment = data?.fillAttachment ?? '[]'

  let arr = []

  // fileList.value = JSON.parse(fillAttachment)
  // fileList.value.forEach((item) => arr.push(item.url))
  // attachment.value = arr.join(',')

  fileList.value = JSON.parse(fillAttachment)
  attachmentList.value = JSON.parse(fillAttachment)

  // mock
  // const storageData = fetchStorageFillData()

  // sampleFillData.value = { ...data, ...storageData }
  setExcelConfig()
}

const fetchSampleInfo = async () => {
  const data = await SampleApi.getSampleInfoDetail(props.sampleId)
  sampleDetail.value = data
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
  // fileList.value.push(data)
}

// const handleRemove = (index) => {
//   fileList.value.splice(index, 1)
// }

watch(
  () => props.runningTasks,
  (value) => {
    console.log('🚀 ~ value:', value)
    // runningTasks外层已经筛选过一层，已经是status=1，是本人处理的，这里只需要过滤是否是填报任务
    runningFillTasks.value = value?.filter?.((task) => judgeIsFillTask(task.taskDefinitionKey))

    if (!stashLuckySheetOption.value) {
      return
    }

    if (runningFillTasks.value?.length) {
      stashLuckySheetOption.value.allowEdit = true
    } else {
      stashLuckySheetOption.value.allowEdit = false
    }

    window.luckysheet?.destroy?.()
    window.luckysheet?.create?.(stashLuckySheetOption.value)
  },
  {
    deep: true
  }
)

onMounted(() => {
  // window.luckysheet?.create?.({
  //   container: 'luckysheetWrap',
  //   lang: 'zh',
  //   showinfobar: false,
  //   ...toolbarConfig
  // })

  fetchSampleFillData()
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}

.toolbar {
  width: 100%;
  height: 35px;
}

#luckysheetWrap {
  position: relative;
  width: 100%;

  /* height: calc(100vh - 35px - 65px); */
  height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) -
      var(--app-footer-height) - var(--el-card-padding) * 2 - 15px
  );
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
  height: 65px;
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
  margin: 10px 0;
}
</style>
