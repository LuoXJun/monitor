/**
 * 针对 https://github.com/xaboy/form-create-designer 封装的工具类
 */

// 编码表单 Conf
export const encodeConf = (designerRef: object) => {
  // @ts-ignore
  return JSON.stringify(designerRef.value.getOption())
}

// 编码表单 Fields
export const encodeFields = (designerRef: object) => {
  // @ts-ignore
  const rule = designerRef.value.getRule()
  const fields: string[] = []
  rule.forEach((item) => {
    fields.push(JSON.stringify(item))
  })
  return fields
}

// 解码表单 Fields
export const decodeFields = (fields: string[]) => {
  const rule: object[] = []
  fields.forEach((item) => {
    rule.push(JSON.parse(item))
  })
  return rule
}

// 设置表单的 Conf 和 Fields，适用 FcDesigner 场景
export const setConfAndFields = (designerRef: object, conf: string, fields: string) => {
  // @ts-ignore
  designerRef.value.setOption(JSON.parse(conf))
  // @ts-ignore
  designerRef.value.setRule(decodeFields(fields))
}

// 设置表单的 Conf 和 Fields，适用 form-create 场景
export const setConfAndFields2 = (
  detailPreview: object,
  conf: string,
  fields: string[],
  value?: object
) => {
  if (isRef(detailPreview)) {
    detailPreview = detailPreview.value
  }
  // @ts-ignore
  detailPreview.option = JSON.parse(conf)
  // @ts-ignore
  detailPreview.rule = decodeFields(fields)
  if (value) {
    // @ts-ignore
    detailPreview.value = value
  }
}

/**
 * 把流程表单中没有附件的标题“附件” 改成 “无附件”
 * @param {string[]} formFields
 * @param {object} formVariables
 * @returns {string[]}
 */
export const replaceFormFieldsLabelWithValue = (formFields = [], formVariables = {}) => {
  const newFormFields: any[] = []
  formFields.forEach((item) => {
    let newItem
    let newObj
    try {
      newObj = JSON.parse(item)
    } catch (error) {
      newItem = item
    }

    if (newItem) {
      newFormFields.push(newItem)
      return
    }

    if (newObj.type === 'UploadFile') {
      const fileList = formVariables?.[newObj.field] ?? []
      if (!fileList.length) {
        newObj.title = '无附件'
      }

      newItem = JSON.stringify(newObj)
      newFormFields.push(newItem)
    } else {
      newFormFields.push(item)
    }
  })

  return newFormFields
}
