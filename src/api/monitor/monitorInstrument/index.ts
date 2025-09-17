import request from '@/config/axios';

// 获取设备树形结构数据
export const getCategoryTreeApi = async (params) => {
    return await request.get({
        url: `/dev/monitorInstrument/getCategoryTree`,
        params
    });
};

// 获取设备分页数据
export const getCategoryPageApi = async (params, data) => {
    return await request.postOriginal({
        url: '/dev/monitorInstrument/pageList',
        params,
        data
    });
};

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

// 通过设备id获取设备数据
export const getDetailApi = async (params) => {
    return await request.get({
        url: `/dev/monitorInstrument/getById`,
        params
    });
};

// 新增数据
export const addBatchApi = async (data) => {
    return await request.postOriginal({
        url: `/dev/instrumentData/batchAdd`,
        data
    });
};
