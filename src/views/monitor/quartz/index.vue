<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="24" :xs="24">
        <el-form :model="searchFrom" ref="searchFromRef" :inline="true" v-show="showSearch" label-width="75px">

          <el-form-item label="bean名称" prop="beanName">
            <el-input v-model="searchFrom.beanName" placeholder="请输入bean名称" clearable style="width: 200px"/>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select v-model="searchFrom.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="禁用" :value="1"/>
              <el-option label="启用" :value="0"/>
            </el-select>
          </el-form-item>

          <el-form-item label="创建时间" style="width: 308px" prop="createTime">
            <el-date-picker
                v-model="searchFrom.createTime"
                value-format="YYYY-MM-DD"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>


          <el-form-item>
            <el-button type="primary" icon="Search" @click="init">搜索</el-button>
            <el-button icon="Refresh" @click="reset">重置</el-button>
          </el-form-item>
        </el-form>


        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:schedule:add']"
                icon="Plus"
                type="primary"
                @click="addOrUpdateHandle()"
            >新增
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:schedule:delete']"
                icon="Delete"
                type="danger"
                :disabled="!selectIds.length"
                @click="deleteHandle()">
              删除
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:schedule:pause']"
                icon="VideoPlay"
                type="info"
                :disabled="!selectIds.length"
                @click="pauseHandle()">
              暂停
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:schedule:resume']"
                icon="VideoPause"
                type="success"
                :disabled="!selectIds.length"
                @click="resumeHandle()">
              恢复
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:schedule:run']"
                icon="Position"
                type="warning"
                :disabled="!selectIds.length"
                @click="runTaskHandle()">
              执行
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:scheduleLog:page']"
                icon="Memo"
                color="#626aef"
                @click="scheduleLogHandle">
              日志列表
            </el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @queryTable="init"/>
        </el-row>

        <!-- 表格 start-->
        <el-table
            :data="data"
            ref="tableRef"
            row-key="id"
            v-loading="loading"
            style="width: 100%"
            @selection-change="selectionChangeHandle"
        >
          <el-table-column type="selection" width="55"/>
          <el-table-column label="ID" align="center" prop="id"/>
          <el-table-column label="bean名称" align="center" prop="beanName"/>
          <el-table-column label="方法名称" align="center" prop="methodName"/>
          <el-table-column label="参数" align="center" prop="params"/>
          <el-table-column label="cron表达式" align="center" prop="cronExpression"/>
          <el-table-column label="备注" align="center" prop="remark"/>
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <el-tag text type="success" v-if="scope.row.status ===0">启用</el-tag>
              <el-tag text type="info" v-if="scope.row.status ===1">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime"/>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button
                  size="small"
                  link
                  icon="Edit"
                  type="primary"
                  @click="addOrUpdateHandle(scope.row.id)"
                  v-hasPermi="['system:schedule:update']">修改
              </el-button>
              <el-button
                  size="small"
                  link
                  type="primary"
                  @click="deleteHandle(scope.row.id)"
                  icon="Delete"
                  v-hasPermi="['system:schedule:delete']">删除
              </el-button>

              <el-button
                  size="small"
                  link
                  type="primary"
                  @click="pauseHandle(scope.row.id)"
                  icon="Delete"
                  v-hasPermi="['system:schedule:pause']">暂停
              </el-button>

              <el-button
                  size="small"
                  link
                  type="primary"
                  @click="resumeHandle(scope.row.id)"
                  icon="Delete"
                  v-hasPermi="['system:schedule:resume']">恢复
              </el-button>

              <el-button
                  size="small"
                  link
                  type="primary"
                  @click="runTaskHandle(scope.row.id)"
                  icon="Delete"
                  v-hasPermi="['system:schedule:run']">执行
              </el-button>

            </template>
          </el-table-column>
        </el-table>
        <!-- 表格 end-->
        <!--分页 start-->
        <pagination
            v-show="pagination.total > 0"
            :total="pagination.total"
            v-model:page="pagination.pageNum"
            v-model:limit="pagination.pageSize"
            @pagination="init"
        />
      </el-col>
    </el-row>
    <!--分页 end-->
    <!--新增和编辑弹窗-->
    <AddOrUpdate ref="addOrUpdateRef" @handleSubmit="init"/>
    <ScheduleLog ref="scheduleLogRef"/>
  </div>
</template>
<script setup name="index">
import {onMounted, reactive, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import * as  quartzApi from "@/api/monitor/quartz";
import Pagination from '@/components/Pagination/index.vue'
import AddOrUpdate from '@/views/monitor/quartz/component/add-or-update.vue';
import ScheduleLog  from '@/views/monitor/quartz/component/scheduleLog.vue';

// 弹窗的ref
const addOrUpdateRef = ref()
// 定时日志red
const scheduleLogRef = ref()
// 搜索的ref
const searchFromRef = ref()
// 表格的
const tableRef = ref()
// 是否加载
const loading = ref(false);
// 选中数据
const selectIds = ref([]);
// 是否显示搜索框
const showSearch = ref(true);
// 列表数据
const data = ref([]);
// 搜索表单数据
const searchFrom = reactive({
  beanName: null,
  status: null,
  createTime: []
})
// 分页数据
const pagination = reactive({
  total: 0,
  pageNum: 1,
  pageSize: 10,
})

/**
 * 初始化表格数据---这里是调用ajax的
 */
function init() {
  // 加载中
  loading.value = true

  searchFrom.page = pagination.pageNum
  searchFrom.limit = pagination.pageSize
  // 请求获取数据
  quartzApi.page(searchFrom).then((response) => {
    // 表格数据赋值
    data.value = response.data.records
    // 分页赋值
    pagination.total = response.data.total
    pagination.pageNum = response.data.current
    pagination.pageSize = response.data.size
  }).finally(() => {
    // 加载完毕
    loading.value = false
  })
}

/**
 * 删除数据
 * @param id
 */
function deleteHandle(id) {
  const deleteIds = id === undefined ? selectIds.value : [id]
  // 校验是否有删除数据
  if (deleteIds.length === 0) {
    ElMessage({type: 'info', message: '请选择需要删除的数据'})
    return
  }
  ElMessageBox.confirm(
      '您确定要删除记录吗',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    // 删除
    quartzApi.remove(deleteIds).then((response) => {
      ElMessage({type: 'success', message: response.message})
      init()
    })
  })
}

/**
 * 暂停任务
 * @param id
 */
function pauseHandle(id) {
  const ids = id === undefined ? selectIds.value : [id]
  if (ids.length === 0) {
    ElMessage({type: 'info', message: '请选择需要暂停的任务'})
    return
  }
  ElMessageBox.confirm(
      '您确定要暂停任务吗',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    quartzApi.pause(ids).then((response) => {
      ElMessage({type: 'success', message: response.message})
      init()
    })
  }).catch(() => {
  })
}

/**
 * 恢复任务
 * @param id
 */
function resumeHandle(id) {
  const ids = id === undefined ? selectIds.value : [id]
  if (ids.length === 0) {
    ElMessage({type: 'info', message: '请选择需要恢复的任务'})
    return
  }
  ElMessageBox.confirm(
      '您确定要恢复任务吗',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    quartzApi.resume(ids).then((response) => {
      ElMessage({type: 'success', message: response.message})
      init()
    })
  }).catch(() => {
  })
}

/**
 * 执行任务
 * @param id
 */
function runTaskHandle(id) {
  const ids = id === undefined ? selectIds.value : [id]
  if (ids.length === 0) {
    ElMessage({type: 'info', message: '请选择需要执行的任务'})
    return
  }
  ElMessageBox.confirm(
      '您确定要执行任务吗',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    quartzApi.runTask(ids).then((response) => {
      ElMessage({type: 'success', message: response.message})
      init()
    })
  }).catch(() => {
  })
}

/**
 * 重置表单数据
 */
function reset() {
  searchFromRef.value?.resetFields()
  init()
}

/**
 * 打开新增和编辑的弹窗
 * @param id
 */
function addOrUpdateHandle(id) {
  addOrUpdateRef.value.init(id);
}

/**
 * 打开定时任务日志弹窗
 * @param id
 */
function scheduleLogHandle(id) {
  scheduleLogRef.value.init(id);
}

/**
 * 复选框变化时
 * @param val
 */
function selectionChangeHandle(val) {
  // 清空之前的
  selectIds.value = []
  val.forEach((item) => {
    selectIds.value.push(item.id)
  })
}

/**
 * 页面加载时
 */
onMounted(() => {
  init();
})
</script>