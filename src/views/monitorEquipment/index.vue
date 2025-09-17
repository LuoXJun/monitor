<template>
  <div class="monitorEquipment">
    <div class="monitorEquipment-left">

      <baseTree v-model="treeData" title="项目工程树" :defaultProps="{ label: 'name' }" @on-node-click="onNodeClick" />
    </div>
    <div class="monitorEquipment-right">
      <!-- top -->
      <div>
        <baseForm
:layout="{
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
      </div>
      <!-- main -->
      <div>
        <baseTitle title="设备管理" />
        <baseTable
v-model="tableData" index :tableColumn="tableColumnConfig" :pageInfo="pageInfo" :options="{
          border: false,
          height: '550px'
        }">
          <template #status="{ scope }">
            <el-switch v-model="scope.row.status" />
          </template>
          <template #operation>
            <el-button link class="primaryText" @click="view">详情</el-button>
            <el-button link class="primaryText" @click="operation">有效性配置</el-button>
            <el-button link class="dangerText" @click="operation">异常性配置</el-button>
          </template>
        </baseTable>
        <basePagination v-model="pageInfo" background="rgb(63, 98, 151)" size="small" />
      </div>
    </div>
    <baseDialog v-model="baseDialogVisible" />
    <baseDrawer v-model="drawerVisible">
      <baseInfo />
      <detailItem title="物理意义" style="margin-bottom: 20px;">
        <div class="detail-item-content">
          <p>取值上限</p>
          <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
        </div>
        <div class="detail-item-content">
          <p>取值下限</p>
          <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
        </div>
      </detailItem>
      <detailItem title="量程限制" style="margin-bottom: 20px;">
        <div class="detail-item-content">
          <p>取值上限</p>
          <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
        </div>
        <div class="detail-item-content">
          <p>取值下限</p>
          <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
        </div>
        <div class="detail-item-content">
          <p>超载倍数</p>
          <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
        </div>
      </detailItem>
      <detailItem title="包络域" style="margin-bottom: 20px;">
        <div class="detail-item-content" style="flex: 1;">
          <p>自动获取历史数据</p>
          <div class="history-data">
            <div>
              <el-radio label="" value="date" />
              <el-date-picker v-model="input1" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
            </div>
            <div>
              <el-radio label="近" value="date" />
              <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
              <el-select v-model="input1" placeholder="Select" style="width: 240px">
                <el-option v-for="i in 20" :key="i" :label="i + '年'" :value="i" />
              </el-select>
            </div>
            <div>
              <el-button type="primary" plain>确认</el-button>
            </div>
          </div>
        </div>
        <div class="detail-item-content">
          <p>取值上限</p>
          <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
        </div>
        <div class="detail-item-content">
          <p>取值下限</p>
          <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
        </div>
        <div class="detail-item-content">
          <p>超载倍数</p>
          <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
        </div>
      </detailItem>

    </baseDrawer>
  </div>
</template>

<script setup lang="ts">
import baseTree from '@/components/baseTree/index.vue'
import baseForm from '@/components/base-form/baseForm.vue';
import baseTitle from '@/components/base-title/index.vue'
import baseTable from '@/components/base-table/base-table.vue';
import basePagination from '@/components/base-pagination/base-pagination.vue';
import baseDialog from '@/components/baseDialog/index.vue'
import baseDrawer from '@/components/baseDrawer/index.vue'
import baseInfo from './component/baseInfo.vue'
import detailItem from './component/detailItem.vue';
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { formConfig, tableColumnConfig } from './config'
import { getCategoryTreeApi, getCategoryPageApi, getDetailApi } from '@/api/monitor/monitorInstrument';

const input1 = ref()

const tableData = ref([])
const baseDialogVisible = ref(false)
const drawerVisible = ref(false)
const dialogFrom = ref({})
const pageInfo = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const treeData = ref([])

getCategoryTreeApi({ hasInstrument: false }).then((data) => {
  if (data) treeData.value = data
})

const view = () => {
  baseDialogVisible.value = true
}

const operation = () => {
  drawerVisible.value = true
}

const getPage = () => {
  getCategoryPageApi({ pageNum: pageInfo.value.pageNum, pageSize: pageInfo.value.pageSize }).then(data => {
    tableData.value = data
  })
}

const onNodeClick = (data) => {
  console.log(data);

  if (data.id) {
    getDetailApi({ id: data.id }).then((data) => {
      console.log(data);
    })
  }

}

onMounted(() => {
  getPage()
})
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

      .el-table {
        width: 99%;
      }

      .basePagination {
        height: 60px;
      }

    }

    >div {
      padding: 0 10px;
    }
  }

  .detail-item-content {
    flex: 33% 0 0;
    padding: 0 20px;
    box-sizing: border-box;
    margin-bottom: 30px;

    >p {
      margin-bottom: 5px;
    }

    .history-data {
      width: calc(100% + 28px);
      display: flex;
      align-items: center;

      >div {
        flex: 33%;
        display: flex;
        align-items: center;

        .el-button {
          background: transparent;
        }

        .el-input,
        .el-select {
          width: 150px !important;
        }

        .el-input {
          margin: 0 9px;
        }

        .el-radio {
          margin: 0;
        }

        .el-date-editor {
          flex: 333px 0 0;
        }
      }
    }


  }
}
</style>
