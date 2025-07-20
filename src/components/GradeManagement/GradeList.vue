<template>
  <div class="grade-list">
    <el-card class="list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>成绩记录管理</span>
          <div class="header-actions">
            <el-button 
              type="success" 
              size="small" 
              @click="exportData"
              :loading="exporting"
            >
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="refreshData"
              :loading="loading"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索和筛选区域 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.studentName"
              placeholder="搜索学生姓名"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="searchForm.courseName"
              placeholder="搜索课程名称"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Reading /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.scoreRange"
              placeholder="成绩范围"
              clearable
            >
              <el-option label="90-100分" value="90-100" />
              <el-option label="80-89分" value="80-89" />
              <el-option label="70-79分" value="70-79" />
              <el-option label="60-69分" value="60-69" />
              <el-option label="60分以下" value="0-59" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-col>
          <el-col :span="2">
            <el-button type="primary" @click="handleSearch" :loading="loading">
              搜索
            </el-button>
          </el-col>
        </el-row>
        
        <div class="search-actions">
          <el-button @click="clearSearch" size="small">清空筛选</el-button>
          <el-button @click="showAdvancedSearch = !showAdvancedSearch" size="small">
            {{ showAdvancedSearch ? '收起' : '高级搜索' }}
          </el-button>
        </div>
        
        <!-- 高级搜索 -->
        <div v-if="showAdvancedSearch" class="advanced-search">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-input
                v-model="searchForm.remark"
                placeholder="搜索备注"
                clearable
              />
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="searchForm.sortBy"
                placeholder="排序方式"
              >
                <el-option label="按成绩降序" value="score-desc" />
                <el-option label="按成绩升序" value="score-asc" />
                <el-option label="按日期降序" value="date-desc" />
                <el-option label="按日期升序" value="date-asc" />
                <el-option label="按学生姓名" value="student-asc" />
                <el-option label="按课程名称" value="course-asc" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input-number
                v-model="searchForm.pageSize"
                :min="10"
                :max="100"
                placeholder="每页显示"
              />
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="statistics-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总记录数" :value="statistics.total" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="平均分" :value="statistics.average" :precision="1" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="最高分" :value="statistics.highest" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="最低分" :value="statistics.lowest" />
          </el-col>
        </el-row>
      </div>

      <!-- 数据表格 -->
      <div class="table-section">
        <el-table
          :data="tableData"
          v-loading="loading"
          border
          stripe
          size="small"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="studentName" label="学生姓名" sortable="custom" />
          <el-table-column prop="courseName" label="课程名称" sortable="custom" />
          <el-table-column prop="score" label="成绩" sortable="custom" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="getScoreTagType(row.score)"
                size="small"
              >
                {{ row.score }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="examDate" label="考试日期" sortable="custom" width="120" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleEdit(row)"
                :disabled="!canEdit"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDelete(row)"
                :disabled="!canDelete"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 批量操作 -->
      <div v-if="selectedRows.length > 0" class="batch-actions">
        <el-alert
          :title="`已选择 ${selectedRows.length} 条记录`"
          type="info"
          show-icon
          closable
        />
        <div class="batch-buttons">
          <el-button 
            type="danger" 
            size="small" 
            @click="handleBatchDelete"
            :disabled="!canDelete"
          >
            批量删除
          </el-button>
          <el-button 
            type="success" 
            size="small" 
            @click="handleBatchExport"
          >
            批量导出
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialog.visible"
      title="编辑成绩记录"
      width="600px"
      :close-on-click-modal="false"
    >
      <GradeEditForm
        v-if="editDialog.visible"
        :grade-data="editDialog.data"
        :student-list="studentList"
        :course-list="courseList"
        @success="handleEditSuccess"
        @cancel="editDialog.visible = false"
      />
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialog.visible"
      title="确认删除"
      width="400px"
    >
      <p>确定要删除以下成绩记录吗？</p>
      <ul>
        <li v-for="item in deleteDialog.items" :key="item.rowId">
          {{ item.studentName }} - {{ item.courseName }} ({{ item.score }}分)
        </li>
      </ul>
      <template #footer>
        <el-button @click="deleteDialog.visible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="deleting">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Download, 
  Refresh, 
  User, 
  Reading 
} from '@element-plus/icons-vue';
import { 
  getWorksheetData, 
  updateWorksheetRow, 
  deleteWorksheetRow,
  buildQueryParams 
} from '../../utils/apiHelper.js';
import { 
  getWorksheetConfig 
} from '../../config/worksheetConfig.js';
import {
  canOperate,
  OperationType,
  getCurrentUser,
  logPermissionCheck
} from '../../utils/permissionHelper.js';
import GradeEditForm from './GradeEditForm.vue';

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
const emit = defineEmits(['refresh', 'error', 'close']);

// 响应式数据
const loading = ref(false);
const exporting = ref(false);
const deleting = ref(false);
const showAdvancedSearch = ref(false);
const tableData = ref([]);
const selectedRows = ref([]);
const studentList = ref([]);
const courseList = ref([]);

// 搜索表单
const searchForm = reactive({
  studentName: '',
  courseName: '',
  scoreRange: '',
  dateRange: [],
  remark: '',
  sortBy: 'date-desc',
  pageSize: 20
});

// 分页信息
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
});

// 统计信息
const statistics = reactive({
  total: 0,
  average: 0,
  highest: 0,
  lowest: 0
});

// 编辑对话框
const editDialog = reactive({
  visible: false,
  data: null
});

// 删除对话框
const deleteDialog = reactive({
  visible: false,
  items: []
});

// 计算属性
const canEdit = computed(() => {
  return canOperate(OperationType.EDIT_GRADE);
});

const canDelete = computed(() => {
  return canOperate(OperationType.DELETE_GRADE);
});

const canExport = computed(() => {
  return canOperate(OperationType.EXPORT_DATA);
});

// 获取成绩数据
const loadGradeData = async () => {
  if (!props.gradeWorksheetId) {
    ElMessage.error('成绩工作表ID未配置');
    return;
  }

  try {
    loading.value = true;
    
    // 构建查询参数
    const params = buildQueryParams({
      worksheetId: props.gradeWorksheetId,
      pageIndex: pagination.current - 1,
      pageSize: pagination.pageSize,
      ...buildSearchParams()
    });

    const result = await getWorksheetData(params);
    
    if (result.success) {
      tableData.value = result.data;
      pagination.total = result.total;
      
      // 计算统计信息
      calculateStatistics(result.data);
      
      emit('refresh');
    } else {
      ElMessage.error('获取数据失败: ' + result.error);
      emit('error', result.error);
    }
    
  } catch (error) {
    console.error('加载成绩数据失败:', error);
    ElMessage.error('加载数据失败: ' + error.message);
    emit('error', error.message);
  } finally {
    loading.value = false;
  }
};

// 构建搜索参数
const buildSearchParams = () => {
  const params = {};
  
  if (searchForm.studentName) {
    params.filters = params.filters || [];
    params.filters.push({
      fieldId: 'studentName',
      operator: 'contains',
      value: searchForm.studentName
    });
  }
  
  if (searchForm.courseName) {
    params.filters = params.filters || [];
    params.filters.push({
      fieldId: 'courseName',
      operator: 'contains',
      value: searchForm.courseName
    });
  }
  
  if (searchForm.scoreRange) {
    const [min, max] = searchForm.scoreRange.split('-').map(Number);
    params.filters = params.filters || [];
    params.filters.push({
      fieldId: 'score',
      operator: 'between',
      value: [min, max]
    });
  }
  
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.filters = params.filters || [];
    params.filters.push({
      fieldId: 'examDate',
      operator: 'between',
      value: searchForm.dateRange
    });
  }
  
  if (searchForm.remark) {
    params.filters = params.filters || [];
    params.filters.push({
      fieldId: 'remark',
      operator: 'contains',
      value: searchForm.remark
    });
  }
  
  // 排序
  if (searchForm.sortBy) {
    const [field, order] = searchForm.sortBy.split('-');
    params.sort = [{
      fieldId: getSortFieldId(field),
      isAsc: order === 'asc'
    }];
  }
  
  return params;
};

// 获取排序字段ID
const getSortFieldId = (field) => {
  const fieldMap = {
    'score': 'score',
    'date': 'examDate',
    'student': 'studentName',
    'course': 'courseName'
  };
  return fieldMap[field] || 'examDate';
};

// 计算统计信息
const calculateStatistics = (data) => {
  if (!data || data.length === 0) {
    statistics.total = 0;
    statistics.average = 0;
    statistics.highest = 0;
    statistics.lowest = 0;
    return;
  }
  
  const scores = data.map(item => parseFloat(item.score)).filter(score => !isNaN(score));
  
  statistics.total = data.length;
  statistics.average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  statistics.highest = Math.max(...scores);
  statistics.lowest = Math.min(...scores);
};

// 获取学生和课程数据
const loadReferenceData = async () => {
  try {
    // 获取学生数据
    if (props.studentWorksheetId) {
      const studentParams = buildQueryParams({
        worksheetId: props.studentWorksheetId,
        pageSize: 1000,
        sort: [{ fieldId: 'studentName', isAsc: true }]
      });
      
      const studentResult = await getWorksheetData(studentParams);
      if (studentResult.success) {
        studentList.value = studentResult.data;
      }
    }
    
    // 获取课程数据
    if (props.courseWorksheetId) {
      const courseParams = buildQueryParams({
        worksheetId: props.courseWorksheetId,
        pageSize: 1000,
        sort: [{ fieldId: 'courseName', isAsc: true }]
      });
      
      const courseResult = await getWorksheetData(courseParams);
      if (courseResult.success) {
        courseList.value = courseResult.data;
      }
    }
    
  } catch (error) {
    console.error('加载参考数据失败:', error);
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  loadGradeData();
};

// 清空搜索
const clearSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = [];
    } else {
      searchForm[key] = '';
    }
  });
  searchForm.pageSize = 20;
  searchForm.sortBy = 'date-desc';
  handleSearch();
};

// 刷新数据
const refreshData = () => {
  loadGradeData();
};

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.current = 1;
  loadGradeData();
};

const handleCurrentChange = (page) => {
  pagination.current = page;
  loadGradeData();
};

// 排序处理
const handleSortChange = ({ column, prop, order }) => {
  if (order === 'ascending') {
    searchForm.sortBy = `${prop}-asc`;
  } else if (order === 'descending') {
    searchForm.sortBy = `${prop}-desc`;
  }
  loadGradeData();
};

// 选择处理
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 编辑处理
const handleEdit = (row) => {
  // 检查编辑权限
  if (!canOperate(OperationType.EDIT_GRADE, row)) {
    ElMessage.error('您没有权限编辑此记录');
    logPermissionCheck(OperationType.EDIT_GRADE, false, { rowId: row.rowId });
    return;
  }
  
  editDialog.data = { ...row };
  editDialog.visible = true;
  logPermissionCheck(OperationType.EDIT_GRADE, true, { rowId: row.rowId });
};

// 编辑成功
const handleEditSuccess = () => {
  editDialog.visible = false;
  ElMessage.success('成绩记录更新成功');
  loadGradeData();
};

// 删除处理
const handleDelete = (row) => {
  // 检查删除权限
  if (!canOperate(OperationType.DELETE_GRADE, row)) {
    ElMessage.error('您没有权限删除此记录');
    logPermissionCheck(OperationType.DELETE_GRADE, false, { rowId: row.rowId });
    return;
  }
  
  deleteDialog.items = [row];
  deleteDialog.visible = true;
  logPermissionCheck(OperationType.DELETE_GRADE, true, { rowId: row.rowId });
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录');
    return;
  }
  deleteDialog.items = [...selectedRows.value];
  deleteDialog.visible = true;
};

// 确认删除
const confirmDelete = async () => {
  try {
    deleting.value = true;
    
    const deletePromises = deleteDialog.items.map(item => 
      deleteWorksheetRow({
        worksheetId: props.gradeWorksheetId,
        rowId: item.rowId
      })
    );
    
    const results = await Promise.all(deletePromises);
    const successCount = results.filter(result => result.success).length;
    const failCount = results.length - successCount;
    
    if (successCount > 0) {
      ElMessage.success(`删除成功: ${successCount} 条，失败: ${failCount} 条`);
      loadGradeData();
    } else {
      ElMessage.error('删除失败');
    }
    
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败: ' + error.message);
  } finally {
    deleting.value = false;
    deleteDialog.visible = false;
  }
};

// 导出数据
const exportData = async () => {
  // 检查导出权限
  if (!canOperate(OperationType.EXPORT_DATA)) {
    ElMessage.error('您没有权限导出数据');
    logPermissionCheck(OperationType.EXPORT_DATA, false);
    return;
  }
  
  try {
    exporting.value = true;
    
    // 这里可以实现导出逻辑
    ElMessage.success('导出功能将在后续版本中实现');
    logPermissionCheck(OperationType.EXPORT_DATA, true);
    
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败: ' + error.message);
  } finally {
    exporting.value = false;
  }
};

// 批量导出
const handleBatchExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要导出的记录');
    return;
  }
  
  // 这里可以实现批量导出逻辑
  ElMessage.success(`已选择 ${selectedRows.value.length} 条记录进行导出`);
};

// 获取成绩标签类型
const getScoreTagType = (score) => {
  const num = parseFloat(score);
  if (num >= 90) return 'success';
  if (num >= 80) return 'warning';
  if (num >= 60) return 'info';
  return 'danger';
};

// 监听搜索表单变化
watch(searchForm, () => {
  // 可以在这里实现实时搜索
}, { deep: true });

// 组件挂载
onMounted(() => {
  loadReferenceData();
  loadGradeData();
});
</script>

<style scoped>
.grade-list {
  max-width: 1200px;
  margin: 0 auto;
}

.list-card {
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

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.search-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.advanced-search {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.statistics-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
}

.table-section {
  margin-bottom: 20px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.batch-actions {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 8px;
}

.batch-buttons {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-tag) {
  font-weight: 500;
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
  
  .search-section .el-row {
    margin-bottom: 10px;
  }
  
  .search-section .el-col {
    margin-bottom: 10px;
  }
  
  .batch-buttons {
    flex-direction: column;
  }
}
</style> 