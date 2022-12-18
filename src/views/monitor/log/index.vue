<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="24" :xs="24">
        <!--label-position="left"-->
        <el-form
            :model="searchFrom"
            ref="searchFromRef"
            :inline="true"
            v-show="showSearch"
            label-width="68px">

          <el-form-item label="消耗时间" prop="consumingTime">
            <el-input v-model="searchFrom.consumingTime" placeholder="请输入消耗时间" clearable style="width: 200px"/>
          </el-form-item>

          <el-form-item label="操作人" prop="operator">
            <el-input v-model="searchFrom.operator" placeholder="请输入操作人" clearable style="width: 200px"/>
          </el-form-item>

          <el-form-item label="IP" prop="requestIp">
            <el-input v-model="searchFrom.requestIp" placeholder="请输入IP" clearable style="width: 200px"/>
          </el-form-item>

          <el-form-item label="URL" prop="requestUri">
            <el-input v-model="searchFrom.requestUri" placeholder="请输入URL" clearable style="width: 200px"/>
          </el-form-item>

          <el-form-item label="请求类型" prop="httpMethod">
            <el-select v-model="searchFrom.httpMethod" placeholder="请选择请求类型" clearable style="width: 200px">
              <el-option label="GET" value="GET"/>
              <el-option label="POST" value="POST"/>
              <el-option label="PUT" value="PUT"/>
              <el-option label="DELETE" value="DELETE"/>
              <el-option label="PATCH" value="PATCH"/>
              <el-option label="TRACE" value="TRACE"/>
              <el-option label="HEAD" value="HEAD"/>
              <el-option label="OPTIONS" value="OPTIONS"/>
            </el-select>
          </el-form-item>

          <el-form-item label="日志类型" prop="type">
            <el-select v-model="searchFrom.type" placeholder="请选择日志类型" clearable style="width: 200px">
              <el-option label="操作" value="OPT"/>
              <el-option label="异常" value="EX"/>
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
          <el-table-column align="center" type="expand">
            <template #default="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="浏览器">
                  <span>{{ props.row.browser }}</span>
                </el-form-item>
                <el-form-item label="请求参数">
                  <span>{{ props.row.params }}</span>
                </el-form-item>
                <el-form-item label="方法名">
                  <span>{{ props.row.actionMethod }}</span>
                </el-form-item>
                <el-form-item label="类路径">
                  <span>{{ props.row.classPath }}</span>
                </el-form-item>

                <el-form-item label="异常描述" v-if="props.row.type ==='EX'">
                  <span>{{ props.row.exDesc }}</span>
                </el-form-item>

                <el-form-item label="异常详情" v-if="props.row.type ==='EX'">
                  <span>{{ props.row.exDetail }}</span>
                </el-form-item>

              </el-form>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="55"/>
          <el-table-column label="操作人" align="center" prop="operator"/>
          <el-table-column label="IP" align="center" prop="requestIp"/>
          <el-table-column label="操作描述" align="center" prop="description"/>
          <el-table-column label="URL" align="center" prop="requestUri"/>
          <el-table-column label="请求类型" align="center" prop="httpMethod"/>
          <el-table-column label="日志类型" align="center" prop="type">
            <template #default="scope">
              <el-tag text type="success" v-if="scope.row.type ==='OPT'">操作</el-tag>
              <el-tag text type="danger" v-if="scope.row.type ==='EX'">异常</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="consumingTime" label="消耗时间" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.consumingTime <= 300">{{ scope.row.consumingTime }}ms</el-tag>
              <el-tag v-else-if="scope.row.consumingTime <= 1000" type="warning">{{
                  scope.row.consumingTime
                }}ms
              </el-tag>
              <el-tag v-else type="danger">{{ scope.row.consumingTime }}ms</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作时间" align="center" prop="startTime"/>
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
    <!--分页 end-->
  </div>
</template>
<script>
import {defineComponent, onMounted, reactive, ref, toRefs} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import * as  logApi from "@/api/monitor/log";

export default defineComponent({
  name: "index",
  setup() {
    // 弹窗的ref
    const addOrUpdateRef = ref()
    // 搜索的ref
    const searchFromRef = ref()
    // 表格的
    const tableRef = ref()

    // 数据集合
    const state = reactive({
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
        consumingTime: null,
        operator: null,
        requestIp: null,
        requestUri: null,
        httpMethod: null,
        type: null,
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
        // 加载中
        state.loading = true

        // 过滤条件
        let fieldCondition = [
          {column: 'operator', condition: 'like', value: state.searchFrom.operator},
          {column: 'httpMethod', condition: 'eq', value: state.searchFrom.httpMethod},
          {column: 'consumingTime', condition: 'eq', value: state.searchFrom.consumingTime},
          {column: 'requestIp', condition: 'eq', value: state.searchFrom.requestIp},
          {column: 'requestUri', condition: 'eq', value: state.searchFrom.requestUri},
          {column: 'type', condition: 'eq', value: state.searchFrom.type},
        ]

        // 请求获取数据
        logApi.page({
          currentPage: state.pagination.pageNum,
          fields: fieldCondition,
          limit: state.pagination.pageSize,
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
          logApi.clear().then((response) => {
            ElMessage({type: 'success', message: response.message})
            methods.init()
          })
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
          logApi.remove(deleteIds).then((response) => {
            ElMessage({type: 'success', message: response.message})
            methods.init()
          })
        }).catch(() => {
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

    /**
     * 页面加载时
     */
    onMounted(() => {
      methods.init();
    })

    return {
      addOrUpdateRef,
      searchFromRef,
      tableRef,

      ...methods,
      ...toRefs(state)
    }
  }
})
</script>

<style scoped>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 70px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}

.demo-table-expand .el-form-item__content {
  font-size: 12px;
}

</style>
