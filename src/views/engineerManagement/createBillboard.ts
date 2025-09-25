import { getImg } from '@/utils/getAssets';
import * as Cesium from 'cesium';

const imgs = [
    {
        label: '位移计',
        img: getImg('weiyiji.png')
    },
    {
        label: '测缝计',
        img: getImg('cefengji.png')
    },
    {
        label: '渗压计',
        img: getImg('shenyaji.png')
    },
    {
        label: '量水堰',
        img: getImg('liangshuiyan.png')
    },
    {
        label: '应力计',
        img: getImg('maoganyinliji.png')
    },
    {
        label: '钢筋计',
        img: getImg('gnagjinji.png')
    },
    {
        label: '钢板计',
        img: getImg('gangbanji.png')
    }
];

export const createBillboard = (viewer: Cesium.Viewer, data, points) => {
    const text = data.instrumentNo;
    const height = 100;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = text.length * 14;
    canvas.height = height;

    const bgImg = new Image();
    bgImg.src = getImg('boardBg.png');

    bgImg.onload = () => {
        //绘制文字
        ctx.textAlign = 'center';
        ctx.font = 'PingFang SC';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(text, canvas.width / 2, height / 2);

        const icon = new Image();

        imgs.forEach((v) => {
            if (data.instrumentType.name.includes(v.label)) {
                icon.src = v.img;
            }
        });

        if (!icon.src) icon.src = getImg('qita.png');

        icon.onload = () => {
            // 绘制图片23 32
            const imgWidth = 26;
            const imgheight = 36;
            ctx.drawImage(
                bgImg,
                canvas.width / 2 - imgWidth / 2,
                height - imgheight - 2,
                imgWidth,
                imgheight
            );

            // 中心icon
            const iconWidth = 18;
            const iconheight = 18;
            ctx.drawImage(
                icon,
                canvas.width / 2 - iconWidth / 2,
                height - imgheight + 2,
                iconWidth,
                iconheight
            );

            const entity = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(data.buryX, data.buryY, data.buryZ),
                billboard: {
                    image: canvas
                }
            });

            // @ts-ignore
            entity.userData = {
                id: data.id
            };

            points.push(entity);
        };
    };
};
