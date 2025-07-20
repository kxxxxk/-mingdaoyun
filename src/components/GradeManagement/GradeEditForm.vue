<template>
  <div class="grade-edit-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="学生姓名" prop="studentName">
        <el-select
          v-model="formData.studentName"
          placeholder="请选择学生"
          filterable
          clearable
          :loading="studentLoading"
          style="width: 100%"
        >
          <el-option
            v-for="student in studentList"
            :key="student.rowId"
            :label="student.studentName"
            :value="student.studentName"
          >
            <span>{{ student.studentName }}</span>
            <span v-if="student.studentId" style="float: right; color: #8492a6; font-size: 13px">
              {{ student.studentId }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="课程名称" prop="courseName">
        <el-select
          v-model="formData.courseName"
          placeholder="请选择课程"
          filterable
          clearable
          :loading="courseLoading"
          style="width: 100%"
        >
          <el-option
            v-for="course in courseList"
            :key="course.rowId"
            :label="course.courseName"
            :value="course.courseName"
          >
            <span>{{ course.courseName }}</span>
            <span v-if="course.courseCode" style="float: right; color: #8492a6; font-size: 13px">
              {{ course.courseCode }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="成绩" prop="score">
        <el-input-number
          v-model="formData.score"
          :min="0"
          :max="100"
          :precision="1"
          :step="0.5"
          placeholder="请输入成绩"
          style="width: 100%"
        />
        <div class="form-tip">成绩范围：0-100分，支持一位小数</div>
      </el-form-item>

      <el-form-item label="考试日期" prop="examDate">
        <el-date-picker
          v-model="formData.examDate"
          type="date"
          placeholder="请选择考试日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            保存修改
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { updateWorksheetRow } from '../../utils/apiHelper.js';
import { validateScore, validateExamDate } from '../../utils/validators.js';

// 组件属性
const props = defineProps({
  // 成绩数据
  gradeData: {
    type: Object,
    required: true
  },
  // 学生列表
  studentList: {
    type: Array,
    default: () => []
  },
  // 课程列表
  courseList: {
    type: Array,
    default: () => []
  },
  // 成绩工作表ID
  gradeWorksheetId: {
    type: String,
    default: ''
  }
});

// 组件事件
const emit = defineEmits(['success', 'cancel']);

// 响应式数据
const formRef = ref(null);
const submitting = ref(false);
const studentLoading = ref(false);
const courseLoading = ref(false);

// 表单数据
const formData = reactive({
  studentName: '',
  courseName: '',
  score: null,
  examDate: '',
  remark: ''
});

// 表单验证规则
const formRules = {
  studentName: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  courseName: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请输入成绩', trigger: 'blur' },
    { validator: validateScore, trigger: 'blur' }
  ],
  examDate: [
    { required: true, message: '请选择考试日期', trigger: 'change' },
    { validator: validateExamDate, trigger: 'change' }
  ],
  remark: [
    { max: 500, message: '备注不能超过500个字符', trigger: 'blur' }
  ]
};

// 初始化表单数据
const initFormData = () => {
  if (props.gradeData) {
    formData.studentName = props.gradeData.studentName || '';
    formData.courseName = props.gradeData.courseName || '';
    formData.score = props.gradeData.score ? parseFloat(props.gradeData.score) : null;
    formData.examDate = props.gradeData.examDate || '';
    formData.remark = props.gradeData.remark || '';
  }
};

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    // 表单验证
    await formRef.value.validate();
    
    submitting.value = true;
    
    // 准备更新数据
    const updateData = {
      studentName: formData.studentName,
      courseName: formData.courseName,
      score: formData.score,
      examDate: formData.examDate,
      remark: formData.remark,
      updateTime: new Date().toISOString()
    };
    
    // 更新成绩记录
    const result = await updateWorksheetRow({
      worksheetId: props.gradeWorksheetId,
      rowId: props.gradeData.rowId,
      row: updateData
    });
    
    if (result.success) {
      ElMessage.success('成绩记录更新成功');
      emit('success', result.data);
    } else {
      ElMessage.error('更新失败: ' + result.error);
    }
    
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      console.error('提交失败:', error);
      ElMessage.error('提交失败: ' + error.message);
    }
  } finally {
    submitting.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  emit('cancel');
};

// 组件挂载
onMounted(() => {
  initFormData();
});
</script>

<style scoped>
.grade-edit-form {
  padding: 20px 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-date-picker) {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style> 