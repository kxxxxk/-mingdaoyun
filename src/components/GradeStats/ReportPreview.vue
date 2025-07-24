<template>
  <div class="report-preview">
    <el-card class="preview-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><View /></el-icon>
            报表预览
          </span>
          <div class="header-actions">
            <el-select v-model="selectedTemplate" placeholder="选择模板" style="width: 200px; margin-right: 10px;">
              <el-option
                v-for="template in templates"
                :key="template.id"
                :label="template.name"
                :value="template.id"
              >
                <span>{{ template.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">
                  {{ template.type === 'excel' ? 'Excel' : 'PDF' }}
                </span>
              </el-option>
            </el-select>
            <el-button type="primary" @click="refreshPreview">
              <el-icon><Refresh /></el-icon>
              刷新预览
            </el-button>
          </div>
        </div>
      </template>

      <div class="preview-content" v-loading="loading">
        <!-- 模板信息 -->
        <div class="template-info" v-if="selectedTemplateData">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="模板名称">
              {{ selectedTemplateData.name }}
            </el-descriptions-item>
            <el-descriptions-item label="模板类型">
              <el-tag :type="selectedTemplateData.type === 'excel' ? 'success' : 'warning'">
                {{ selectedTemplateData.type === 'excel' ? 'Excel' : 'PDF' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="部分数量">
              {{ selectedTemplateData.sections.length }}
            </el-descriptions-item>
            <el-descriptions-item label="模板描述" :span="3">
              {{ selectedTemplateData.description }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 预览内容 -->
        <div class="preview-sections" v-if="previewData">
          <div 
            v-for="section in previewData.sections" 
            :key="section.id"
            class="preview-section"
          >
            <el-card class="section-card" shadow="hover">
              <template #header>
                <div class="section-header">
                  <span class="section-title">{{ section.name }}</span>
                  <el-tag size="small" :type="getSectionTypeColor(section.type)">
                    {{ getSectionTypeName(section.type) }}
                  </el-tag>
                </div>
              </template>

              <!-- 概览部分预览 -->
              <div v-if="section.type === 'overview'" class="overview-preview">
                <el-row :gutter="20">
                  <el-col 
                    :span="8" 
                    v-for="(value, key) in section.data" 
                    :key="key"
                  >
                    <div class="overview-item">
                      <div class="item-label">{{ key }}</div>
                      <div class="item-value">{{ value }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 表格部分预览 -->
              <div v-else-if="section.type === 'table'" class="table-preview">
                <el-table 
                  :data="section.data" 
                  style="width: 100%"
                  :max-height="300"
                  border
                >
                  <el-table-column 
                    v-for="(value, key) in section.data[0] || {}"
                    :key="key"
                    :prop="key"
                    :label="key"
                    min-width="120"
                  />
                </el-table>
                <div class="table-info" v-if="section.data.length > 0">
                  <span>共 {{ section.data.length }} 条记录</span>
                </div>
              </div>

              <!-- 文本部分预览 -->
              <div v-else-if="section.type === 'text'" class="text-preview">
                <div 
                  v-for="(value, key) in section.data" 
                  :key="key"
                  class="text-item"
                >
                  <div class="text-label">{{ key }}</div>
                  <div class="text-content">{{ value }}</div>
                </div>
              </div>

              <!-- 章节部分预览 -->
              <div v-else-if="section.type === 'section'" class="section-preview">
                <div class="section-content">
                  <p>章节内容预览</p>
                  <el-tag type="info">此部分在最终报表中会包含完整的章节内容</el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-state">
          <el-empty description="请选择模板查看预览">
            <el-button type="primary" @click="selectDefaultTemplate">
              选择默认模板
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- 预览操作 -->
      <div class="preview-actions" v-if="previewData">
        <el-divider />
        <div class="actions-container">
          <div class="action-group">
            <span class="action-label">预览选项：</span>
            <el-checkbox v-model="previewOptions.showStyles">显示样式</el-checkbox>
            <el-checkbox v-model="previewOptions.showPageBreaks">显示分页</el-checkbox>
            <el-checkbox v-model="previewOptions.showWatermark">显示水印</el-checkbox>
          </div>
          <div class="action-group">
            <el-button type="primary" @click="exportPreview">
              <el-icon><Download /></el-icon>
              导出预览
            </el-button>
            <el-button @click="printPreview">
              <el-icon><Printer /></el-icon>
              打印预览
            </el-button>
            <el-button @click="sharePreview">
              <el-icon><Share /></el-icon>
              分享预览
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 预览设置对话框 -->
    <el-dialog 
      v-model="showPreviewSettings" 
      title="预览设置" 
      width="clamp(320px, 90vw, 600px)"
    >
      <el-form :model="previewSettings" label-width="120px">
        <el-form-item label="预览模式">
          <el-radio-group v-model="previewSettings.mode">
            <el-radio label="live">实时预览</el-radio>
            <el-radio label="static">静态预览</el-radio>
            <el-radio label="interactive">交互预览</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="数据源">
          <el-select v-model="previewSettings.dataSource" placeholder="选择数据源" style="width: 100%">
            <el-option label="实时数据" value="realtime" />
            <el-option label="模拟数据" value="mock" />
            <el-option label="历史数据" value="historical" />
          </el-select>
        </el-form-item>

        <el-form-item label="预览质量">
          <el-select v-model="previewSettings.quality" placeholder="选择预览质量" style="width: 100%">
            <el-option label="低质量（快速）" value="low" />
            <el-option label="中等质量" value="medium" />
            <el-option label="高质量（慢速）" value="high" />
          </el-select>
        </el-form-item>

        <el-form-item label="自动刷新">
          <el-switch v-model="previewSettings.autoRefresh" />
          <span style="margin-left: 10px; color: #909399;">启用后每30秒自动刷新预览</span>
        </el-form-item>

        <el-form-item label="显示选项">
          <el-checkbox-group v-model="previewSettings.displayOptions">
            <el-checkbox label="showHeaders">显示表头</el-checkbox>
            <el-checkbox label="showFooters">显示页脚</el-checkbox>
            <el-checkbox label="showGrid">显示网格</el-checkbox>
            <el-checkbox label="showBorders">显示边框</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPreviewSettings = false">取消</el-button>
          <el-button type="primary" @click="applyPreviewSettings">应用设置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Refresh, Download, Printer, Share } from '@element-plus/icons-vue'
import { templateManager } from '../../utils/reportTemplate'

// Props
const props = defineProps({
  gradeData: {
    type: Array,
    default: () => []
  },
  trendData: {
    type: Object,
    default: () => ({})
  },
  rankingData: {
    type: Object,
    default: () => ({})
  },
  comparisonData: {
    type: Object,
    default: () => ({})
  },
  overviewData: {
    type: Object,
    default: () => ({})
  }
})

// 响应式数据
const loading = ref(false)
const selectedTemplate = ref('')
const showPreviewSettings = ref(false)

const templates = ref([])
const previewData = ref(null)

const previewOptions = reactive({
  showStyles: true,
  showPageBreaks: false,
  showWatermark: false
})

const previewSettings = reactive({
  mode: 'live',
  dataSource: 'realtime',
  quality: 'medium',
  autoRefresh: false,
  displayOptions: ['showHeaders', 'showGrid', 'showBorders']
})

let autoRefreshTimer = null

// 计算属性
const selectedTemplateData = computed(() => {
  if (!selectedTemplate.value) return null
  return templateManager.getTemplateById(selectedTemplate.value)
})

// 方法
const loadTemplates = () => {
  templates.value = templateManager.getAllTemplates()
}

const selectDefaultTemplate = () => {
  if (templates.value.length > 0) {
    selectedTemplate.value = templates.value[0].id
  }
}

const refreshPreview = async () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择模板')
    return
  }

  loading.value = true
  try {
    const sampleData = prepareSampleData()
    previewData.value = templateManager.getTemplatePreview(selectedTemplate.value, sampleData)
    ElMessage.success('预览刷新成功')
  } catch (error) {
    console.error('刷新预览失败:', error)
    ElMessage.error('刷新预览失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const prepareSampleData = () => {
  // 准备示例数据用于预览
  const sampleData = {
    // 基础统计数据
    totalStudents: props.overviewData.totalStudents || 150,
    totalCourses: props.overviewData.totalCourses || 8,
    totalRecords: props.overviewData.totalRecords || 1200,
    averageScore: props.overviewData.averageScore || 78.5,

    // 学生信息
    studentName: '张三',
    className: '高三(1)班',
    courseName: '数学',
    score: 85,
    examDate: '2024-01-15',

    // 趋势分析数据
    totalPeriods: props.trendData.totalPeriods || 6,
    overallTrend: props.trendData.overallTrend || 2.3,
    maxGrowth: props.trendData.maxGrowth || 5.2,
    maxDecline: props.trendData.maxDecline || -1.8,
    stability: props.trendData.stability || 0.75,
    period: '2024-01',
    value: 82.5,
    trend: 1.2,
    trendRate: 1.5,
    description: '成绩稳步提升',

    // 排名分析数据
    averageRank: props.rankingData.averageRank || 25.5,
    improvedCount: props.rankingData.improvedCount || 45,
    declinedCount: props.rankingData.declinedCount || 12,
    rank: 15,
    previousRank: 18,
    change: 3,
    changeType: '提升',
    rankChange: 3,
    changeRate: 16.7,

    // 对比分析数据
    totalComparisons: props.comparisonData.totalComparisons || 4,
    differenceLevel: props.comparisonData.differenceLevel || 12.5,
    advantageCount: props.comparisonData.advantageCount || 2,
    disadvantageCount: props.comparisonData.disadvantageCount || 1,
    dimension: '平均分',
    target1: '高三(1)班',
    target2: '高三(2)班',
    difference: 3.2,
    advantage: '高三(1)班',
    metric: '数学成绩',
    significance: '显著',
    recommendation: '加强数学教学'
  }

  return sampleData
}

const getSectionTypeColor = (type) => {
  const colorMap = {
    overview: 'success',
    table: 'primary',
    text: 'warning',
    section: 'info'
  }
  return colorMap[type] || 'info'
}

const getSectionTypeName = (type) => {
  const nameMap = {
    overview: '概览',
    table: '表格',
    text: '文本',
    section: '章节'
  }
  return nameMap[type] || type
}

const exportPreview = () => {
  ElMessage.success('开始导出预览文件')
  // 实现导出预览功能
}

const printPreview = () => {
  ElMessage.success('开始打印预览')
  // 实现打印预览功能
}

const sharePreview = () => {
  ElMessage.success('开始分享预览')
  // 实现分享预览功能
}

const applyPreviewSettings = () => {
  showPreviewSettings.value = false
  refreshPreview()
  ElMessage.success('预览设置已应用')
}

const startAutoRefresh = () => {
  if (previewSettings.autoRefresh) {
    autoRefreshTimer = setInterval(() => {
      refreshPreview()
    }, 30000) // 30秒
  }
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// 监听器
watch(selectedTemplate, (newValue) => {
  if (newValue) {
    refreshPreview()
  } else {
    previewData.value = null
  }
})

watch(() => previewSettings.autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

// 生命周期
onMounted(() => {
  loadTemplates()
  selectDefaultTemplate()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="less">
.report-preview {
  .preview-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: bold;

      .el-icon {
        margin-right: 8px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .preview-content {
    min-height: 400px;

    .template-info {
      margin-bottom: 20px;
    }

    .preview-sections {
      .preview-section {
        margin-bottom: 20px;

        .section-card {
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .section-title {
              font-weight: bold;
              color: #303133;
            }
          }

          .overview-preview {
            .overview-item {
              text-align: center;
              padding: 15px;
              border: 1px solid #ebeef5;
              border-radius: 4px;
              margin-bottom: 10px;

              .item-label {
                color: #606266;
                font-size: 12px;
                margin-bottom: 5px;
              }

              .item-value {
                color: #303133;
                font-size: 18px;
                font-weight: bold;
              }
            }
          }

          .table-preview {
            .table-info {
              margin-top: 10px;
              text-align: right;
              color: #909399;
              font-size: 12px;
            }
          }

          .text-preview {
            .text-item {
              margin-bottom: 15px;

              .text-label {
                font-weight: bold;
                color: #303133;
                margin-bottom: 5px;
              }

              .text-content {
                color: #606266;
                line-height: 1.6;
                padding: 10px;
                background-color: #f5f7fa;
                border-radius: 4px;
              }
            }
          }

          .section-preview {
            .section-content {
              text-align: center;
              padding: 30px;
              color: #909399;

              p {
                margin-bottom: 15px;
              }
            }
          }
        }
      }
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }
  }

  .preview-actions {
    .actions-container {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .action-group {
        display: flex;
        align-items: center;

        .action-label {
          margin-right: 10px;
          color: #606266;
          font-weight: bold;
        }

        .el-checkbox {
          margin-right: 15px;
        }

        .el-button {
          margin-right: 10px;
        }
      }
    }
  }
}
</style> 