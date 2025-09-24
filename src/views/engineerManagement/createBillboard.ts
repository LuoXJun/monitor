import { getImg } from '@/utils/getAssets';
import * as Cesium from 'cesium';

export const createBillboard = (viewer: Cesium.Viewer) => {
    const text = '测试文字';
    const height = 100;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = text.length * 14;
    canvas.height = height;
    canvas.style.background = 'red';

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
        icon.src = getImg('weiyiji.png');
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

            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(112, 29, 0),
                billboard: {
                    image: canvas
                }
            });

            viewer.camera.flyToBoundingSphere(
                Cesium.BoundingSphere.fromPoints([Cesium.Cartesian3.fromDegrees(112, 29, 0)])
            );
        };
    };
};
