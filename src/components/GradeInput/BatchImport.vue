<template>
  <div class="batch-import">
    <el-card class="import-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>批量导入成绩</span>
          <div class="header-actions">
            <el-button 
              type="success" 
              size="small" 
              @click="downloadTemplate"
              :disabled="loading"
            >
              <el-icon><Download /></el-icon>
              下载模板
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="exportErrorData"
              :disabled="!hasErrorData"
            >
              <el-icon><Document /></el-icon>
              导出错误数据
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 文件上传区域 -->
      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          accept=".xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xlsx/xls 文件，且不超过 10MB
            </div>
          </template>
        </el-upload>
      </div>

      <!-- 文件信息显示 -->
      <div v-if="fileInfo" class="file-info">
        <el-alert
          :title="`文件: ${fileInfo.name}`"
          :description="`大小: ${formatFileSize(fileInfo.size)} | 行数: ${fileInfo.totalRows}`"
          type="info"
          show-icon
          closable
          @close="clearFile"
        />
      </div>

      <!-- 数据预览 -->
      <div v-if="previewData.length > 0" class="preview-section">
        <div class="section-title">
          <h4>数据预览 (前5行)</h4>
          <el-button 
            type="text" 
            size="small" 
            @click="showFullPreview = !showFullPreview"
          >
            {{ showFullPreview ? '收起' : '查看全部' }}
          </el-button>
        </div>
        
        <el-table 
          :data="showFullPreview ? previewData : previewData.slice(0, 5)" 
          border 
          size="small"
          max-height="300"
        >
          <el-table-column prop="rowNumber" label="行号" width="60" />
          <el-table-column prop="data.学生姓名" label="学生姓名" />
          <el-table-column prop="data.课程名称" label="课程名称" />
          <el-table-column prop="data.成绩" label="成绩" width="80" />
          <el-table-column prop="data.考试日期" label="考试日期" width="120" />
          <el-table-column prop="data.备注" label="备注" show-overflow-tooltip />
        </el-table>
      </div>

      <!-- 验证结果 -->
      <div v-if="validationResult" class="validation-section">
        <el-alert
          :title="validationResult.valid ? '数据验证通过' : '数据验证失败'"
          :type="validationResult.valid ? 'success' : 'error'"
          :description="`总计: ${validationResult.totalRows} 行 | 有效: ${validationResult.validRows} 行 | 错误: ${validationResult.invalidRows} 行`"
          show-icon
        />
        
        <!-- 错误详情 -->
        <div v-if="validationResult.invalidData.length > 0" class="error-details">
          <h4>错误详情</h4>
          <el-table 
            :data="validationResult.invalidData" 
            border 
            size="small"
            max-height="200"
          >
            <el-table-column prop="rowNumber" label="行号" width="60" />
            <el-table-column prop="data.学生姓名" label="学生姓名" />
            <el-table-column prop="data.课程名称" label="课程名称" />
            <el-table-column prop="data.成绩" label="成绩" width="80" />
            <el-table-column prop="data.考试日期" label="考试日期" width="120" />
            <el-table-column label="错误信息" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag 
                  v-for="error in row.errors" 
                  :key="error"
                  type="danger" 
                  size="small" 
                  style="margin: 2px"
                >
                  {{ error }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 导入进度 -->
      <div v-if="importProgress.show" class="progress-section">
        <div class="progress-header">
          <h4>导入进度</h4>
          <span>{{ importProgress.current }}/{{ importProgress.total }}</span>
        </div>
        <el-progress 
          :percentage="importProgress.percentage" 
          :status="importProgress.status"
          :stroke-width="8"
        />
        <div class="progress-info">
          <span>{{ importProgress.message }}</span>
          <span v-if="importProgress.successCount > 0" class="success-count">
            成功: {{ importProgress.successCount }}
          </span>
          <span v-if="importProgress.errorCount > 0" class="error-count">
            失败: {{ importProgress.errorCount }}
          </span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          @click="startImport"
          :loading="loading"
          :disabled="!canImport"
        >
          {{ loading ? '导入中...' : '开始导入' }}
        </el-button>
        <el-button @click="clearAll" :disabled="loading">
          清空
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  UploadFilled, 
  Download, 
  Document 
} from '@element-plus/icons-vue';
import { 
  parseExcelFile, 
  validateExcelData, 
  downloadExcelTemplate,
  exportDataToExcel,
  getDefaultFieldMapping,
  cleanExcelData
} from '../../utils/excelHelper.js';
import { 
  addWorksheetRow,
  processBatchResults 
} from '../../utils/apiHelper.js';
import { 
  getWorksheetConfig 
} from '../../config/worksheetConfig.js';
import {
  getMappingData,
  matchStudentAndCourse,
  validateDataIntegrity,
  generateImportSuggestions,
  optimizeImportOrder,
  checkImportLimits
} from '../../utils/batchImportHelper.js';

// 组件属性
const props = defineProps({
  // 成绩工作表ID
  gradeWorksheetId: {
    type: String,
    default: ''
  },
  // 学生工作表ID
  studentWorksheetId: {
    type: String,
    default: ''
  },
  // 课程工作表ID
  courseWorksheetId: {
    type: String,
    default: ''
  }
});

// 组件事件
const emit = defineEmits(['success', 'error', 'progress', 'close']);

// 响应式数据
const uploadRef = ref(null);
const loading = ref(false);
const fileInfo = ref(null);
const previewData = ref([]);
const validationResult = ref(null);
const showFullPreview = ref(false);
const importProgress = ref({
  show: false,
  current: 0,
  total: 0,
  percentage: 0,
  status: '',
  message: '',
  successCount: 0,
  errorCount: 0
});

// 计算属性
const canImport = computed(() => {
  return validationResult.value && 
         validationResult.value.valid && 
         validationResult.value.validData.length > 0;
});

const hasErrorData = computed(() => {
  return validationResult.value && 
         validationResult.value.invalidData.length > 0;
});

// 文件上传处理
const handleFileChange = async (file) => {
  if (!file) return;
  
  fileInfo.value = {
    name: file.name,
    size: file.size,
    type: file.type
  };
  
  try {
    loading.value = true;
    
    // 解析Excel文件
    const result = await parseExcelFile(file.raw);
    
    if (!result.success) {
      ElMessage.error(result.error);
      return;
    }
    
    fileInfo.value.totalRows = result.totalRows;
    previewData.value = result.data;
    
    // 验证数据
    const fieldMapping = getDefaultFieldMapping();
    validationResult.value = validateExcelData(result.data, fieldMapping);
    
    if (validationResult.value.valid) {
      ElMessage.success(`数据验证通过，共 ${result.totalRows} 行数据`);
    } else {
      ElMessage.warning(`数据验证完成，${validationResult.value.validRows} 行有效，${validationResult.value.invalidRows} 行有错误`);
    }
    
  } catch (error) {
    console.error('文件处理失败:', error);
    ElMessage.error('文件处理失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 上传前验证
const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel';
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!');
    return false;
  }
  return true;
};

// 下载模板
const downloadTemplate = () => {
  try {
    downloadExcelTemplate({ includeSampleData: true });
    ElMessage.success('模板下载成功');
  } catch (error) {
    console.error('模板下载失败:', error);
    ElMessage.error('模板下载失败');
  }
};

// 导出错误数据
const exportErrorData = () => {
  if (!hasErrorData.value) return;
  
  try {
    const errorData = validationResult.value.invalidData.map(item => ({
      rowNumber: item.rowNumber,
      studentName: item.data['学生姓名'] || '',
      courseName: item.data['课程名称'] || '',
      score: item.data['成绩'] || '',
      examDate: item.data['考试日期'] || '',
      remark: item.data['备注'] || '',
      errors: item.errors.join('; ')
    }));
    
    const blob = exportDataToExcel(errorData, {
      sheetName: '错误数据',
      headers: ['行号', '学生姓名', '课程名称', '成绩', '考试日期', '备注', '错误信息']
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '错误数据.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    ElMessage.success('错误数据导出成功');
  } catch (error) {
    console.error('导出错误数据失败:', error);
    ElMessage.error('导出错误数据失败');
  }
};

// 开始导入
const startImport = async () => {
  if (!canImport.value) return;
  
  try {
    // 确认导入
    await ElMessageBox.confirm(
      `确认导入 ${validationResult.value.validData.length} 条成绩记录吗？`,
      '确认导入',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    
    // 初始化进度
    const totalRows = validationResult.value.validData.length;
    importProgress.value = {
      show: true,
      current: 0,
      total: totalRows,
      percentage: 0,
      status: '',
      message: '开始导入...',
      successCount: 0,
      errorCount: 0
    };
    
    emit('progress', importProgress.value);
    
    // 批量保存数据
    const results = [];
    const batchSize = 10; // 每批处理10条
    
    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = validationResult.value.validData.slice(i, i + batchSize);
      
      // 处理批次数据
      for (const row of batch) {
        try {
          // 清理数据
          const fieldMapping = getDefaultFieldMapping();
          const cleanedData = cleanExcelData(row.data, fieldMapping);
          
          // 添加创建时间
          cleanedData.createTime = new Date().toISOString();
          
          // 保存数据
          const result = await addWorksheetRow({
            worksheetId: props.gradeWorksheetId,
            row: cleanedData
          });
          
          results.push(result);
          
          if (result.success) {
            importProgress.value.successCount++;
          } else {
            importProgress.value.errorCount++;
          }
          
        } catch (error) {
          results.push({
            success: false,
            error: error.message
          });
          importProgress.value.errorCount++;
        }
        
        // 更新进度
        importProgress.value.current++;
        importProgress.value.percentage = Math.round((importProgress.value.current / totalRows) * 100);
        importProgress.value.message = `正在导入第 ${importProgress.value.current} 条记录...`;
        
        emit('progress', importProgress.value);
      }
      
      // 批次间延迟，避免API限制
      if (i + batchSize < totalRows) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 处理结果
    const batchResult = processBatchResults(results);
    
    // 更新进度状态
    importProgress.value.status = batchResult.successRate === 100 ? 'success' : 'exception';
    importProgress.value.message = `导入完成: ${batchResult.success} 条成功，${batchResult.fail} 条失败`;
    
    emit('progress', importProgress.value);
    
    if (batchResult.success > 0) {
      ElMessage.success(`导入完成: ${batchResult.success} 条成功，${batchResult.fail} 条失败`);
      emit('success', batchResult);
    } else {
      ElMessage.error('导入失败: ' + batchResult.errors.join('; '));
      emit('error', batchResult.errors);
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导入失败:', error);
      ElMessage.error('导入失败: ' + error.message);
      emit('error', error.message);
    }
  } finally {
    loading.value = false;
  }
};

// 清空文件
const clearFile = () => {
  fileInfo.value = null;
  previewData.value = [];
  validationResult.value = null;
  showFullPreview.value = false;
  importProgress.value.show = false;
  
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 清空所有
const clearAll = () => {
  clearFile();
  ElMessage.info('已清空所有数据');
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 组件挂载
onMounted(() => {
  // 检查配置
  if (!props.gradeWorksheetId) {
    ElMessage.warning('成绩工作表ID未配置，请检查配置');
  }
});
</script>

<style scoped>
.batch-import {
  max-width: 1000px;
  margin: 0 auto;
}

.import-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-area {
  width: 100%;
}

.file-info {
  margin-bottom: 20px;
}

.preview-section,
.validation-section,
.progress-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title h4 {
  margin: 0;
  color: #409eff;
  font-size: 16px;
}

.error-details {
  margin-top: 15px;
}

.error-details h4 {
  margin: 0 0 10px 0;
  color: #f56c6c;
  font-size: 14px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-header h4 {
  margin: 0;
  color: #409eff;
  font-size: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 14px;
}

.success-count {
  color: #67c23a;
  font-weight: 500;
}

.error-count {
  color: #f56c6c;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

:deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
}

:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-tag) {
  margin: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .progress-info {
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }
}
</style> 