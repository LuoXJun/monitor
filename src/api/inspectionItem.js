import request from '@/config/axios'
// 获取材料树形
export const getMaterialTree = (query) => {
  return request.get({
    url: '/materialCategory/listTree',
    params: query
  })
}

// 新增材料
export const createMaterial = (data) => {
  return request.post({
    url: '/materialCategory/create',
    data
  })
}

//编辑材料
export const updateMaterial = (data) => {
  return request.put({
    url: '/materialCategory/update',
    data
  })
}

//删除材料
export const deleteMaterial = (id) => {
  return request.delete({
    url: '/materialCategory/delete?id=' + id
  })
}

// 获取材料详情
export const getMaterialDetail = (id) => {
  return request.get({
    url: '/materialCategory/get?id=' + id
  })
}

//获取检验项目分页
export const getExamineProjectPage = (query) => {
  return request.get({
    url: '/examineProject/page',
    params: query
  })
}

//新增检验项目
export const createExamineProject = (data) => {
  return request.post({
    url: '/examineProject/create',
    data
  })
}
// 编辑检验项目
export const updateExamineProject = (data) => {
  return request.put({
    url: '/examineProject/update',
    data
  })
}

//删除检验项目
export const deleteExamineProject = (id) => {
  return request.delete({
    url: '/examineProject/delete?id=' + id
  })
}

// 获取检验项目详情
export const getExamineProjectDetail = (id) => {
  return request.get({
    url: '/examineProject/get?id=' + id
  })
}

/**
 * 获取检验项目列表-不分页
 * @param {*} query businessType: 不传查全部，1-试验指标 2-物探指标
 * @returns
 */
export const getExamineProjectSimpleList = (query) => {
  return request.get({
    url: '/examineProject/simple-list',
    params: query
  })
}

/**
 * 获取检验项目列表-不分页
 * @param {*} query
 * @returns
 */
export const getExamineProjectList = (query) => {
  return request.get({
    url: '/examineProject/list',
    params: query
  })
}

/**
 * 获取物探项目列表-不分页
 * @param {*} query
 * @returns
 */
export const getExamineProjectWtList = (query) => {
  return request.get({
    url: '/examineProject/wtList',
    params: query
  })
}

/**
 * @description 检测指标表单-保存、更新
 * @param {*} data
 * @returns
 */
export const saveOrUpdateExamineProjectForm = (data) => {
  return request.post({
    url: '/examineProjectForm/saveOrUpdate',
    data
  })
}

/**
 * @description 检测指标表单-获取
 * @param {*} data
 * @returns
 */
export const getExamineProjectForm = (query) => {
  return request.get({
    url: '/examineProjectForm/get',
    params: query
  })
}
/**
 * @description 检测指标表单-发布
 * @param {*} data
 * @returns
 */
export const publishExamineProjectForm = (data) => {
  return request.post({
    url: '/examineProjectForm/publish',
    data
  })
}

/**
 * 获取检验项目表单发布历史
 * @param {*} query
 * @returns
 */
export const getExamineProjectFormReleaseHistory = (query) => {
  return request.get({
    url: '/examineProjectForm/page',
    params: query
  })
}

export const getExamineProjectFormReleaseHistoryDetail = (query) => {
  return request.get({
    url: '/examineProjectForm/getHisForm',
    params: query
  })
}

//获取检验项目分页
export const getExamineProjectWtPage = (query) => {
  return request.get({
    url: '/examineProject/wtPage',
    params: query
  })
}

// 查询材料树
export const getMaterialTreeList = (query) => {
  return request.get({
    url: '/materialCategory/tree',
    params: query
  })
}

// 获取属性配置字段列表
export const getPropertyList = () => {
  return request.get({
    url: '/examineProperty/getPropertyList'
  })
}

// 获得指标的属性配置
export const getExamineProperty = (query) => {
  return request.get({
    url: '/examineProperty/get',
    params: query
  })
}

// 创建指标的属性配置
export const createExamineProperty = (data) => {
  return request.post({
    url: '/examineProperty/create',
    data
  })
}

/**
 * 查询检测指标关联的基础表和业务表
 * @param {*} query
 * @returns
 */
export const getExamineTable = (query) => {
  return request.get({
    url: '/examineProject/getExamineTable',
    params: query
  })
}

/**
 * 添加检测指标关联业务表
 * @param {*} data
 * @returns
 */
export const addExamineTable = (data) => {
  return request.post({
    url: '/examineProject/addExamineTable',
    data
  })
}

/**
 * 删除检测指标关联业务表
 * @param {*} data
 * @returns
 */
export const delExamineTable = (data) => {
  return request.delete({
    url: '/examineProject/delExamineTable',
    data
  })
}
