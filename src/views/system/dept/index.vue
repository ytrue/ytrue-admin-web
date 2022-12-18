<template>
  <div class="app-container">
    <el-form :model="searchFrom" ref="searchFromRef" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="searchFrom.deptName" placeholder="请输入部门名称" clearable style="width: 200px"/>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="searchFrom.status" placeholder="请选择状态" clearable style="width: 200px">
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
            @click="addOrUpdateHandle()"
        >新增
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch"/>
    </el-row>

    <!-- 表格 start-->
    <el-table
        default-expand-all
        :data="data"
        ref="tableRef"
        v-loading="loading"
        row-key="id"
    >
      <el-table-column label="部门名称" prop="deptName"/>
      <el-table-column label="排序" align="center" prop="deptSort"/>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag text type="success" v-if="scope.row.status">正常</el-tag>
          <el-tag text type="info" v-if="!scope.row.status">禁用</el-tag>
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
    <!--新增和编辑弹窗-->
    <AddOrUpdate ref="addOrUpdateRef" @handleSubmit="init"/>
  </div>
</template>
<script>
import {defineComponent, onMounted, reactive, ref, toRefs} from "vue";
import * as  deptAi from "@/api/system/dept";
import AddOrUpdate from '@/views/system/dept/component/add-or-update.vue';
import {ElMessage, ElMessageBox} from "element-plus";
import {treeDataTranslate} from "@//utils/common";

export default defineComponent({
  name: "index",
  components: {
    AddOrUpdate
  },
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
      // 搜索数据·
      showSearch: true,
      searchFrom: {
        deptName: '',
        status: ''
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
          {column: 'status', condition: 'eq', value: state.searchFrom.status}
        ]
        // 请求获取数据
        deptAi.list({
          fields: fieldCondition,
        }).then((response) => {
          // 表格数据赋值
          // 删除掉hasChildren不然不显示
          state.data = treeDataTranslate(response.data)

        }).finally(() => {
          // 加载完毕
          state.loading = false
        })
      },

      // 删除数据
      deleteHandle: (id) => {
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
          deptAi.remove([id]).then((response) => {
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
