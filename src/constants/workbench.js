import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import { formatDate, dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import { clone } from 'ramda'

export const DEPT_MAP = {
  jc: {
    name: '试验检验中心',
    deptId: 115,
    flwTag: DEPARTMENT_BUSINESS_MAP.jc.key,
    key: 'jc',
    query: {
      businessType: DEPARTMENT_BUSINESS_MAP.jc.key
    },
    logo: {
      show: true,
      logoUrl: 'syzx.png'
    },
    statMap: {
      totalCount: {
        name: '总检测次数'
      },
      doingCount: {
        name: '正在检验次数'
      },
      cancelCount: {
        name: '取消次数'
      }
    },
    task: {
      showNoData: false,
      todo: {
        columns: [
          {
            key: 'examineProjectName',
            name: '检测项目',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'TaskDetail',
                detailModalRefName: 'jcDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'sampleName',
            name: '样品名称'
          },
          {
            key: 'taskName',
            name: '任务名称'
          },
          {
            key: 'taskStatus',
            name: '任务状态',
            template: {
              show: true,
              type: 'dict'
            },
            nameFormatter: null
          },
          {
            key: 'taskCreateTime',
            name: '任务创建时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'toDoTask'
      },
      done: {
        columns: [
          {
            key: 'examineProjectName',
            name: '检测项目',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'TaskDetail',
                detailModalRefName: 'jcDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'sampleName',
            name: '样品名称'
          },
          {
            key: 'taskName',
            name: '任务名称'
          },
          {
            key: 'taskStatus',
            name: '任务状态',
            template: {
              show: true,
              type: 'dict'
            },
            nameFormatter: null
          },
          {
            key: 'taskEndTime',
            name: '任务结束时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'completedTask'
      },
      send: {
        columns: [
          {
            key: 'examineProjectName',
            name: '检测项目',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'TaskDetail',
                detailModalRefName: 'jcDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'sampleName',
            name: '样品名称'
          },
          {
            key: 'examinerName',
            name: '试验人'
          },
          {
            key: 'businessStatus',
            name: '业务状态',
            template: {
              show: true,
              type: 'b_dict'
            },
            nameFormatter: null
          },
          {
            key: 'startTime',
            name: '发起时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'taskDistribution'
      }
    },
    taskCount: {
      show: true,
      style: {},
      series: {
        name: '总检测任务数'
      }
    },
    taskDist: {
      show: true
    }
  },
  cl: {
    name: '测量中心',
    deptId: 116,
    flwTag: DEPARTMENT_BUSINESS_MAP.cl.key,
    key: 'cl',
    query: {
      businessType: DEPARTMENT_BUSINESS_MAP.cl.key
    },
    logo: {
      show: true,
      logoUrl: 'clzx.png'
    },
    statMap: {
      totalCount: {
        name: '测量文件归档数'
      },
      doingCount: {
        name: '正在归档数'
      },
      cancelCount: {
        name: '取消次数'
      }
    },
    task: {
      showNoData: true,
      todo: {
        columns: [
          {
            key: 'projectName',
            name: '工程名称',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'ClTaskDetail',
                detailModalRefName: 'clDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'taskStatus',
            name: '任务状态',
            template: {
              show: true,
              type: 'dict'
            },
            nameFormatter: null
          },
          {
            key: 'taskCreateTime',
            name: '任务创建时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'toDoTask'
      },
      done: {
        columns: [
          {
            key: 'projectName',
            name: '工程名称',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'ClTaskDetail',
                detailModalRefName: 'clDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'taskStatus',
            name: '任务状态',
            template: {
              show: true,
              type: 'dict'
            },
            nameFormatter: null
          },
          {
            key: 'taskEndTime',
            name: '任务结束时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'completedTask'
      },
      send: {
        columns: [
          {
            key: 'projectName',
            name: '工程名称',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'ClTaskDetail',
                detailModalRefName: 'clDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'businessStatus',
            name: '业务状态',
            template: {
              show: true,
              type: 'b_dict'
            },
            nameFormatter: null
          },
          {
            key: 'startTime',
            name: '发起时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'taskDistribution'
      }
    },
    taskCount: {
      show: true,
      style: { width: '100%' },
      series: {
        name: '总测量文件归档任务数'
      }
    },
    taskDist: {
      show: false
    }
  },
  wt: {
    name: '物探中心',
    deptId: 117,
    flwTag: DEPARTMENT_BUSINESS_MAP.wt.key,
    key: 'wt',
    query: {
      businessType: DEPARTMENT_BUSINESS_MAP.wt.key
    },
    logo: {
      show: true,
      logoUrl: 'wtzx.png'
    },
    statMap: {
      totalCount: {
        name: '总物探次数'
      },
      doingCount: {
        name: '正在物探次数'
      },
      cancelCount: {
        name: '取消次数'
      }
    },
    task: {
      showNoData: true,
      todo: {
        columns: [
          {
            key: 'projectName',
            name: '工程名称'
          },
          {
            key: 'examineProjectName',
            name: '物探指标',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'WtTaskDetail',
                detailModalRefName: 'wtDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'materialName',
            name: '材料名称'
          },
          {
            key: 'taskName',
            name: '任务名称'
          },
          {
            key: 'taskStatus',
            name: '任务状态',
            template: {
              show: true,
              type: 'dict'
            },
            nameFormatter: null
          },
          {
            key: 'taskCreateTime',
            name: '任务创建时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'toDoTask'
      },
      done: {
        columns: [
          {
            key: 'projectName',
            name: '工程名称'
          },
          {
            key: 'examineProjectName',
            name: '物探指标',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'WtTaskDetail',
                detailModalRefName: 'wtDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'materialName',
            name: '材料名称'
          },
          {
            key: 'taskName',
            name: '任务名称'
          },
          {
            key: 'taskStatus',
            name: '任务状态',
            template: {
              show: true,
              type: 'dict'
            },
            nameFormatter: null
          },
          {
            key: 'taskEndTime',
            name: '任务结束时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'completedTask'
      },
      send: {
        columns: [
          {
            key: 'projectName',
            name: '工程名称'
          },
          {
            key: 'examineProjectName',
            name: '物探指标',
            template: {
              show: true,
              type: 'link',
              method: {
                name: 'handleToDetail',
                CpName: 'WtTaskDetail',
                detailModalRefName: 'wtDetailRef'
              }
            },
            nameFormatter: null
          },
          {
            key: 'materialName',
            name: '材料名称'
          },
          // {
          //   key: 'taskName',
          //   name: '任务名称'
          // },
          {
            key: 'businessStatus',
            name: '业务状态',
            template: {
              show: true,
              type: 'b_dict'
            },
            nameFormatter: null
          },
          {
            key: 'startTime',
            name: '发起时间',
            formatter: dateFormatter
          }
        ],
        linkToCpName: 'taskDistribution'
      }
    },
    taskCount: {
      show: true,
      style: { width: '100%' },
      series: {
        name: '总物探任务数'
      }
    },
    taskDist: {
      show: false
    }
  }
}

export const superAdminConfig = {
  name: '管理员',
  role: 'super_admin',
  key: 'super_admin',
  showTabs: true,
  logo: {
    show: false
  }
}

export const noPermissionConfig = {
  showNoPermission: true
}

/**
 * 判断是否是管理员
 * 管理员可以是超级管理员super_admin，也可以是项目管理员。
 * @param {*} roles
 * @returns
 */
export const judgeIsAdmin = (roles = [], flwTags) => {
  // @ts-ignore
  return roles?.includes?.(superAdminConfig.role) || flwTags === null || flwTags?.length === 0
}

export const getConfigKeyByFlwTags = (roles = [], flwTags = []) => {
  const isAdmin = judgeIsAdmin(roles, flwTags)

  if (isAdmin) {
    return DEPT_MAP.jc.key
  }

  for (const key in DEPT_MAP) {
    if (flwTags?.includes?.(DEPT_MAP?.[key]?.flwTag)) {
      return DEPT_MAP[key].key
    }
  }
}

export const getDashboardConfigByKey = (key) => {
  return clone(DEPT_MAP[key] || noPermissionConfig)
}
