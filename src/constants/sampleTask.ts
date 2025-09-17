/*
 * @Author: Lihongjian binj1219@163.com
 * @Date: 2024-12-23 15:17:14
 * @LastEditors: Lihongjian binj1219@163.com
 * @LastEditTime: 2024-12-25 11:09:30
 * @FilePath: \BD-ui\src\constants\sampleTask.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 类物类型字典
export const TASK_TYPE_MAP = [
  {
    name: '委托',
    value: '1'
  },
  {
    name: '自检',
    value: '2'
  }
]

export const FILL_TASK_PREFIX = 'fill_'

// excel填报的流程实例状态映射---业务状态
export const EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP = {
  '-1': {
    label: '待提交',
    type: 'primary'
  },
  0: {
    label: '试验中',
    type: 'text'
  },
  1: {
    label: '审批中',
    type: 'primary'
  },
  2: {
    label: '审批通过',
    type: 'success'
  },
  3: {
    label: '审批不通过',
    type: 'danger'
  },
  4: {
    label: '已取消',
    type: 'warning'
  }
}

// 代办任务、已办任务的状态映射---任务状态
export const TASK_STATUS_MAP = {
  filler: {
    1: {
      label: '试验中',
      type: 'primary'
    },
    2: {
      label: '试验完成',
      type: 'success'
    },
    3: {
      label: '审批不通过',
      type: 'danger'
    },
    4: {
      label: '已取消',
      type: 'warning'
    }
  },
  approver: {
    1: {
      label: '审批中',
      type: 'primary'
    },
    2: {
      label: '审批通过',
      type: 'success'
    },
    3: {
      label: '审批不通过',
      type: 'danger'
    },
    4: {
      label: '已取消',
      type: 'warning'
    }
  }
}
