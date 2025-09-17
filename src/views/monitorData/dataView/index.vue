<template>
  <div class="monitorEquipment">
    <div class="monitorEquipment-left">

      <baseTree v-model="treeData" title="项目工程树" :defaultProps="{ label: 'name' }" @on-node-click="onNodeClick" />
    </div>
    <div class="monitorEquipment-right">
      <!-- top -->
      <!-- <div>
        <baseForm :layout="{
          xl: 6,
          lg: 6,
          md: 6,
          sm: 12,
          xs: 24
        }" :formItemList="formConfig">
          <template #footer>
            <el-button class="confirmBtn">
              <el-icon>
                <Search />
              </el-icon>&nbsp;
              查询</el-button>
            <el-button class="cancelBtn">
              <el-icon>
                <RefreshRight />
              </el-icon>&nbsp;重置</el-button>
          </template>
</baseForm>
</div> -->
      <!-- main -->
      <div>
        <baseTitle v-if="currentData.currentTitle" :title="currentData.currentTitle" />
        <el-tabs v-model="activeName" class="demo-tabs">
          <el-tab-pane label="基本信息" name="baseInfo">
            <multInfo v-if="currentData.multiple" :data="currentData.eqData || []" :title="currentData.tableTitle" />
            <singleInfo v-else :data="currentData.eqData || {}" :title="currentData.tableTitle" />
          </el-tab-pane>
          <el-tab-pane label="数据内容" name="data">
            <tableList :id="currentData.eqId" :multiple="currentData.multiple" />
          </el-tab-pane>
          <el-tab-pane label="曲线图" name="map">Role</el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import baseTree from '@/components/baseTree/index.vue'
import baseTitle from '@/components/base-title/index.vue'
import multInfo from '@/views/monitorEquipment/sheets/multInfo.vue';
import singleInfo from '@/views/monitorEquipment/sheets/singleInfo.vue';
import tableList from '@/views/monitorEquipment/sheets/tableList.vue';
import { getCategoryTreeApi, getDetailApi } from '@/api/monitor/monitorInstrument';


const activeName = ref('baseInfo')

const currentData = reactive<Record<string, any>>({
  currentTitle: '',
  eqData: '',
  tableTitle: '',
  multiple: true,
  eqId: ''
})

const treeData = ref([])



getCategoryTreeApi({ hasInstrument: true }).then((data) => {
  if (data) treeData.value = data
})




const onNodeClick = async (data) => {

  if (data.children && data.children.length > 0) return
  currentData.currentTitle = data.name
  currentData.eqId = data.id

  if (data.id) {
    getDetailApi({ id: data.id }).then(async (data) => {
      currentData.multiple = data.multiple
      currentData.tableTitle = data.buryLocation
      if (currentData.multiple) {
        currentData.eqData = data.children || []
      } else {
        currentData.eqData = data || {}
      }
    })
  }

}

</script>

<style lang="scss">
.monitorEquipment {
  height: 740px;
  display: flex;

  &-left {
    width: 250px;
    background: #fff;

    .el-tree {
      max-height: 600px;
      overflow: auto;
    }
  }

  &-right {
    flex: 1;
    margin-left: 10px;

    >div:nth-child(1) {
      background: #fff;

      .el-form {
        height: 100%;
        line-height: 60px;

        .el-form-item {
          margin: 0;
        }
      }

      .el-row {
        align-items: center;
      }
    }

    >div:nth-child(2) {
      background: #fff;
      margin-top: 10px;
      height: calc(100% - 70px);
      overflow: auto;
    }

    >div {
      padding: 0 10px;
    }
  }
}
</style>
