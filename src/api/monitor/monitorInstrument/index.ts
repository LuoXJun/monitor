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

// 通过设备id获取设备数据
export const getDetailApi = async (params) => {
    return await request.get({
        url: `/dev/monitorInstrument/getById`,
        params
    });
};
