<template>
  <div class="center-right">
    <div class="title">设备检定提醒</div>
    <div class="center-device">
      <img class="img" src="../../assets/imgs/myUpdate/device.svg" alt="" />
      <div class="device-num">
        <div class="desc">设备检定到期提醒总数</div>
        <div class="num">
          {{ formatNum(statData.timeoutQuantity) }}
          <span class="unit">台</span>
        </div>
       
      </div>
      <div class="look" @click="handleLinkToDeviceList">查看</div>
    </div>
    <div class="item-box">
      <div class="item">
        <div class="date">近7天</div>
        <div class="txt"><img src="../../assets/imgs/myUpdate/device7.svg"/>设备检定提醒数量</div>
        <div class="num color1">
          {{ formatNum(statData.current7dayQuantity) }}
          <span class="unit">台</span>
        </div>
       
      </div>
      <div class="line"></div>
      <div class="item">
        <div class="date date1">近1个月</div>
        <div class="txt"><img src="../../assets/imgs/myUpdate/device30.svg"/>设备检定提醒数量</div>
        <div class="num color2">
          {{ formatNum(statData.current1MonthQuantity) }}
          <span class="unit">台</span>
        </div>
       
      </div>
      <div class="line"></div>
      <div class="item">
        <div class="date date2">近6个月</div>
        <div class="txt"><img src="../../assets/imgs/myUpdate/device180.svg"/>设备检定提醒数量</div>
        <div class="num color3">
          {{ formatNum(statData.current6MonthQuantity) }}
          <span class="unit">台</span>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getEquipmentCheckStat } from '@/api/home'
import { DEVICE_NOTICE_TYPE } from '@/constants/index'
import { useEmitt } from '@/hooks/web/useEmitt'

const router = useRouter() // 路由

const statData = ref({})

const handleLinkToDeviceList = () => {
  sessionStorage.setItem(DEVICE_NOTICE_TYPE, 1)
  router.push({
    path: '/deviceManage'
  })
}

const formatNum = (num) => num ?? 0

const fetchEquipmentCheckStat = async () => {
  statData.value = await getEquipmentCheckStat()
}

const handleAddEvent = () => {
  fetchEquipmentCheckStat()
}

const { emitter } = useEmitt({ name: 'task:refresh', callback: handleAddEvent })

onMounted(() => {
  fetchEquipmentCheckStat()
})
</script>

<style lang="scss" scoped>
.center-right {
  width: 45%;
  height: 414px;
  background: #fff;
  // padding: 22px 28px 0;

  border-radius: 4px;


  .title {
    font-family: 'HarmonyOS Sans SC';
    font-size: 16px;
    color: #191B1C;
    font-weight: 700;
    height: 32px;
    background: url('../../assets/imgs/myUpdate/titleReg.svg') no-repeat 0% center;
    padding-left: 10px;
    line-height: 32px;
    margin-left: 10px;
    margin-top: 10px;
  }

  .center-device {
   
    background-color: #fff;
    display: flex;
    height: 105px;
    padding: 0px 21.35px;
    margin: 50px 20px 0px 20px;
    align-items: flex-start;
    //justify-content: space-between;
    

    .img {
      width: 91.41px;
      height: 93.13px;
    }

    .device-num {
      margin-left: 28px;
      .num {
        font-family: 'HarmonyOS Sans SC';
        font-size: 40px;
        font-weight: bold;
        line-height: 40px;
        color: rgb(46, 71, 204) ;

        .unit {
          font-family: 'HarmonyOS Sans SC';
          font-size: 20px;
          font-weight: normal;
          line-height: 20px;
          letter-spacing: 0;
          font-feature-settings: 'kern' on;
          color: #909399;
        }
      }

      .desc {
        margin-bottom: 10px;
        font-family: 'HarmonyOS Sans SC';
        font-size: 24px;
        font-weight: 600;
        white-space: nowrap;
        /* 正文色/正文辅助色 */
        color: rgb(17, 30, 86)
      }
    }

    .look {
      width: 60px;
      height: 31px;
      font-family: 'Source Han Sans';
      font-size: 14px;
      font-weight: 400;
      line-height: 31px;
      color: rgb(2, 102, 240);
      text-align: center;
      cursor: pointer;
      border: 1px solid rgb(2, 102, 240);
      border-radius: 4px;
      box-sizing: border-box;
      margin-left: 29px;
      margin-top: 4px;
    }
  }

  .item-box {
    margin: 0px 20px 0px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    // padding-bottom: 37px;
    padding: 20px 21.35px 0px 21.35px;
    .item {
      //border: 1px solid red;
      width: 200px;
      height: 124px;
      padding: 16px 0 0 13px;
      background: #fff;
      border-radius: 4px;
      opacity: 1;
      box-sizing: border-box;
      text-align: left;
      //margin: 0px 5px ;
      .date {
        //width: 52px;
        //height: 28px;
        margin-bottom: 8px;
        font-family: 'Source Han Sans';
        font-size: 20px;
        font-weight: 600;
        line-height: 20px;
        color: rgb(17, 30, 86);
        //position: relative;
        //left: 23%
      }

      .date1 {
        color: rgb(17, 30, 86);
      }

      .date2 {
        color: rgb(17, 30, 86);
      }
      .color1{
        color:rgb(46, 71, 204);
      }
      .color2{
        color:rgb(46, 71, 204);
      }
      .color3{
        color:rgb(46, 71, 204);
      }
      .num {
        margin-bottom: 10px;
        font-family: 'HarmonyOS Sans SC';
        font-size: 30px;
        font-weight: bold;
        //margin-top: 17px;
        margin-left: 35px;
        /* 外部/Font/text-regular */
         

        .unit {
          font-family: 'HarmonyOS Sans SC';
          font-size: 16px;
          font-weight: normal;
          color: #909399;
        }
      }

      .txt {
        font-family: 'HarmonyOS Sans SC';
        font-size: 16px;
        color: rgb(17, 30, 86);
        margin-top: 20px;
      }
      .txt img{
        vertical-align: top;
        margin-right: 8px;
      }
    }
  }

  .line{
    height: 100px;
    width: 1px;
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: 20px;
    margin-right: 10px;
  }
}

</style>
