<template>
  <div class="app-container">
    <!-- 头部信息 -->
    <div class="app-header">
      <div class="brand">
        <div class="logo">
          <img :src="icon" alt="Logo" />
        </div>
        <div class="title">学生成绩管理系统</div>
      </div>
      <div class="info">
        <div class="record-count">
          当前视图共 <b>{{ typeof count === "undefined" ? "?" : count }}</b> 条记录
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 配置信息展示 -->
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>系统配置信息</span>
            <el-button type="primary" size="small" @click="toggleConfig">
              {{ showConfig ? '隐藏' : '显示' }}配置
            </el-button>
          </div>
        </template>
        
        <div v-if="showConfig" class="config-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="config-section">
                <h4>环境变量</h4>
                <pre>{{ JSON.stringify(env, null, 2) }}</pre>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="config-section">
                <h4>视图配置</h4>
                <pre>{{ JSON.stringify({ appId, worksheetId, viewId }, null, 2) }}</pre>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 成绩录入表单 -->
      <el-card class="grade-input-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>成绩录入</span>
            <div class="header-actions">
              <el-button 
                type="success" 
                size="small" 
                @click="openBatchImport"
                :disabled="loading"
              >
                批量导入
              </el-button>
              <el-button 
                type="primary" 
                size="small" 
                @click="openGradeList"
                :disabled="loading"
              >
                成绩管理
              </el-button>
              <el-button 
                type="warning" 
                size="small" 
                @click="openGradeStats"
                :disabled="loading"
              >
                成绩统计
              </el-button>
            </div>
          </div>
        </template>
        
        <GradeInputForm
          :student-worksheet-id="studentWorksheetId"
          :course-worksheet-id="courseWorksheetId"
          :grade-worksheet-id="gradeWorksheetId"
          @success="handleGradeSuccess"
          @error="handleGradeError"
        />
      </el-card>

      <!-- 操作日志 -->
      <el-card class="logs-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>操作日志</span>
            <el-button type="danger" size="small" @click="clearLogs">
              清空日志
            </el-button>
          </div>
        </template>
        
        <Logs :logs="logs" />
      </el-card>
    </div>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="showBatchImport"
      title="批量导入成绩"
      width="clamp(320px, 90vw, 1200px)"
      :close-on-click-modal="true"
      :destroy-on-close="true"
      :before-close="handleBatchImportClose"
      :lock-scroll="false"
      :append-to-body="true"
      :z-index="2000"
    >
      <BatchImport
        v-if="showBatchImport"
        :key="'batch-import-' + componentKey"
        :grade-worksheet-id="gradeWorksheetId"
        :student-worksheet-id="studentWorksheetId"
        :course-worksheet-id="courseWorksheetId"
        @success="handleBatchImportSuccess"
        @error="handleBatchImportError"
        @progress="handleBatchImportProgress"
        @close="handleBatchImportClose"
      />
      <template #footer>
        <el-button @click="handleBatchImportClose">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 成绩管理对话框 -->
    <el-dialog
      v-model="showGradeList"
      title="成绩记录管理"
      width="clamp(320px, 90vw, 1400px)"
      :close-on-click-modal="true"
      :destroy-on-close="true"
      :before-close="handleGradeListClose"
      :lock-scroll="false"
      :append-to-body="true"
      :z-index="2001"
    >
      <GradeList
        v-if="showGradeList"
        :key="'grade-list-' + componentKey"
        :grade-worksheet-id="gradeWorksheetId"
        :student-worksheet-id="studentWorksheetId"
        :course-worksheet-id="courseWorksheetId"
        @refresh="handleGradeListRefresh"
        @error="handleGradeListError"
        @close="handleGradeListClose"
      />
      <template #footer>
        <el-button @click="handleGradeListClose">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 成绩统计对话框 -->
    <el-dialog
      v-model="showGradeStats"
      title="成绩统计分析"
      width="clamp(320px, 90vw, 1600px)"
      :close-on-click-modal="true"
      :destroy-on-close="true"
      :before-close="handleGradeStatsClose"
      :lock-scroll="false"
      :append-to-body="true"
      :z-index="2002"
    >
      <GradeStatsMain
        v-if="showGradeStats"
        :key="'grade-stats-' + componentKey"
        :grade-worksheet-id="gradeWorksheetId"
        :student-worksheet-id="studentWorksheetId"
        :course-worksheet-id="courseWorksheetId"
        @error="handleGradeStatsError"
        @close="handleGradeStatsClose"
      />
      <template #footer>
        <el-button @click="handleGradeStatsClose">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { config, env, api } from "mdye";
import GradeInputForm from "./components/GradeInput/GradeInputForm.vue";
import BatchImport from "./components/GradeInput/BatchImport.vue";
import GradeList from "./components/GradeManagement/GradeList.vue";
import GradeStatsMain from "./components/GradeStats/GradeStatsMain.vue";
import Logs from "./components/Logs.vue";
import icon from "./icon.svg";
import { 
  getWorksheetConfig,
  checkConfigIntegrity,
  getEnvironmentInfo 
} from "./config/worksheetConfig.js";

// 配置信息
const { appId, worksheetId, viewId } = config;
const { getFilterRowsTotalNum } = api;

// 响应式数据
const title = ref("学生成绩管理系统");
const count = ref(undefined);
const logs = ref([]);
const loading = ref(false);
const showConfig = ref(false);
const showBatchImport = ref(false);
const showGradeList = ref(false);
const showGradeStats = ref(false);
const componentKey = ref(0);

// 工作表ID配置
const studentConfig = getWorksheetConfig('student');
const courseConfig = getWorksheetConfig('course');
const gradeConfig = getWorksheetConfig('grade');

const studentWorksheetId = ref(studentConfig?.worksheetId || '');
const courseWorksheetId = ref(courseConfig?.worksheetId || '');
const gradeWorksheetId = ref(gradeConfig?.worksheetId || worksheetId);

// 组件挂载
onMounted(() => {
  addLog("系统初始化完成");
  loadRecords();
  checkConfiguration();
});

// 加载记录数量
async function loadRecords() {
  addLog("正在获取记录数量...");
  try {
    count.value = await getFilterRowsTotalNum({ worksheetId, viewId });
    addLog(`当前视图共${count.value}条记录`);
  } catch (error) {
    addLog(`获取记录数量失败: ${error.message}`);
    console.error('获取记录数量失败:', error);
  }
}

// 检查配置
function checkConfiguration() {
  const configCheck = checkConfigIntegrity();
  const envInfo = getEnvironmentInfo();
  
  if (!configCheck.valid) {
    configCheck.errors.forEach(error => {
      addLog(`错误: ${error}`);
      ElMessage.error(error);
    });
  }
  
  configCheck.warnings.forEach(warning => {
    addLog(`警告: ${warning}`);
    ElMessage.warning(warning);
  });
  
  if (configCheck.valid && configCheck.warnings.length === 0) {
    addLog("配置检查完成，所有配置项已正确设置");
    ElMessage.success("系统配置检查通过");
  }
  
  // 记录环境变量信息
  addLog(`环境变量配置: ${envInfo.configured.length}/${envInfo.total} 已配置`);
  if (envInfo.missing.length > 0) {
    addLog(`缺失的环境变量: ${envInfo.missing.join(', ')}`);
  }
}

// 添加日志
async function addLog(content) {
  const time = new Date();
  logs.value.push({
    time,
    timeStr: `[${[time.getHours(), time.getMinutes(), time.getSeconds()]
      .map((num) => String(num).padStart(2, 0))
      .join(":")}]`,
    content,
  });
}

// 切换配置显示
function toggleConfig() {
  showConfig.value = !showConfig.value;
}

// 清空日志
function clearLogs() {
  logs.value = [];
  addLog("日志已清空");
}

// 成绩保存成功处理
function handleGradeSuccess(data) {
  addLog(`成绩保存成功: ${JSON.stringify(data)}`);
  // 重新加载记录数量
  loadRecords();
}

// 成绩保存失败处理
function handleGradeError(error) {
  addLog(`成绩保存失败: ${error}`);
}

// 批量导入成功处理
function handleBatchImportSuccess(data) {
  addLog(`批量导入成功: ${data.success} 条成功，${data.fail} 条失败`);
  // 重新加载记录数量
  loadRecords();
}

// 批量导入失败处理
function handleBatchImportError(error) {
  addLog(`批量导入失败: ${error}`);
}

// 批量导入进度处理
function handleBatchImportProgress(progress) {
  addLog(`批量导入进度: ${progress.current}/${progress.total} (${progress.percentage}%)`);
}

// 成绩列表刷新处理
function handleGradeListRefresh() {
  addLog('成绩列表已刷新');
  // 重新加载记录数量
  loadRecords();
}

// 成绩列表错误处理
function handleGradeListError(error) {
  addLog(`成绩列表操作失败: ${error}`);
}

// 重置组件key
function resetComponentKey() {
  componentKey.value++;
}

// 打开批量导入对话框
function openBatchImport() {
  resetComponentKey();
  showBatchImport.value = true;
}

// 打开成绩管理对话框
function openGradeList() {
  resetComponentKey();
  showGradeList.value = true;
}

// 关闭批量导入对话框
function handleBatchImportClose() {
  showBatchImport.value = false;
  // 延迟重置key，确保组件完全销毁
  setTimeout(() => {
    resetComponentKey();
  }, 100);
}

// 关闭成绩管理对话框
function handleGradeListClose() {
  showGradeList.value = false;
}

// 打开成绩统计对话框
function openGradeStats() {
  resetComponentKey();
  showGradeStats.value = true;
}

// 关闭成绩统计对话框
function handleGradeStatsClose() {
  showGradeStats.value = false;
}

// 成绩统计错误处理
function handleGradeStatsError(error) {
  addLog(`成绩统计操作失败: ${error}`);
}

// 监听对话框状态变化
watch(showBatchImport, (newVal) => {
  if (!newVal) {
    // 对话框关闭时重置key
    setTimeout(() => {
      resetComponentKey();
    }, 200);
  }
});

watch(showGradeList, (newVal) => {
  if (!newVal) {
    // 对话框关闭时重置key
    setTimeout(() => {
      resetComponentKey();
    }, 200);
  }
});

watch(showGradeStats, (newVal) => {
  if (!newVal) {
    // 对话框关闭时重置key
    setTimeout(() => {
      resetComponentKey();
    }, 200);
  }
});



// 监听环境变量变化
if (env) {
  // 如果环境变量发生变化，重新检查配置
  Object.keys(env).forEach(key => {
    if (key.includes('WORKSHEET_ID')) {
      addLog(`检测到配置变化: ${key} = ${env[key]}`);
    }
  });
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  position: relative;
  width: 50px;
  height: 50px;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.info {
  text-align: right;
}

.record-count {
  font-size: 14px;
  color: #666;
}

.record-count b {
  color: #409eff;
  font-weight: 600;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.config-card,
.grade-input-card,
.logs-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  border: none;
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

.config-content {
  max-height: 400px;
  overflow-y: auto;
}

.config-section {
  margin-bottom: 20px;
}

.config-section h4 {
  margin: 0 0 10px 0;
  color: #409eff;
  font-size: 16px;
}

.config-section pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.batch-import-content,
.grade-list-content {
  text-align: center;
  padding: 40px 20px;
}

.batch-import-content p,
.grade-list-content p {
  margin-bottom: 20px;
  color: #666;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .app-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .brand {
    flex-direction: column;
    gap: 10px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .main-content {
    gap: 15px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* Element Plus 组件样式优化 */
:deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 20px;
}

:deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-dialog__footer) {
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  padding: 15px 20px;
}

:deep(.el-dialog__wrapper) {
  overflow: hidden;
}

</style>