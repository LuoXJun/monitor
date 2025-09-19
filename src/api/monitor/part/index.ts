import request from '@/config/axios';

// 新增设备类别
export const addPartApi = async (data) => {
    return await request.postOriginal({
        url: `/dev/monitorPart/insert`,
        data
    });
};

// 删除设备类别
export const deletePartApi = async (params) => {
    return await request.postOriginal({
        url: `/dev/monitorPart/delete`,
        params
    });
};

// 更新设备类别名称
export const updatePartApi = async (data) => {
    return await request.postOriginal({
        url: `/dev/monitorPart/updateById`,
        data
    });
};
