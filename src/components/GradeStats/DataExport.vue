<template>
  <div class="data-export">
    <el-card class="export-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Document /></el-icon>
            数据导出与报表
          </span>
          <el-button type="primary" @click="showExportDialog = true">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </template>

      <!-- 导出历史 -->
      <div class="export-history">
        <h3>导出历史</h3>
        <el-table :data="exportHistory" style="width: 100%" v-loading="loading">
          <el-table-column prop="filename" label="文件名" width="200" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'excel' ? 'success' : 'warning'">
                {{ row.type === 'excel' ? 'Excel' : 'PDF' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                {{ row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="downloadFile(row)" :disabled="row.status !== 'success'">
                下载
              </el-button>
              <el-button size="small" type="danger" @click="deleteExport(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 报表模板管理 -->
      <div class="template-management">
        <h3>报表模板</h3>
        <el-row :gutter="20">
          <el-col :span="8" v-for="template in templates" :key="template.id">
            <el-card class="template-card" shadow="hover">
              <template #header>
                <div class="template-header">
                  <span>{{ template.name }}</span>
                  <el-dropdown @command="handleTemplateCommand">
                    <el-button type="text">
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :command="{ action: 'edit', template }">
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'copy', template }">
                          复制
                        </el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'export', template }">
                          导出配置
                        </el-dropdown-item>
                        <el-dropdown-item 
                          :command="{ action: 'delete', template }"
                          :disabled="template.id.startsWith('template_')"
                          divided
                        >
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
              <div class="template-content">
                <p class="description">{{ template.description }}</p>
                <div class="template-info">
                  <el-tag size="small" :type="template.type === 'excel' ? 'success' : 'warning'">
                    {{ template.type === 'excel' ? 'Excel' : 'PDF' }}
                  </el-tag>
                  <span class="section-count">{{ template.sections.length }} 个部分</span>
                </div>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="useTemplate(template)"
                  style="margin-top: 10px;"
                >
                  使用模板
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 导出对话框 -->
    <el-dialog 
      v-model="showExportDialog" 
      title="导出数据" 
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="exportForm" label-width="120px">
        <el-form-item label="导出类型">
          <el-radio-group v-model="exportForm.type">
            <el-radio label="excel">Excel文件</el-radio>
            <el-radio label="pdf">PDF报表</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="报表模板">
          <el-select v-model="exportForm.templateId" placeholder="选择报表模板" style="width: 100%">
            <el-option
              v-for="template in availableTemplates"
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
        </el-form-item>

        <el-form-item label="导出内容">
          <el-checkbox-group v-model="exportForm.content">
            <el-checkbox label="overview">统计概览</el-checkbox>
            <el-checkbox label="details">详细数据</el-checkbox>
            <el-checkbox label="trend">趋势分析</el-checkbox>
            <el-checkbox label="ranking">排名分析</el-checkbox>
            <el-checkbox label="comparison">对比分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="文件名">
          <el-input v-model="exportForm.filename" placeholder="输入文件名" />
        </el-form-item>

        <el-form-item label="数据范围">
          <el-select v-model="exportForm.dataRange" placeholder="选择数据范围" style="width: 100%">
            <el-option label="全部数据" value="all" />
            <el-option label="当前筛选结果" value="filtered" />
            <el-option label="最近30天" value="30days" />
            <el-option label="最近90天" value="90days" />
            <el-option label="自定义时间范围" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="exportForm.dataRange === 'custom'" label="时间范围">
          <el-date-picker
            v-model="exportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="高级选项">
          <el-checkbox v-model="exportForm.includeCharts">包含图表数据</el-checkbox>
          <el-checkbox v-model="exportForm.includeAnalysis">包含分析报告</el-checkbox>
          <el-checkbox v-model="exportForm.autoOpen">导出后自动打开</el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showExportDialog = false">取消</el-button>
          <el-button type="primary" @click="handleExport" :loading="exporting">
            开始导出
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 模板编辑对话框 -->
    <el-dialog 
      v-model="showTemplateDialog" 
      title="编辑报表模板" 
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :model="templateForm" label-width="120px">
        <el-form-item label="模板名称">
          <el-input v-model="templateForm.name" placeholder="输入模板名称" />
        </el-form-item>

        <el-form-item label="模板描述">
          <el-input 
            v-model="templateForm.description" 
            type="textarea" 
            placeholder="输入模板描述"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="模板类型">
          <el-radio-group v-model="templateForm.type">
            <el-radio label="excel">Excel模板</el-radio>
            <el-radio label="pdf">PDF模板</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="模板部分">
          <div class="sections-container">
            <div 
              v-for="(section, index) in templateForm.sections" 
              :key="index"
              class="section-item"
            >
              <el-card class="section-card">
                <template #header>
                  <div class="section-header">
                    <span>部分 {{ index + 1 }}</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeSection(index)"
                      :disabled="templateForm.sections.length <= 1"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
                
                <el-form-item label="部分名称">
                  <el-input v-model="section.name" placeholder="输入部分名称" />
                </el-form-item>

                <el-form-item label="部分类型">
                  <el-select v-model="section.type" placeholder="选择部分类型">
                    <el-option label="概览" value="overview" />
                    <el-option label="表格" value="table" />
                    <el-option label="文本" value="text" />
                    <el-option label="章节" value="section" />
                  </el-select>
                </el-form-item>

                <el-form-item label="包含字段">
                  <el-select 
                    v-model="section.fields" 
                    multiple 
                    placeholder="选择包含字段"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="field in availableFields"
                      :key="field.key"
                      :label="field.name"
                      :value="field.key"
                    >
                      <span>{{ field.name }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px">
                        {{ field.type }}
                      </span>
                    </el-option>
                  </el-select>
                </el-form-item>

                <el-form-item>
                  <el-checkbox v-model="section.enabled">启用此部分</el-checkbox>
                </el-form-item>
              </el-card>
            </div>
          </div>
          
          <el-button type="primary" @click="addSection" style="margin-top: 10px;">
            添加部分
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTemplateDialog = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存模板</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Download, MoreFilled } from '@element-plus/icons-vue'
import { 
  exportGradeDataToExcel, 
  exportReportToExcel,
  exportTrendReportToExcel,
  exportRankingReportToExcel,
  exportComparisonReportToExcel,
  batchExportReports,
  DEFAULT_COLUMNS
} from '../../utils/excelExport'
import { 
  generateGradeReportPDF,
  generateTrendReportPDF,
  generateRankingReportPDF,
  generateComparisonReportPDF,
  generateComprehensiveReportPDF
} from '../../utils/pdfReport'
import { 
  templateManager, 
  getAllFieldDefinitions,
  DEFAULT_TEMPLATES
} from '../../utils/reportTemplate'

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
const exporting = ref(false)
const showExportDialog = ref(false)
const showTemplateDialog = ref(false)

const exportHistory = ref([])
const templates = ref([])

const exportForm = reactive({
  type: 'excel',
  templateId: '',
  content: ['overview', 'details'],
  filename: '',
  dataRange: 'all',
  dateRange: [],
  includeCharts: true,
  includeAnalysis: true,
  autoOpen: false
})

const templateForm = reactive({
  id: '',
  name: '',
  description: '',
  type: 'excel',
  sections: [
    {
      id: 'overview',
      name: '统计概览',
      type: 'overview',
      enabled: true,
      fields: []
    }
  ]
})

// 计算属性
const availableTemplates = computed(() => {
  return templates.value.filter(template => template.type === exportForm.type)
})

const availableFields = computed(() => {
  return Object.values(getAllFieldDefinitions())
})

// 方法
const loadExportHistory = async () => {
  loading.value = true
  try {
    // 模拟加载导出历史
    exportHistory.value = [
      {
        id: 1,
        filename: '成绩统计报表_2024-01-15.xlsx',
        type: 'excel',
        size: '2.5MB',
        createdAt: '2024-01-15 14:30:00',
        status: 'success'
      },
      {
        id: 2,
        filename: '趋势分析报表_2024-01-14.pdf',
        type: 'pdf',
        size: '1.8MB',
        createdAt: '2024-01-14 16:20:00',
        status: 'success'
      }
    ]
  } catch (error) {
    console.error('加载导出历史失败:', error)
    ElMessage.error('加载导出历史失败')
  } finally {
    loading.value = false
  }
}

const loadTemplates = () => {
  templates.value = templateManager.getAllTemplates()
}

const handleExport = async () => {
  if (!exportForm.templateId) {
    ElMessage.warning('请选择报表模板')
    return
  }

  if (exportForm.content.length === 0) {
    ElMessage.warning('请选择导出内容')
    return
  }

  exporting.value = true
  try {
    const template = templateManager.getTemplateById(exportForm.templateId)
    const filename = exportForm.filename || template.name

    let result
    if (exportForm.type === 'excel') {
      result = await exportToExcel(template, filename)
    } else {
      result = await exportToPDF(template, filename)
    }

    if (result.success) {
      ElMessage.success(result.message)
      showExportDialog.value = false
      loadExportHistory()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败: ' + error.message)
  } finally {
    exporting.value = false
  }
}

const exportToExcel = async (template, filename) => {
  const data = prepareExportData()
  
  switch (template.id) {
    case 'basicStats':
      return exportGradeDataToExcel(data.details, {
        filename,
        columns: DEFAULT_COLUMNS.grade
      })
    case 'trendAnalysis':
      return exportTrendReportToExcel(data.trend, { filename })
    case 'rankingAnalysis':
      return exportRankingReportToExcel(data.ranking, { filename })
    case 'comparisonAnalysis':
      return exportComparisonReportToExcel(data.comparison, { filename })
    default:
      return exportReportToExcel(data, { filename })
  }
}

const exportToPDF = async (template, filename) => {
  const data = prepareExportData()
  
  switch (template.id) {
    case 'basicStats':
      return generateGradeReportPDF(data, { filename })
    case 'trendAnalysis':
      return generateTrendReportPDF(data.trend, { filename })
    case 'rankingAnalysis':
      return generateRankingReportPDF(data.ranking, { filename })
    case 'comparisonAnalysis':
      return generateComparisonReportPDF(data.comparison, { filename })
    case 'comprehensive':
      return generateComprehensiveReportPDF(data, { filename })
    default:
      return generateGradeReportPDF(data, { filename })
  }
}

const prepareExportData = () => {
  const data = {
    overview: props.overviewData,
    details: props.gradeData,
    trend: props.trendData,
    ranking: props.rankingData,
    comparison: props.comparisonData
  }

  // 根据数据范围过滤
  if (exportForm.dataRange === 'filtered') {
    // 使用当前筛选的数据
  } else if (exportForm.dataRange === 'custom' && exportForm.dateRange.length === 2) {
    // 根据时间范围过滤
    const [startDate, endDate] = exportForm.dateRange
    data.details = data.details.filter(item => {
      const itemDate = new Date(item.examDate)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return data
}

const downloadFile = (exportRecord) => {
  // 模拟文件下载
  ElMessage.success('开始下载文件: ' + exportRecord.filename)
}

const deleteExport = async (exportRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除导出记录 "${exportRecord.filename}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = exportHistory.value.findIndex(item => item.id === exportRecord.id)
    if (index > -1) {
      exportHistory.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch (error) {
    // 用户取消删除
  }
}

const useTemplate = (template) => {
  exportForm.templateId = template.id
  exportForm.type = template.type
  showExportDialog.value = true
}

const handleTemplateCommand = ({ action, template }) => {
  switch (action) {
    case 'edit':
      editTemplate(template)
      break
    case 'copy':
      copyTemplate(template)
      break
    case 'export':
      exportTemplateConfig(template)
      break
    case 'delete':
      deleteTemplate(template)
      break
  }
}

const editTemplate = (template) => {
  Object.assign(templateForm, { ...template })
  showTemplateDialog.value = true
}

const copyTemplate = async (template) => {
  try {
    const newName = await ElMessageBox.prompt(
      '请输入新模板名称',
      '复制模板',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: `${template.name}_副本`
      }
    )

    const newTemplate = templateManager.copyTemplate(template.id, newName.value)
    loadTemplates()
    ElMessage.success('模板复制成功')
  } catch (error) {
    // 用户取消操作
  }
}

const exportTemplateConfig = (template) => {
  try {
    const config = templateManager.exportTemplateConfig(template.id)
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name}_配置.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('模板配置导出成功')
  } catch (error) {
    ElMessage.error('模板配置导出失败: ' + error.message)
  }
}

const deleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    templateManager.deleteTemplate(template.id)
    loadTemplates()
    ElMessage.success('模板删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('模板删除失败: ' + error.message)
    }
  }
}

const addSection = () => {
  templateForm.sections.push({
    id: `section_${Date.now()}`,
    name: '新部分',
    type: 'overview',
    enabled: true,
    fields: []
  })
}

const removeSection = (index) => {
  templateForm.sections.splice(index, 1)
}

const saveTemplate = async () => {
  try {
    const validation = templateManager.validateTemplate(templateForm)
    if (!validation.isValid) {
      ElMessage.error('模板验证失败: ' + validation.errors.join(', '))
      return
    }

    if (templateForm.id) {
      templateManager.updateTemplate(templateForm.id, templateForm)
    } else {
      templateManager.createTemplate(templateForm)
    }

    loadTemplates()
    showTemplateDialog.value = false
    ElMessage.success('模板保存成功')
  } catch (error) {
    ElMessage.error('模板保存失败: ' + error.message)
  }
}

// 生命周期
onMounted(() => {
  loadExportHistory()
  loadTemplates()
})
</script>

<style scoped lang="less">
.data-export {
  .export-card {
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
  }

  .export-history {
    margin-bottom: 30px;

    h3 {
      margin-bottom: 15px;
      color: #303133;
    }
  }

  .template-management {
    h3 {
      margin-bottom: 15px;
      color: #303133;
    }

    .template-card {
      margin-bottom: 20px;

      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .template-content {
        .description {
          color: #606266;
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .template-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .section-count {
            color: #909399;
            font-size: 12px;
          }
        }
      }
    }
  }

  .sections-container {
    .section-item {
      margin-bottom: 15px;

      .section-card {
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
  }
}
</style> 