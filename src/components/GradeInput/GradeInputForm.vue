<template>
  <div class="grade-input-form">
    <el-card class="form-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">成绩录入</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="resetForm"
            :disabled="loading"
          >
            重置
          </el-button>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        @submit.prevent="handleSubmit"
      >
        <!-- 学生选择 -->
        <el-form-item label="学生" prop="studentId">
          <el-select
            v-model="formData.studentId"
            placeholder="请选择学生"
            filterable
            clearable
            :loading="studentsLoading"
            :disabled="loading"
            style="width: 100%"
          >
            <el-option
              v-for="student in students"
              :key="student.rowId"
              :label="student.studentName"
              :value="student.rowId"
            >
              <div class="student-option">
                <span>{{ student.studentName }}</span>
                <span class="student-info">{{ student.studentId }} | {{ student.className }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 课程选择 -->
        <el-form-item label="课程" prop="courseId">
          <el-select
            v-model="formData.courseId"
            placeholder="请选择课程"
            filterable
            clearable
            :loading="coursesLoading"
            :disabled="loading"
            style="width: 100%"
          >
            <el-option
              v-for="course in courses"
              :key="course.rowId"
              :label="course.courseName"
              :value="course.rowId"
            >
              <div class="course-option">
                <span>{{ course.courseName }}</span>
                <span class="course-info">{{ course.courseCode }} | {{ course.teacherName }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 成绩输入 -->
        <el-form-item label="成绩" prop="score">
          <el-input-number
            v-model="formData.score"
            :min="0"
            :max="100"
            :precision="1"
            :step="0.5"
            placeholder="请输入成绩"
            :disabled="loading"
            style="width: 100%"
          />
          <div class="score-tip">成绩范围：0-100分，支持一位小数</div>
        </el-form-item>

        <!-- 考试日期 -->
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker
            v-model="formData.examDate"
            type="date"
            placeholder="请选择考试日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled="loading"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
            :maxlength="500"
            show-word-limit
            :disabled="loading"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
            :disabled="!canSubmit"
          >
            {{ loading ? '保存中...' : '保存成绩' }}
          </el-button>
          <el-button @click="resetForm" :disabled="loading">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { config, env } from 'mdye';
import { 
  getWorksheetData, 
  addWorksheetRow,
  buildQueryParams 
} from '../../utils/apiHelper.js';
import { 
  validateGradeRecord,
  validateScore 
} from '../../utils/validators.js';
import { 
  getWorksheetConfig,
  gradeValidationRules 
} from '../../config/worksheetConfig.js';

// 组件属性
const props = defineProps({
  // 学生工作表ID
  studentWorksheetId: {
    type: String,
    default: ''
  },
  // 课程工作表ID
  courseWorksheetId: {
    type: String,
    default: ''
  },
  // 成绩工作表ID
  gradeWorksheetId: {
    type: String,
    default: ''
  }
});

// 组件事件
const emit = defineEmits(['success', 'error']);

// 响应式数据
const formRef = ref(null);
const loading = ref(false);
const studentsLoading = ref(false);
const coursesLoading = ref(false);

// 表单数据
const formData = reactive({
  studentId: '',
  courseId: '',
  score: null,
  examDate: '',
  remark: ''
});

// 选项数据
const students = ref([]);
const courses = ref([]);

// 表单验证规则
const formRules = {
  studentId: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请输入成绩', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === null || value === '') {
          callback(new Error('请输入成绩'));
          return;
        }
        const result = validateScore(value, { min: 0, max: 100, allowDecimal: true });
        if (!result.valid) {
          callback(new Error(result.message));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  examDate: [
    { required: true, message: '请选择考试日期', trigger: 'change' }
  ]
};

// 计算属性
const canSubmit = computed(() => {
  return formData.studentId && 
         formData.courseId && 
         formData.score !== null && 
         formData.examDate;
});

// 禁用日期（未来日期）
const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

// 加载学生数据
const loadStudents = async () => {
  if (!props.studentWorksheetId) {
    console.warn('学生工作表ID未配置');
    return;
  }

  studentsLoading.value = true;
  try {
    const params = buildQueryParams({
      worksheetId: props.studentWorksheetId,
      viewId: '', // 使用默认视图
      pageSize: 1000,
      sort: [{ fieldId: 'studentName', isAsc: true }]
    });

    const result = await getWorksheetData(params);
    if (result.success) {
      students.value = result.data.map(item => ({
        rowId: item.rowId,
        studentName: item.studentName || '',
        studentId: item.studentId || '',
        className: item.className || ''
      }));
    } else {
      ElMessage.error('加载学生数据失败：' + result.error);
    }
  } catch (error) {
    console.error('加载学生数据失败:', error);
    ElMessage.error('加载学生数据失败');
  } finally {
    studentsLoading.value = false;
  }
};

// 加载课程数据
const loadCourses = async () => {
  if (!props.courseWorksheetId) {
    console.warn('课程工作表ID未配置');
    return;
  }

  coursesLoading.value = true;
  try {
    const params = buildQueryParams({
      worksheetId: props.courseWorksheetId,
      viewId: '', // 使用默认视图
      pageSize: 1000,
      sort: [{ fieldId: 'courseName', isAsc: true }]
    });

    const result = await getWorksheetData(params);
    if (result.success) {
      courses.value = result.data.map(item => ({
        rowId: item.rowId,
        courseName: item.courseName || '',
        courseCode: item.courseCode || '',
        teacherName: item.teacherName || ''
      }));
    } else {
      ElMessage.error('加载课程数据失败：' + result.error);
    }
  } catch (error) {
    console.error('加载课程数据失败:', error);
    ElMessage.error('加载课程数据失败');
  } finally {
    coursesLoading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    // 表单验证
    await formRef.value.validate();
    
    // 数据验证
    const record = {
      student: students.value.find(s => s.rowId === formData.studentId),
      course: courses.value.find(c => c.rowId === formData.courseId),
      score: formData.score,
      examDate: formData.examDate,
      remark: formData.remark
    };

    const validation = validateGradeRecord(record);
    if (!validation.valid) {
      ElMessage.error(validation.message);
      return;
    }

    // 确认提交
    await ElMessageBox.confirm(
      `确认保存学生"${record.student.studentName}"的"${record.course.courseName}"成绩吗？`,
      '确认保存',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    loading.value = true;

    // 构建保存数据
    const saveData = {
      studentId: formData.studentId,
      courseId: formData.courseId,
      score: formData.score,
      examDate: formData.examDate,
      remark: formData.remark || '',
      createTime: new Date().toISOString()
    };

    // 保存数据
    const result = await addWorksheetRow({
      worksheetId: props.gradeWorksheetId,
      row: saveData
    });

    if (result.success) {
      ElMessage.success('成绩保存成功');
      resetForm();
      emit('success', result.data);
    } else {
      ElMessage.error('成绩保存失败：' + result.error);
      emit('error', result.error);
    }

  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交失败:', error);
      ElMessage.error('提交失败：' + error.message);
      emit('error', error.message);
    }
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(formData, {
    studentId: '',
    courseId: '',
    score: null,
    examDate: '',
    remark: ''
  });
};

// 监听工作表ID变化
watch(() => [props.studentWorksheetId, props.courseWorksheetId], () => {
  loadStudents();
  loadCourses();
}, { immediate: true });

// 组件挂载
onMounted(() => {
  // 数据加载已经在watch中处理，这里不需要重复加载
});
</script>

<style scoped>
.grade-input-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.student-option,
.course-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-info,
.course-info {
  font-size: 12px;
  color: #909399;
}

.score-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number .el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input-number .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}
</style> 