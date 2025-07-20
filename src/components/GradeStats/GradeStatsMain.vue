<template>
  <div class="grade-stats-main">
    <!-- 统计功能导航 -->
    <div class="stats-nav">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="班级统计" name="class">
          <ClassStats />
        </el-tab-pane>
        <el-tab-pane label="课程统计" name="course">
          <CourseStats />
        </el-tab-pane>
        <el-tab-pane label="学生统计" name="student">
          <StudentStats />
        </el-tab-pane>
        <el-tab-pane label="综合统计" name="overall">
          <OverallStats />
        </el-tab-pane>
        <el-tab-pane label="趋势分析" name="trend">
          <TrendAnalysis />
        </el-tab-pane>
        <el-tab-pane label="排名分析" name="ranking">
          <RankingAnalysis />
        </el-tab-pane>
        <el-tab-pane label="对比分析" name="comparison">
          <ComparisonAnalysis />
        </el-tab-pane>
        <el-tab-pane label="数据导出" name="export">
          <DataExport 
            :grade-data="filterData"
            :trend-data="trendData"
            :ranking-data="rankingData"
            :comparison-data="comparisonData"
            :overview-data="overview"
          />
        </el-tab-pane>
        <el-tab-pane label="报表预览" name="preview">
          <ReportPreview 
            :grade-data="filterData"
            :trend-data="trendData"
            :ranking-data="rankingData"
            :comparison-data="comparisonData"
            :overview-data="overview"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 数据筛选器 -->
    <div class="stats-filter">
      <el-card>
        <template #header>
          <div class="filter-header">
            <span>数据筛选</span>
            <el-button type="primary" size="small" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </template>
        
        <el-form :model="filterForm" label-width="80px" inline>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
            />
          </el-form-item>
          
          <el-form-item label="班级">
            <el-select
              v-model="filterForm.classId"
              placeholder="选择班级"
              clearable
              @change="handleFilterChange"
            >
              <el-option
                v-for="item in classOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="课程">
            <el-select
              v-model="filterForm.courseId"
              placeholder="选择课程"
              clearable
              @change="handleFilterChange"
            >
              <el-option
                v-for="item in courseOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="成绩范围">
            <el-input-number
              v-model="filterForm.minScore"
              :min="0"
              :max="100"
              placeholder="最低分"
              style="width: 100px"
              @change="handleFilterChange"
            />
            <span style="margin: 0 8px">-</span>
            <el-input-number
              v-model="filterForm.maxScore"
              :min="0"
              :max="100"
              placeholder="最高分"
              style="width: 100px"
              @change="handleFilterChange"
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-title">总学生数</div>
                <div class="overview-value">{{ overview.totalStudents }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-title">总课程数</div>
                <div class="overview-value">{{ overview.totalCourses }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-title">成绩记录数</div>
                <div class="overview-value">{{ overview.totalRecords }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-title">平均分</div>
                <div class="overview-value">{{ overview.averageScore.toFixed(1) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 统计内容区域 -->
    <div class="stats-content">
      <component 
        :is="currentComponent" 
        :filter-data="filterData"
        :grade-worksheet-id="gradeWorksheetId"
        :student-worksheet-id="studentWorksheetId"
        :course-worksheet-id="courseWorksheetId"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { api, config, env, utils, md_emitter } from 'mdye'
import { ElMessage } from 'element-plus'
import { Refresh, User, Reading, Document, TrendCharts } from '@element-plus/icons-vue'
import ClassStats from './ClassStats.vue'
import CourseStats from './CourseStats.vue'
import StudentStats from './StudentStats.vue'
import OverallStats from './OverallStats.vue'
import TrendAnalysis from './TrendAnalysis.vue'
import RankingAnalysis from './RankingAnalysis.vue'
import ComparisonAnalysis from './ComparisonAnalysis.vue'
import DataExport from './DataExport.vue'
import ReportPreview from './ReportPreview.vue'
import { getWorksheetData, getWorksheetTotal } from '../../utils/apiHelper.js'
import { parseFieldValue } from '../../utils/fieldParser.js'

export default {
  name: 'GradeStatsMain',
  props: {
    gradeWorksheetId: {
      type: String,
      required: true
    },
    studentWorksheetId: {
      type: String,
      required: true
    },
    courseWorksheetId: {
      type: String,
      required: true
    }
  },
  components: {
    ClassStats,
    CourseStats,
    StudentStats,
    OverallStats,
    TrendAnalysis,
    RankingAnalysis,
    ComparisonAnalysis,
    DataExport,
    ReportPreview,
    Refresh,
    User,
    Reading,
    Document,
    TrendCharts
  },
  setup(props) {
    // 响应式数据
    const activeTab = ref('class')
    const loading = ref(false)
    
    // 筛选表单
    const filterForm = reactive({
      dateRange: [],
      classId: '',
      courseId: '',
      minScore: null,
      maxScore: null
    })
    
    // 选项数据
    const classOptions = ref([])
    const courseOptions = ref([])
    
    // 概览数据
    const overview = reactive({
      totalStudents: 0,
      totalCourses: 0,
      totalRecords: 0,
      averageScore: 0
    })
    
    // 筛选后的数据
    const filterData = ref([])
    
    // 分析数据
    const trendData = ref({})
    const rankingData = ref({})
    const comparisonData = ref({})
    
    // 计算当前组件
    const currentComponent = computed(() => {
      const componentMap = {
        class: 'ClassStats',
        course: 'CourseStats',
        student: 'StudentStats',
        overall: 'OverallStats',
        trend: 'TrendAnalysis',
        ranking: 'RankingAnalysis',
        comparison: 'ComparisonAnalysis'
      }
      return componentMap[activeTab.value]
    })
    
    // 方法
    const loadOptions = async () => {
      try {
        // 加载班级选项
        const classData = await getWorksheetData({
          worksheetId: props.studentWorksheetId,
          viewId: config.viewId,
          pageSize: 1000,
          pageIndex: 1,
          filter: []
        })
        
        classOptions.value = classData.data.rows.map(row => ({
          value: row.rowid,
          label: parseFieldValue(row, '班级名称') || '未命名班级'
        }))
        
        // 加载课程选项
        const courseData = await getWorksheetData({
          worksheetId: props.courseWorksheetId,
          viewId: config.viewId,
          pageSize: 1000,
          pageIndex: 1,
          filter: []
        })
        
        courseOptions.value = courseData.data.rows.map(row => ({
          value: row.rowid,
          label: parseFieldValue(row, '课程名称') || '未命名课程'
        }))
      } catch (error) {
        console.error('加载选项数据失败:', error)
        ElMessage.error('加载选项数据失败')
      }
    }
    
    const loadOverview = async () => {
      try {
        loading.value = true
        
        // 获取成绩记录总数
        const totalRecords = await getWorksheetTotal({
          worksheetId: props.gradeWorksheetId,
          viewId: config.viewId
        })
        
        overview.totalRecords = totalRecords.total
        
        // 获取成绩数据计算平均分
        const gradeData = await getWorksheetData({
          worksheetId: props.gradeWorksheetId,
          viewId: config.viewId,
          pageSize: 1000,
          pageIndex: 1,
          filter: []
        })
        
        if (gradeData.data.rows.length > 0) {
          const scores = gradeData.data.rows.map(row => {
            const score = parseFieldValue(row, '成绩')
            return typeof score === 'number' ? score : 0
          }).filter(score => score > 0)
          
          overview.averageScore = scores.length > 0 
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
            : 0
        }
        
        // 获取学生和课程数量（这里需要根据实际的数据表结构调整）
        overview.totalStudents = classOptions.value.length
        overview.totalCourses = courseOptions.value.length
        
      } catch (error) {
        console.error('加载概览数据失败:', error)
        ElMessage.error('加载概览数据失败')
      } finally {
        loading.value = false
      }
    }
    
    const loadFilterData = async () => {
      try {
        loading.value = true
        
        const filterControls = []
        
        // 添加日期范围筛选
        if (filterForm.dateRange && filterForm.dateRange.length === 2) {
          filterControls.push({
            controlId: '考试日期',
            dataType: 5, // 日期类型
            spliceType: 1, // 且
            filterType: 1, // 等于
            values: filterForm.dateRange
          })
        }
        
        // 添加班级筛选
        if (filterForm.classId) {
          filterControls.push({
            controlId: '班级',
            dataType: 1, // 文本类型
            spliceType: 1, // 且
            filterType: 1, // 等于
            values: [filterForm.classId]
          })
        }
        
        // 添加课程筛选
        if (filterForm.courseId) {
          filterControls.push({
            controlId: '课程',
            dataType: 1, // 文本类型
            spliceType: 1, // 且
            filterType: 1, // 等于
            values: [filterForm.courseId]
          })
        }
        
        // 添加成绩范围筛选
        if (filterForm.minScore !== null || filterForm.maxScore !== null) {
          if (filterForm.minScore !== null) {
            filterControls.push({
              controlId: '成绩',
              dataType: 2, // 数字类型
              spliceType: 1, // 且
              filterType: 3, // 大于等于
              values: [filterForm.minScore]
            })
          }
          
          if (filterForm.maxScore !== null) {
            filterControls.push({
              controlId: '成绩',
              dataType: 2, // 数字类型
              spliceType: 1, // 且
              filterType: 4, // 小于等于
              values: [filterForm.maxScore]
            })
          }
        }
        
        const data = await getWorksheetData({
          worksheetId: props.gradeWorksheetId,
          viewId: config.viewId,
          pageSize: 1000,
          pageIndex: 1,
          filter: filterControls
        })
        
        filterData.value = data.data.rows
        
      } catch (error) {
        console.error('加载筛选数据失败:', error)
        ElMessage.error('加载筛选数据失败')
      } finally {
        loading.value = false
      }
    }
    
    const handleTabClick = (tab) => {
      activeTab.value = tab.props.name
    }
    
    const handleFilterChange = () => {
      loadFilterData()
    }
    
    const refreshData = () => {
      loadOptions()
      loadOverview()
      loadFilterData()
    }
    
    // 监听筛选条件变化
    watch(filterForm, () => {
      loadFilterData()
    }, { deep: true })
    
    // 生命周期
    onMounted(() => {
      loadOptions()
      loadOverview()
      loadFilterData()
    })
    
    return {
      activeTab,
      loading,
      filterForm,
      classOptions,
      courseOptions,
      overview,
      filterData,
      trendData,
      rankingData,
      comparisonData,
      currentComponent,
      handleTabClick,
      handleFilterChange,
      refreshData
    }
  }
}
</script>

<style scoped lang="less">
.grade-stats-main {
  padding: 20px;
  
  .stats-nav {
    margin-bottom: 20px;
  }
  
  .stats-filter {
    margin-bottom: 20px;
    
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .stats-overview {
    margin-bottom: 20px;
    
    .overview-card {
      .overview-item {
        display: flex;
        align-items: center;
        
        .overview-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          
          .el-icon {
            font-size: 24px;
            color: white;
          }
        }
        
        .overview-content {
          flex: 1;
          
          .overview-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .overview-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
        }
      }
    }
  }
  
  .stats-content {
    min-height: 400px;
  }
}
</style> 