import { FILL_TASK_PREFIX, TASK_STATUS_MAP } from '@/constants/sampleTask'

/**
 * 判断是否是填报任务
 * @param {string} taskDefinitionKey
 * @returns {boolean}
 */
export const judgeIsFillTask = (taskDefinitionKey = '') => {
  return (taskDefinitionKey ?? '').startsWith(FILL_TASK_PREFIX)
}

export const getTaskStatus = (taskDefKey = '', taskStatus = '') => {
  const isFillTask = judgeIsFillTask(taskDefKey)

  return TASK_STATUS_MAP[isFillTask ? 'filler' : 'approver'][taskStatus]
}

export const getWtTaskStatus = (taskDefKey = '', taskStatus = '') => {
  const isFillTask = judgeIsFillTask(taskDefKey)

  return TASK_STATUS_MAP.approver[taskStatus]
}
