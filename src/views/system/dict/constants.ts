import { DictUseType } from '@/utils/constants'

export const DictUseTypeMap = {
  0: DictUseType.common,
  1: DictUseType.report
}

export const USE_TYPE_LIST = [
  { label: DictUseType.common.name, value: DictUseType.common.key },
  { label: DictUseType.report.name, value: DictUseType.report.key }
]
