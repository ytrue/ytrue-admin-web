<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="24" :xs="24">
        <el-form :model="searchFrom" ref="searchFromRef" :inline="true" v-show="showSearch" label-width="75px">

          <el-form-item label="bean名称" prop="name">
            <el-input v-model="searchFrom.name" placeholder="请输入bean名称" clearable style="width: 200px"/>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select v-model="searchFrom.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="禁用" :value="1"/>
              <el-option label="启用" :value="0"/>
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
                v-hasPermi="['system:job:add']"
                icon="Plus"
                type="primary"
                @click="addOrUpdateHandle()"
            >新增
            </el-button>
          </el-col>

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
                icon="VideoPlay"
                type="info"
                :disabled="!selectIds.length"
                @click="pauseHandle()">
              暂停
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:job:delete']"
                icon="VideoPause"
                type="success"
                :disabled="!selectIds.length"
                @click="resumeHandle()">
              恢复
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:job:delete']"
                icon="Position"
                type="warning"
                :disabled="!selectIds.length"
                @click="runTaskHandle()">
              执行
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
                v-hasPermi="['system:job:delete']"
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
                  v-hasPermi="['system:job:edit']">修改
              </el-button>
              <el-button
                  size="small"
                  link
                  type="primary"
                  @click="deleteHandle(scope.row.id)"
                  icon="Delete"
                  v-hasPermi="['system:job:delete']">删除
              </el-button>

              <el-button
                  size="small"
                  link
                  type="primary"
                  @click="pauseHandle(scope.row.id)"
                  icon="Delete"
                  v-hasPermi="['system:job:delete']">暂停
              </el-button>

              <el-button
                  size="small"
                  link
                  type="primary"
                  @click="resumeHandle(scope.row.id)"
                  icon="Delete"
                  v-hasPermi="['system:job:delete']">恢复
              </el-button>

              <el-button
                  size="small"
                  link
                  type="primary"
                  @click="runTaskHandle(scope.row.id)"
                  icon="Delete"
                  v-hasPermi="['system:job:delete']">执行
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
<script>
import {defineComponent, onMounted, reactive, ref, toRefs} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import AddOrUpdate from '@/views/monitor/quartz/component/add-or-update.vue';
import ScheduleLog from '@/views/monitor/quartz/component/scheduleLog';
import * as  quartzApi from "@/api/monitor/quartz";

export default defineComponent({
  name: "index",
  components: {
    AddOrUpdate,
    ScheduleLog
  },
  setup() {
    // 弹窗的ref
    const addOrUpdateRef = ref()
    // 定时日志red
    const scheduleLogRef = ref()
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
        name: '',
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
        // 加载中
        state.loading = true

        // 过滤条件
        let fieldCondition = [
          {column: 'name', condition: 'like', value: state.searchFrom.name},
          {column: 'status', condition: 'eq', value: state.searchFrom.status}
        ]

        // 请求获取数据
        quartzApi.page({
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
          quartzApi.remove(deleteIds).then((response) => {
            ElMessage({type: 'success', message: response.message})
            methods.init()
          })
        }).catch(() => {
        })
      },

      // 暂停任务
      pauseHandle: (id) => {
        const ids = id === undefined ? state.selectIds : [id]
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
            methods.init()
          })
        }).catch(() => {
        })
      },

      // 恢复任务
      resumeHandle: (id) => {
        const ids = id === undefined ? state.selectIds : [id]
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
            methods.init()
          })
        }).catch(() => {
        })
      },

      // 执行任务
      runTaskHandle: (id) => {
        const ids = id === undefined ? state.selectIds : [id]
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

      // 打开新增和编辑的弹窗
      addOrUpdateHandle: (id) => {
        addOrUpdateRef.value.init(id);
      },
      // 打开定时任务日志弹窗
      scheduleLogHandle: (id) => {
        scheduleLogRef.value.init(id);
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
      scheduleLogRef,
      searchFromRef,
      tableRef,

      ...methods,
      ...toRefs(state)
    }
  }
})
</script>