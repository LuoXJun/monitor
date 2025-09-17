<template>
  <div class="top-page">
    <!-- <div  v-if="!isAdmin && dashboardConfig?.logo?.show" class="centerBlock"> -->
      <!-- 将管理员权限判断移除 -->
    <div  v-if="dashboardConfig?.logo?.show" class="centerBlock">
      <div class="logo-warp"  v-if="dashboardConfig?.logo?.logoUrl === 'clzx.png'">
        <!-- <img
          src="../../assets/imgs/home/clzx1.png"
          alt=""
        /> -->
        <div>测量中心</div>
      </div>
      <div class="logo-warp"  v-if="dashboardConfig?.logo?.logoUrl === 'syzx.png'">
        <!-- <img
          src="../../assets/imgs/home/syzx1.png"
          alt=""
        /> -->
        <div>试验中心</div>
      </div>
      <div class="logo-warp"  v-if="dashboardConfig?.logo?.logoUrl === 'wtzx.png'">
        <!-- <img
          src="../../assets/imgs/home/wtzx1.png"
          alt=""
        /> -->
        <div>物探中心</div>
      </div>
    </div>
    <div class="item-warp">
      <div class="item">
      <!-- <img class="img" src="../../assets/imgs/icon1.png" alt="" /> -->
      <img class="img" src="../../assets/imgs/myUpdate/zjcIcon.svg" alt="" />
      <div class="right-box">
        <!-- 总检测次数 -->
        <div class="txt">{{ dashboardConfig?.statMap?.totalCount?.name }}</div>
        <div class="num">
          <span>{{ formatNum(statData.totalCount) }}</span>
          <span class="num-unit"> 个</span>
        </div>
      </div>
    </div>
    <div class="item">
      <!-- <img class="img" src="../../assets/imgs/icon2.png" alt="" /> -->
      <img class="img" src="../../assets/imgs/myUpdate/tgicon.svg" alt="" />
      <div class="right-box">
        <div class="txt">通过次数</div>
        <div class="num">
          <span>{{ formatNum(statData.passCount) }}</span>
          <span class="num-unit"> 个</span>
        </div>
      </div>
    </div>
    <div class="item">
      <!-- <img class="img" src="../../assets/imgs/icon3.png" alt="" /> -->
      <img class="img" src="../../assets/imgs/myUpdate/wtgicon.svg" alt="" />
      <div class="right-box">
        <div class="txt">未通过次数</div>
        <div class="num">
          <span>{{ formatNum(statData.noPassCount) }} </span>
          <span class="num-unit"> 个</span>
        </div>
      </div>
    </div>
    <div class="item">
      <!-- <img class="img" src="../../assets/imgs/icon4.png" alt="" /> -->
      <img class="img" src="../../assets/imgs/myUpdate/qxIcon.svg" alt="" />
      <div class="right-box">
        <!-- 正在检验次数 -->
        <div class="txt">
          {{ dashboardConfig?.statMap?.cancelCount?.name }}
        </div>
        <div class="num">
          <span>{{ formatNum(statData.cancelCount) }}</span>
          <span class="num-unit"> 个</span>
          
        </div>
       </div>
     </div>
    </div>

  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getTaskState } from '@/api/home'
import { useWorkbench } from '@/hooks/web/useWorkbench'
import { useEmitt } from '@/hooks/web/useEmitt'

const props = defineProps({
  dashboardConfig: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const { isAdmin } = useWorkbench()

const statData = ref({})

const formatNum = (num) => num ?? 0

const fetchTaskState = async () => {
  statData.value = await getTaskState({ ...props.dashboardConfig?.query })
}

const handleAddEvent = () => {
  fetchTaskState()
}

const { emitter } = useEmitt({ name: 'task:refresh', callback: handleAddEvent })

watch(
  () => props.dashboardConfig,
  (val) => {
    fetchTaskState()
  },
  { deep: true }
)

onMounted(() => {
  fetchTaskState()
})
</script>

<style lang="scss" scoped>
.top-page {
  .logo-warp{
    //padding-left: 37px;
    display: flex;
    font-size: 16px;
    color: rgb(45, 77, 126);
    font-weight: 700;
    //margin-top:35px;
    margin-bottom: 10px;
    // img{
    //   width: 10px;
    //   height: 10px;
    //   margin-right: 10px;
    // }
  }
  .centerBlock{
    display: flex;

  }
   .item-warp{
    display: flex;
    width: 100%;
    height: 110px;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    border-radius: 4px;
    padding: 0 10px;
  
   }
  .item {
    display: flex;
    align-items: center;
    width: 24%;
    height: 93px;
    border-radius: 4px;
    padding:  0 32px;
    .img {
      // width: 54px;
      height: 34px;
    }

    .right-box {
      
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      height: 100%;
      width: 100%;
      padding: 0 10px;
      //margin-left: 140px;
      //display: flex;
      //align-items: center;
      //justify-content: center;
      //flex: 1;
      //flex-direction: column;
      .txt{
        font-size: 14px;
        font-weight: 600;
        line-height: -1px;
        letter-spacing: 0px;
        text-align: left;
        font-family: 'Source Han Sans';
        font-style: oblique;
      }
      .num span:nth-child(1){   
          // font-family: 'DINAlternate-Bold';
          color: rgb(46, 71, 204);
          font-size: 24px;
          font-weight: 600;
          line-height: -1px;
          letter-spacing: 0px;
          text-align: right;
          margin-left: 20px;
          font-style: oblique;
      }
      .num span:nth-child(2){
            color: rgb(46, 71, 204);
            font-size: 16px;
            font-weight: 500;
            line-height: -1px;
            letter-spacing: 0px;
            text-align: right;
      }
      
    }

    .line {
      width: 1px;
      height: 60px;
      margin-left: 100px;
      background-color: #f2f3f5;
    }
  }
// .item:nth-child(1) {
//     background-image: linear-gradient(90deg, #2559EC 0%, #0897FF 100%);
// }

// .item:nth-child(2) {
//   background-image: linear-gradient(90deg, #04E1DE 0%, #05D9D6 100%);
// }

// .item:nth-child(3) {
//   background-image: linear-gradient(90deg, #FF9F00 0%, #FFC201 100%);
// }

// .item:nth-child(4) {
//   background-image: linear-gradient(90deg, #7F1BF6 0%, #AE30F4 100%);
// }
//修改样式
   .item:nth-child(1),.item:nth-child(3){
      background: url('../../assets/imgs/myUpdate/cardBg01.svg') no-repeat;
      background-size:cover;
   }
   .item:nth-child(2),.item:nth-child(4){
      background: url('../../assets/imgs/myUpdate/cardBg02.svg') no-repeat;
      background-size:cover;
   }
   .item:nth-child(1) .txt,.item:nth-child(3) .txt{
    color: rgb(17, 30, 86);
    //background-color: red;
   }
   .item:nth-child(2) .txt,.item:nth-child(4) .txt{
    color: rgb(44, 69, 53)
   }
   .item:nth-child(2) .num span:nth-child(1),.item:nth-child(4) .num span:nth-child(1){
    color: rgb(44, 69, 53)
   }
   .item:nth-child(2) .num span:nth-child(2),.item:nth-child(4) .num span:nth-child(2){
    color: rgb(44, 69, 53)
   }
   
}
</style>
