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
        <el-form-item prop="beanName">
          <template #label>
                        <span>
                           <el-tooltip content="spring bean名称, 如: testTask" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           bean名称
                        </span>
          </template>
          <el-input v-model="dataForm.beanName" placeholder="请输入bean名称"/>
        </el-form-item>

        <el-form-item label="方法名称" prop="methodName">
          <el-input v-model="dataForm.methodName" placeholder="请输入方法名称"/>
        </el-form-item>

        <el-form-item label="参数" prop="params">
          <el-input v-model="dataForm.params" placeholder="请输入参数"/>
        </el-form-item>

        <el-form-item label="cron表达式" prop="cronExpression">
          <template #label>
                        <span>
                           <el-tooltip content="如: 0 0 12 * * ?" placement="top">
                              <el-icon><question-filled/></el-icon>
                           </el-tooltip>
                           cron表达式
                        </span>
          </template>
          <el-input v-model="dataForm.cronExpression" placeholder="请输入cron表达式"/>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="dataForm.remark" placeholder="请输备注"/>
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

<script setup name="AddOrUpdate">
import {ref} from 'vue';
import * as  quartzApi from "@/api/monitor/quartz";
import {ElMessage} from "element-plus";

const emit = defineEmits(['handleSubmit'])

// 表单的ref
const dataFormRef = ref(null)

// 表单id
const formId = ref(0)
// 是否弹窗
const isShowDialog = ref(false)
// 表单数据
const dataForm = ref({
  beanName: null,
  params: null,
  methodName: null,
  remark: null,
  cronExpression: null,
})
// 验证规则
const dataRule = {
  beanName: [{required: true, message: '请输入bean名称', trigger: 'blur'}],
  methodName: [{required: true, message: '请输入方法名称', trigger: 'blur'}],
  cronExpression: [{required: true, message: '请输入cron表达式', trigger: 'blur'}],
}
// vue3+element-plus解决resetFields表单重置无效问题
const backupData = JSON.parse(JSON.stringify(dataForm.value))


/**
 * 初始化数据
 * @param id
 */
function init(id) {
  formId.value = id || 0
  if (!formId.value) {
    // 把弹窗打开
    isShowDialog.value = true
    return
  }
  // 调取ajax获取详情数据
  quartzApi
      .detail(formId.value)
      .then((response) => {
        // 进行赋值
        dataForm.value = response.data
        // 把弹窗打开
        isShowDialog.value = true
      })

}

/**
 * 提交表单
 */
function onSubmit() {
  dataFormRef.value.validate((valid) => {
    if (valid) {
      // 下面就是调用ajax
      quartzApi
          .saveAndUpdate(dataForm.value)
          .then((response) => {
            ElMessage({type: 'success', message: response.message})
            // 通知父端组件提交完成了
            emit('handleSubmit')
            onCancel()
          })
    } else {
      return false
    }
  })
}

/**
 * 关闭弹窗
 */
function onCancel() {
  // vue3+element-plus解决resetFields表单重置无效问题
  isShowDialog.value = false;
  // 这一步是防止（仅用下面这一步的话）点击增加在里面输入内容后关闭第二次点击增加再输入内容再关闭再点击增加会出现未初始化
  dataFormRef.value.resetFields()
  // 这一步是防止(仅用上面那一步)先点击编辑后再关闭弹窗再点击增加，显示的为数据2
  dataForm.value = backupData
}

// 主动暴露childMethod方法
defineExpose({init})
</script>

