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
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="dataForm.username" placeholder="请输入用户名称"/>
        </el-form-item>

        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="dataForm.nickName" placeholder="请输入昵称"/>
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="dataForm.phone" placeholder="请输入电话"/>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dataForm.email" placeholder="请输入邮箱"/>
        </el-form-item>

        <el-form-item label="部门" prop="deptId">
          <el-tree-select
              v-model="dataForm.deptId"
              clearable
              :data="deptTree"
              check-strictly
              value-key="id"
              placeholder="请选择部门"
              :render-after-expand="false"
              :props="{ value: 'id', label: 'name', children: 'children' }"
          />
        </el-form-item>

        <el-form-item label="岗位" prop="jobIds">
          <el-select v-model="dataForm.jobIds" clearable multiple placeholder="请选择岗位">
            <el-option
                v-for="item in jobList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
                :disabled="!item.enabled"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="dataForm.roleIds" clearable multiple placeholder="请选择角色">
            <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
                :disabled="!item.status"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="dataForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="状态" prop="enabled">
          <el-radio-group v-model="dataForm.enabled">
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
import * as  jobApi from "@/api/system/job";
import {ElMessage} from "element-plus";
import * as roleApi from "@//api/system/role";
import * as deptAi from "@//api/system/dept";
import * as userApi from "@//api/system/user";
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
        username: null,
        nickName: null,
        deptId: null,
        gender: 1,
        email: null,
        enabled: true,
        roleIds: [],
        jobIds: [],
        phone: null,
      },
      // 部门tree数据
      deptTree: [],
      // 角色数据
      roleList: [],
      // 岗位数据
      jobList: [],
      // 验证规则
      dataRule: {
        username: [{required: true, message: '请输入用户名称', trigger: 'blur'}],
        nickName: [{required: true, message: '请输入昵称', trigger: 'blur'}],
        deptId: [{required: true, message: '请选择部门', trigger: 'blur'}],
        jobIds: [{type: 'array', required: true, message: '请选择岗位', trigger: 'blur'}],
        roleIds: [{type: 'array', required: true, message: '请选择角色', trigger: 'blur'}],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {type: "email", message: "请输入正确的邮箱", trigger: ["blur", "change"]}
        ],
        phone: [
          {required: true, message: '请输入电话', trigger: 'blur'},
          {pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur"}
        ]
      }
    })

    // vue3+element-plus解决resetFields表单重置无效问题
    const backupData = JSON.parse(JSON.stringify(state.dataForm))

    // 方法集合
    const methods = {
      // 初始化数据
      init: async (id) => {
        // 初始化部门数据
        await deptAi.list({}).then((response) => {
          let data = response.data
          state.deptTree = treeDataTranslate(data)
        })

        // 初始化岗位数据
        await jobApi.list().then((response) => {
          state.jobList = response.data
        })
        // 初始化角色数据
        await roleApi.list().then((response) => {
          state.roleList = response.data
        })


        state.formId = id || 0
        if (!state.formId) {
          // 把弹窗打开
          state.isShowDialog = true
          return
        }
        // 调取ajax获取详情数据
        await userApi
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
            userApi
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
      },

      // 关闭弹窗
      onCancel: () => {
        // vue3+element-plus解决resetFields表单重置无效问题
        state.isShowDialog = false;
        // 这一步是防止（仅用下面这一步的话）点击增加在里面输入内容后关闭第二次点击增加再输入内容再关闭再点击增加会出现未初始化
        dataFormRef.value.resetFields()
        // 这一步是防止(仅用上面那一步)先点击编辑后再关闭弹窗再点击增加，显示的为数据2
        state.dataForm = backupData
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