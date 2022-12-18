<template>
  <div>
    <el-dialog
        draggable
        title="日志列表"
        v-model="isShowDialog"
        width="75%">

      <div>
        <el-row :gutter="10">
          <el-col :span="24" :xs="24">
            <el-form :model="searchFrom" ref="searchFromRef" :inline="true" v-show="showSearch" label-width="75px">

              <el-form-item label="任务ID" prop="name">
                <el-input v-model="searchFrom.name" placeholder="请输入任务ID" clearable style="width: 200px"/>
              </el-form-item>


              <el-form-item label="状态" prop="status">
                <el-select v-model="searchFrom.status" placeholder="请选择状态" clearable style="width: 200px">
                  <el-option label="正常" :value="0"/>
                  <el-option label="失败" :value="1"/>
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" icon="Search" @click="init">搜索</el-button>
                <el-button icon="Refresh" @click="reset">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                    v-hasPermi="['system:job:delete']"
                    icon="Delete"
                    type="danger"
                    :disabled="!selectIds.length"
                    @click="deleteHandle()">
                  删除
                </el-button>
              </el-col>

              <el-col :span="1.5">
                <el-button
                    v-hasPermi="['system:job:delete']"
                    icon="MessageBox"
                    type="info"
                    @click="clearHandle">
                  清空
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
              <el-table-column label="任务ID" align="center" prop="jobId"/>
              <el-table-column label="bean名称" align="center" prop="beanName"/>
              <el-table-column label="方法名称" align="center" prop="methodName"/>
              <el-table-column label="参数" align="center" prop="params"/>
              <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                  <el-tag text type="success" v-if="scope.row.status ===0">正常</el-tag>
                  <el-tag text type="danger" v-if="scope.row.status ===1">失败</el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="times" label="消耗时间" align="center">
                <template #default="scope">
                  <el-tag v-if="scope.row.times <= 300">{{ scope.row.times }}ms</el-tag>
                  <el-tag v-else-if="scope.row.times <= 1000" type="warning">{{
                      scope.row.times
                    }}ms
                  </el-tag>
                  <el-tag v-else type="danger">{{ scope.row.times }}ms</el-tag>
                </template>
              </el-table-column>

              <el-table-column label="创建时间" align="center" prop="createTime"/>
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-button
                      size="small"
                      link
                      type="primary"
                      @click="deleteHandle(scope.row.id)"
                      icon="Delete"
                      v-hasPermi="['system:job:delete']">删除
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
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {defineComponent, reactive, ref, toRefs} from "vue";
import * as quartzApi from "@//api/monitor/quartz";
import {ElMessage, ElMessageBox} from "element-plus";

export default defineComponent({
  name: 'scheduleLog',

  setup: function (props, {emit}) {
    // 搜索的ref
    const searchFromRef = ref()
    // 表格的
    const tableRef = ref()
    // 数据集合
    const state = reactive({
      // 是否弹窗
      isShowDialog: false,
      // 列表数据
      data: [],
      // 加载
      loading: false,
      // 选中数据
      selectIds: [],
      // 是否显示搜索框
      showSearch: true,
      // 搜索表单数据
      searchFrom: {
        jobId: null,
        status: ''
      },
      // 分页数据
      pagination: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
      },
    })

    // 方法集合
    const methods = {
      // 初始化表格数据---这里是调用ajax的
      init: () => {
        state.isShowDialog = true
        // 加载中
        state.loading = true

        // 过滤条件
        let fieldCondition = [
          {column: 'jobId', condition: 'eq', value: state.searchFrom.jobId},
          {column: 'status', condition: 'eq', value: state.searchFrom.status}
        ]
        // 请求获取数据
        quartzApi.logPage({
          currentPage: state.pagination.pageNum,
          fields: fieldCondition,
          limit: state.pagination.pageSize,
          orderField: "id",
          asc: false
        }).then((response) => {
          // 表格数据赋值
          state.data = response.data.records
          // 分页赋值
          state.pagination.total = response.data.total
          state.pagination.pageNum = response.data.current
          state.pagination.pageSize = response.data.size
        }).finally(() => {
          // 加载完毕
          state.loading = false
        })
      },

      // 删除数据
      deleteHandle: (id) => {
        const deleteIds = id === undefined ? state.selectIds : [id]
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
          quartzApi.logRemove(deleteIds).then((response) => {
            ElMessage({type: 'success', message: response.message})
            methods.init()
          })
        }).catch(() => {
        })
      },

      // 清空操作
      clearHandle: () => {
        ElMessageBox.confirm(
            '您确定要清空记录吗',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
        ).then(() => {
          // 删除
          quartzApi.logClear().then((response) => {
            ElMessage({type: 'success', message: response.message})
            methods.init()
          })
        })
      },

      // 重置表单数据
      reset: () => {
        searchFromRef.value?.resetFields()
        methods.init()
      },

      // 复选框变化时
      selectionChangeHandle: (val) => {
        // 清空之前的
        state.selectIds = []
        val.forEach((item) => {
          state.selectIds.push(item.id)
        })
      },
    }

    return {
      searchFromRef,
      tableRef,

      ...methods,
      ...toRefs(state)
    }
  }

})
</script>

<style scoped>

</style>