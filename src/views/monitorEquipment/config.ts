export const formConfig: IformItem[] = [
  {
    filed: 'projectName',
    label: '仪器名称',
    type: 'input',
    placeholder: '请输入',
    useLayout: false,
    span: 5
  },
  {
    filed: 'createTime',
    label: '编码',
    type: 'input',
    labelWidth: '40px',
    placeholder: '请输入'
  }
]

const labels = [
  { label: '仪器名称', props: 'instrumentNo' },
  { label: '编码', props: 'specsNo' },
  { label: '安装位置', props: 'buryLocation' },
  { label: '启用', props: 'status' },
  { label: '操作', props: 'operation' }
]

export const tableColumnConfig = labels.map((item) => {
  const obj: ITableColumn = {
    filed: item.props,
    label: item.label,
    options: {
      sortable: true,
      align: 'center',
      showOverflowTooltip: true
    }
  }

  if (item.label === '操作') obj.options!.width = 240
  return obj
})
