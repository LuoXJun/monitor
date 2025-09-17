<template>
  <div id="luckysheetWrap"></div>
</template>

<script setup>
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
import {
  CELL_EXTEND_MAP,
  VALUE_TYPE_MAP,
  PREVIEW_IMG_PREFIX,
  TZ_BASE_TABLE_NAME,
  judgeIsTzBaseTable
} from '@/components/luckysheet/constants'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import * as SampleTaskApi from '@/api/task'
import * as TaskApi from '@/api/bpm/task'
import * as SampleApi from '@/api/sample'
import * as DefinitionApi from '@/api/bpm/definition'
import * as ledgerManage from '@/api/ledgerManage'
import { formatDate } from '@/utils/formatTime'
import { convertExcel2Pdf } from '@/api/luckysheet/luckysheet'
import { clone, mergeDeepRight, isNil, isEmpty, is } from 'ramda'
import { extractTableNameAndVariable } from '@/components/luckysheet/utils/util'
import { exportSheetExcel } from '@/components/luckysheet/utils/export'
import { defineExpose } from 'vue'

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
  }
  //是否是自由节点模型
  // uploadKey: {
  //   type: String,
  //   default() {
  //     return ''
  //   }
  // }
})

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const message = useMessage() // 消息弹窗
const { httpRequest } = useUpload()
//业务提交表单数据
const submitFillDataRef = ref()
const sampleFillData = ref({})
const uploadKey = ref()
const nodeUserSelectTasks = ref([])
const fileList = ref([])
const attachmentList = ref({})
const sampleDetail = ref({})
const runningFillTasks = ref([])
const stashLuckySheetOption = ref(null)
const requireFillCellBgInfo = ref({})
const needBuildReportToUpdate = ref(false)
const needToStore = ref(false)
const submitFillDataParams = reactive({ data: {} })
const toolbarConfig = {
  showtoolbar: false,
  showtoolbarConfig: {
    undoRedo: true,
    image: true,
    print: true,
    exportXlsx: true
  }
}
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
// const processInstanceId = ref()

//找到表格数据
const buildFinallyData = () => {
  window.luckysheet.exitEditMode()

  const _data = processData()
  // const _data = []
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

//上传
const buildPdfFileByExcel = async (printSheetIndexList = [], callback) => {
  const { data, sheetsData } = buildFinallyData()
  console.log('🚀 ~ buildPdfFileByExcel ~ sheetsData:', sheetsData)

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
      // const loading = ElLoading.service({
      //   fullscreen: true,
      //   text: '生成报告成功',
      //   target: '#fill-view'
      // })
      sampleFillData.value.fillAttachment = res
      callback?.()
      // return res
    })
    .catch((err) => {
      console.log('🚀 ~ httpRequest ~ err:', err)
    })
    .finally(() => {
      // submitFillDataRef.value.close?.()
    })
}

const handleScreenshotAutoUploadSuccess = (res) => {
  const data = res.data ?? {}
  // fileList.value.filter((file) => (file.type ?? '').indexOf('image') && file.name !== data.name)
  // attachmentList.value.filter(
  //   (file) => (file.type ?? '').indexOf('image') && file.name !== data.name
  // )
  // fileList.value.push(data)
  // attachmentList.value.push(data)
}

//数据加载
const fetchSampleInfo = async () => {
  try {
    // const data = await SampleApi.getSampleInfoDetailByProcessInstanceId(props.processInstanceId)
    const data = await ledgerManage.getledgerInfoInfo(props.processInstanceId)
    const property = data?.property ?? {}
    let dynamicData
    // const dynamicData = data?.dynamicData ?? {}
    for (const item of data?.dynamicData) {
      if (item.data) {
        dynamicData = { ...item.data }
      }
      // console.log('🚀 ~ fetchSampleInfo ~ dynamicData:', item.data);
    }

    // const dynamicData = data?.dynamicData
    const propertyObj = {}

    for (const key in property) {
      if (!propertyObj[key]) {
        propertyObj[key] = property[key]?.propertyValue
      }
    }
    dynamicData = removeEmptyValues(dynamicData)
    console.log('🚀 ~ fetchSampleInfo ~ dynamicData:', dynamicData, propertyObj)
    sampleDetail.value = { ...data, ...propertyObj, ...dynamicData }
    console.log('🚀 ~ fetchSampleInfo ~ sampleDetail.value:', sampleDetail.value)
  } catch (error) {
    console.log('🚀 ~ fetchSampleInfo ~ error:', error)
  }
}
const fetchSampleFillData = async (keepLoading = false) => {
  // const loading = ElLoading.service({
  //   fullscreen: true,
  //   text: '数据加载中...',
  //   target: '#fill-view'
  // })

  try {
    await fetchSampleInfo()
    const data = await SampleTaskApi.getSampleFillData({
      processInstanceId: props.processInstanceId
    })
    console.log('🚀 ~ fetchSampleFillData ~ data:', data)
    if (!keepLoading) {
      // loading?.close?.()
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
      // loading?.close?.()
    }
  }
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

  // console.log('🚀 ~ findValueByMap ~ mergeFields:', mergeFields, mergeFields.length)

  return { dataValue: findRow?.data?.[variableName], mergeFields }
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
const checkMine = async function (key) {
  const data = await SampleTaskApi.getTaskProcessInstance({ id: props.processInstanceId })
  const res = await DefinitionApi.getProcessDefinition(data.processDefinitionId)
  console.log('🚀 ~ checkMine ~ res:', res)

  res.nodeUserSelectTasks.forEach((item, index) => {
    let indexState
    // 第一次审批时候，默认取第一个。否则取index+1,最后一个不加这个值
    if (item.id == key) {
      if (index == 0) {
        indexState = 1
      } else {
        indexState = index + 1
      }
      // 最后一个不传这个值
      if (res.nodeUserSelectTasks[indexState]) {
        uploadKey.value = res.nodeUserSelectTasks[indexState].id
      }
    }
  })
}

//过滤掉对象中值为空的属性
function removeEmptyValues(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value != null && value !== '' && key != 'sheet_index' && key != 'business_key') {
      // 判断不为null/undefined/空字符串
      acc[key] = value
    }
    return acc
  }, {})
}

//提交到下一级
const handleSave = async (submitForApproval = false, remainingPayload = {}, emitSuccess = true) => {
  // console.log('🚀 ~ handleSubmitFillData ~ params:', params)

  const { data, sheetsData } = buildFinallyData()
  // console.log('🚀 ~ handleSubmitFillData ~ data:', sampleDetail.value.dynamicData.map(item =>item.data));
  data[0].fields[0].data = removeEmptyValues(
    sampleDetail.value.dynamicData.map((item) => item.data)[0]
  )
  // data[0].fields[0].data = data[0].fields[0].data.filter((item) => item.value !== '')
  // data[0].fields[0].data = sampleDetail.value.data
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
    approvalUser: remainingPayload.approvalUser,
    equipmentId: remainingPayload.equipmentId,
    processInstanceId: props.processInstanceId,
    data: data,
    sheetsData: JSON.stringify({ sheetConfigs: sheetsData }),
    fillAttachment: JSON.stringify([sampleFillData.value.fillAttachment.data])
  }

  // const loading = ElLoading.service({
  //   fullscreen: true,
  //   text: '提交中...',
  //   target: '#fill-view'
  // })

  try {
    const data = await SampleTaskApi.updateSampleInfoDataFill(payload)
    // submitFillDataRef.value.close?.()
    const task = await TaskApi.getTaskListByProcessInstanceId(props.processInstanceId)
    await checkMine(task[0].taskDefinitionKey)
    const { equipmentId, approvalUser } = clone(remainingPayload) ?? {}
    if (approvalUser) {
      payload.approvalUser = approvalUser
    }
    console.log('sampleDetail', sampleDetail.value, uploadKey.value)

    // TAG: 提交审批
    console.log('🚀 ~ submitForApproval ~ data:', task[0])
    const approvalPayload = {
      userVariables: {
        [uploadKey.value]: [approvalUser.userId]
      },
      id: task[0].id,
      reason: '填报完成'
    }

    await SampleTaskApi.fillProcessInstance(approvalPayload)
    // loading?.close?.()
    emit('success')
    // message.success('保存并提交成功')
  } finally {
    // loading?.close?.()
    // submitFillDataRef.value.close?.()
  }
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

const handleSubmitFillData = async (params) => {
  await fetchSampleFillData()
  console.log('🚀 ~ handleSubmitFillData ~ params:', params)
  window.luckysheet.exitEditMode()

  const { data, sheetsData } = buildFinallyData()
  const { sheetConfigs, sheetsDataSheetConfigs } = getFormInfoAndSheetDataObjFromRefSampleFillData()

  // const loading = ElLoading.service({
  //   fullscreen: true,
  //   text: '正在生成报告...',
  //   target: '#fill-view'
  // })
  submitFillDataParams.data = params
  needBuildReportToUpdate.value = true
  await handleSelectExcel(sheetConfigs, sheetsData, data)
  // submitFillDataRef.value.close?.()
}

//表格渲染
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
    console.log('🚀 ~ handleSelectExcel ~ _extendCellOrigins:', sheet)

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

                // const findInSampleDefaultValue = judgeIsTzBaseTable(tableName)
                //   ? sampleDetail.value?.[variableName]
                //   : null
                const findInSampleDefaultValue = sampleDetail.value?.[variableName]
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
    showLoading: false,
    hook: {
      cellEditBefore: cellEditBefore,
      cellUpdateBefore: cellUpdateBefore,
      imageInsertAfter: handleImageInsertAfter,
      workbookCreateAfter: workbookCreateAfter
    },
    uploadImageBase64MaxSize: 200,
    fillHandle: false
    // title: exportJson.info.name,
    // userInfo: exportJson.info.name.creator
  }

  if (canFill) {
    stashLuckySheetOption.value.allowEdit = true
  } else {
    stashLuckySheetOption.value.allowEdit = false
    stashLuckySheetOption.value.showtoolbar = true
  }
  stashLuckySheetOption.value.showLoading = false
  window.luckysheet?.destroy?.()
  window.luckysheet?.create?.({ ...stashLuckySheetOption.value, ...toolbarConfig })
}

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

const handleBuildReportAndFillData = async () => {
  const cb = () => {
    toggleRequireFillCellBgInfo(false)
    handleSave(true, submitFillDataParams.data)
  }
  toggleRequireFillCellBgInfo(true)
  buildPdfFileByExcel([], cb)
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

// 暴露方法给父组件
defineExpose({
  handleSubmitFillData,
  open
})
</script>

<style scoped>
::v-deep .luckysheet-loading-mask {
  display: none !important;
}
</style>
