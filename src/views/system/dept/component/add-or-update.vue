<template>
  <div>
    <el-dialog
        @closed="onCancel"
        draggable
        :title="!formId ? '新增' : '修改'"
        v-model="isShowDialog"
        width="769px">

      <el-form
          :model="dataForm"
          :rules="dataRule"
          ref="dataFormRef"
          label-width="120px"
      >
        <el-form-item label="上级部门" prop="pid">
          <el-tree-select
              clearable
              v-model="dataForm.pid"
              :data="deptTree"
              check-strictly
              value-key="id"
              placeholder="选择上级部门"
              :render-after-expand="false"
              :props="{ value: 'id', label: 'deptName', children: 'children' }"
          />
        </el-form-item>

        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="dataForm.deptName" placeholder="请输入部门名称"/>
        </el-form-item>

        <el-form-item label="负责人" prop="leader">
          <el-input v-model="dataForm.leader" placeholder="请输入负责人"/>
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="dataForm.phone" placeholder="请输入联系电话"/>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dataForm.email" placeholder="请输入邮箱"/>
        </el-form-item>

        <el-form-item label="排序" prop="deptSort">
          <el-input-number v-model="dataForm.deptSort" controls-position="right" :min="0"/>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dataForm.status">
            <el-radio :label="true">正常</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">提 交</el-button>
				</span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {defineComponent, reactive, ref, toRefs} from 'vue';
import * as  deptApi from "@/api/system/dept";
import {ElMessage} from "element-plus";
import * as deptAi from "@//api/system/dept";
import {treeDataTranslate} from "@//utils/common";

export default defineComponent({
  name: 'AddOrUpdate',
  setup: function (props, {emit}) {
    // 表单的ref
    const dataFormRef = ref(null)
    // 初始化数据
    const state = reactive({
      // 表单id
      formId: 0,
      // 是否弹窗
      isShowDialog: false,
      // 表单数据
      dataForm: {
        pid: null,
        deptName: null,
        leader: null,
        phone: null,
        email: null,
        deptSort: 0,
        enabled: true,
      },
      // 部门tree数据
      deptTree: [],
      // 验证规则
      dataRule: {
        pid: [{required: true, message: "选择上级部门", trigger: "blur"}],
        deptName: [{required: true, message: "请输入部门名称", trigger: "blur"}],
        deptSort: [{required: true, message: "请输入排序值", trigger: "blur"}],
        email: [{type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"]}],
        phone: [{pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur"}]
      }
    })

    // 方法集合
    const methods = {
      // 初始化数据
      init: async (id) => {

        // 请求获取数据
        await deptAi.list({}).then((response) => {
          let data = response.data
          data.push({
            "id": 0,
            "pid": 0,
            "deptName": "顶级部门"
          })
          state.deptTree = treeDataTranslate(data)
        })

        state.formId = id || 0
        if (!state.formId) {
          // 把弹窗打开
          state.isShowDialog = true
          return
        }
        // 调取ajax获取详情数据
        await deptApi
            .detail(state.formId)
            .then((response) => {
              // 进行赋值
              state.dataForm = response.data
              // 把弹窗打开
              state.isShowDialog = true
            })
      },
      // 提交表单
      onSubmit: () => {
        dataFormRef.value.validate((valid) => {
          if (valid) {
            // 下面就是调用ajax
            deptApi
                .saveAndUpdate(state.dataForm)
                .then((response) => {
                  ElMessage({type: 'success', message: response.message})
                  // 通知父端组件提交完成了
                  emit('handleSubmit')
                  methods.onCancel()
                })
          } else {
            return false
          }
        })
      }
      ,

      // 关闭弹窗
      onCancel: () => {
        // vue3+element-plus解决resetFields表单重置无效问题
        state.isShowDialog = false;
        // 这一步是防止（仅用下面这一步的话）点击增加在里面输入内容后关闭第二次点击增加再输入内容再关闭再点击增加会出现未初始化
        dataFormRef.value.resetFields()
        // 这一步是防止(仅用上面那一步)先点击编辑后再关闭弹窗再点击增加，显示的为数据2,tree无法处理
        state.dataForm = {
          pid: null,
          deptName: null,
          leader: null,
          phone: null,
          email: null,
          deptSort: 0,
          enabled: true,
        }

      }
    }

    return {
      dataFormRef,
      ...toRefs(state),
      ...methods
    }
  }
})
</script>

<style scoped>

</style>