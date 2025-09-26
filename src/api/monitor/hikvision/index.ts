import request from '@/config/axios';
// 获取区域列表树形结构
export const getRegionsTreeApi = async (params) => {
    return await request.get({
        url: '/dev/hikvision/regions',
        params
    });
};

// 根据区域编码分页获取监控点列表
export const getCamerasPage2RegionApi = async (params, regionIndexCode) => {
    return await request.get({
        url: `/dev/hikvision/region/cameras/${regionIndexCode}`,
        params
    });
};

// 分页获取监控点列表
export const getCamerasPageApi = async (params) => {
    return await request.get({
        url: '/dev/hikvision/cameras',
        params
    });
};

// 获取播放视频地址
export const getVideoUrlApi = async (cameraIndexCode, network) => {
    return await request.get({
        url: `/dev/hikvision/cameras/previewUrls/${cameraIndexCode}/${network}`
    });
};

// 获取录像回放地址
export const getPlaybackUrlsApi = async (params) => {
    return await request.get({
        url: `/dev/hikvision/cameras/playbackUrls`,
        params
    });
};
