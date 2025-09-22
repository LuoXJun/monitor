import request from '@/config/axios';
// 获取单点设备分页数据
export const getSinglePageApi = async (params, data) => {
    return await request.postOriginal({
        url: '/dev/instrumentData/pageList',
        params,
        data
    });
};

// 获取多点设备分页数据
export const getMultiPageApi = async (params, data) => {
    return await request.postOriginal({
        url: '/dev/instrumentData/multiPageList',
        params,
        data
    });
};

// 新增数据
export const addBatchApi = async (data) => {
    return await request.postOriginal({
        url: `/dev/instrumentData/batchAdd`,
        data
    });
};

// 新增数据
export const updateBatchApi = async (data) => {
    return await request.postOriginal({
        url: `/dev/instrumentData/batchUpdate`,
        data
    });
};

// 获取多点数据--无分页
export const getMultiListApi = async (data) => {
    return await request.post({
        url: `/dev/instrumentData/multiList`,
        data
    });
};

// 获取单点数据--无分页
export const getSingleListApi = async (data) => {
    return await request.post({
        url: `/dev/instrumentData/list`,
        data
    });
};
// 获取特征值统计数据
export const getEigenvalueDataListApi = async (data) => {
    return await request.post({
        url: `/dev/instrumentData/getEigenvalueDataList`,
        data
    });
};

// 获取数据统计
export const getReportDataApi = async (data) => {
    return await request.post({
        url: `/dev/instrumentData/getReportDataList`,
        data
    });
};
