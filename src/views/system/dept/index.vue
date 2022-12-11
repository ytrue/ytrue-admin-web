<template>
  <div class="app-container">
    <el-form :model="searchFrom" ref="queryRef" :inline="true" v-show="showSearch">

      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="searchFrom.deptName" placeholder="请输入部门名称" clearable style="width: 200px"/>
      </el-form-item>

      <el-form-item label="状态" prop="enabled">
        <el-select v-model="searchFrom.enabled" placeholder="部门状态" clearable style="width: 200px">
          <el-option label="正常" :value="true"/>
          <el-option label="禁用" :value="false"/>

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
            v-hasPermi="['system:dept:add']"
            icon="Plus"
            type="primary"
        >新增
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch"/>
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
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="排序" align="center" prop="deptSort"/>
      <el-table-column label="状态" align="center" prop="enabled">
        <template #default="scope">
          <el-tag text type="success" v-if="scope.row.enabled">正常</el-tag>
          <el-tag text type="info" v-if="!scope.row.enabled">禁用</el-tag>
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
              v-hasPermi="['system:dept:edit']">修改
          </el-button>
          <el-button
              size="small"
              link
              type="primary"
              @click="deleteHandle(scope.row.id)"
              icon="Delete"
              v-hasPermi="['system:dept:delete']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格 end-->

    <!--分页 start-->
    <el-pagination
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
        class="mt15"
        :pager-count="5"
        :page-sizes="[10, 50, 100]"
        v-model:current-page="pagination.pageNum"
        background
        v-model:page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
    >
    </el-pagination>
    <!--分页 end-->

  </div>
</template>
<script>
import {defineComponent, onMounted, reactive, ref, toRefs} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import * as  deptAi from "@/api/system/dept";

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
      // 分页数据
      pagination: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
      },
      // 选中数据
      selectIds: [],
      // 搜索数据·
      showSearch: true,
      searchFrom: {
        deptName: '',
        enabled: ''
      }
    })

    // 方法集合
    const methods = {
      // 初始化表格数据---这里是调用ajax的
      init: () => {
        // 加载中
        state.loading = true

        // 过滤条件
        let fieldCondition = [
          {column: 'deptName', condition: 'like', value: state.searchFrom.deptName},
          {column: 'enabled', condition: 'eq', value: state.searchFrom.enabled}
        ]

        // 请求获取数据
        deptAi.page({
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
          deptAi.remove(deleteIds).then((response) => {
            ElMessage({type: 'success', message: response.message})
            methods.init()
          })
        }).catch(() => {
        })
      },

      // 重置表单数据
      reset: () => {
        // searchFromRef.value?.resetFields()
        methods.init()
      },

      // 打开新增和编辑的弹窗
      addOrUpdateHandle: (id) => {
        // addOrUpdateRef.value.init(id);
      },

      // 复选框变化时
      selectionChangeHandle: (val) => {
        // 清空之前的
        state.selectIds = []
        val.forEach((item) => {
          state.selectIds.push(item.id)
        })
      },
      // 分页改变
      sizeChangeHandle: (val) => {
        state.pagination.pageSize = val;
        methods.init();
      },
      // 分页改变
      currentChangeHandle: (val) => {
        state.pagination.pageNum = val;
        methods.init();
      }
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