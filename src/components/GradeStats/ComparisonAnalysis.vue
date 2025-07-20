<template>
  <div class="comparison-analysis">
    <!-- 对比分析概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>对比分析</span>
            </div>
          </template>
          <div class="stat-number">{{ comparisonStats.totalComparisons }}</div>
          <div class="stat-desc">对比维度数</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>差异程度</span>
            </div>
          </template>
          <div class="stat-number" :class="getDifferenceClass(comparisonStats.differenceLevel)">
            {{ comparisonStats.differenceLevel.toFixed(1) }}%
          </div>
          <div class="stat-desc">{{ getDifferenceDescription(comparisonStats.differenceLevel) }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>优势项目</span>
            </div>
          </template>
          <div class="stat-number trend-up">{{ comparisonStats.advantageCount }}</div>
          <div class="stat-desc">表现优势项目</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>劣势项目</span>
            </div>
          </template>
          <div class="stat-number trend-down">{{ comparisonStats.disadvantageCount }}</div>
          <div class="stat-desc">需要改进项目</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 对比筛选器 -->
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>对比分析筛选</span>
        </div>
      </template>
      
      <el-form :model="filterForm" label-width="100px" inline>
        <el-form-item label="对比维度">
          <el-select v-model="filterForm.dimension" @change="handleDimensionChange">
            <el-option label="班级对比" value="class" />
            <el-option label="课程对比" value="course" />
            <el-option label="时间对比" value="time" />
            <el-option label="学生对比" value="student" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="对比对象1">
          <el-select v-model="filterForm.target1" @change="handleFilterChange">
            <el-option label="请选择" value="" />
            <el-option v-for="item in targetOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="对比对象2">
          <el-select v-model="filterForm.target2" @change="handleFilterChange">
            <el-option label="请选择" value="" />
            <el-option v-for="item in targetOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="对比指标">
          <el-select v-model="filterForm.metric" @change="handleFilterChange">
            <el-option label="平均分" value="average" />
            <el-option label="及格率" value="passRate" />
            <el-option label="优秀率" value="excellentRate" />
            <el-option label="标准差" value="standardDeviation" />
            <el-option label="最高分" value="maxScore" />
            <el-option label="最低分" value="minScore" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 对比图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>雷达图对比</span>
              <el-button type="primary" size="small" @click="exportRadarChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="radarChartRef" class="chart" style="height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>柱状图对比</span>
              <el-button type="primary" size="small" @click="exportBarChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="barChartRef" class="chart" style="height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 对比详情表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>对比详情</span>
          <el-button type="success" size="small" @click="exportTable">
            <el-icon><Download /></el-icon>
            导出表格
          </el-button>
        </div>
      </template>
      
      <el-table :data="comparisonDetails" stripe style="width: 100%">
        <el-table-column prop="metric" label="对比指标" width="120" />
        <el-table-column prop="target1Value" label="对象1数值" width="120">
          <template #default="scope">
            <span class="value-highlight">{{ scope.row.target1Value.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="target2Value" label="对象2数值" width="120">
          <template #default="scope">
            <span class="value-highlight">{{ scope.row.target2Value.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="difference" label="差异" width="100">
          <template #default="scope">
            <span :class="getDifferenceClass(scope.row.difference)">
              {{ scope.row.difference > 0 ? '+' : '' }}{{ scope.row.difference.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="differenceRate" label="差异率" width="100">
          <template #default="scope">
            <span :class="getDifferenceClass(scope.row.differenceRate)">
              {{ scope.row.differenceRate > 0 ? '+' : '' }}{{ scope.row.differenceRate.toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="advantage" label="优势方" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.advantage === 'target1' ? 'success' : 'danger'" size="small">
              {{ scope.row.advantage === 'target1' ? '对象1' : '对象2' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="analysis" label="分析" />
      </el-table>
    </el-card>

    <!-- 对比分析报告 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>对比分析报告</span>
        </div>
      </template>
      
      <div class="analysis-content">
        <div class="analysis-section">
          <h4>对比概况</h4>
          <p>本次对比分析涉及 <strong>{{ comparisonStats.totalComparisons }}</strong> 个维度，
          整体差异程度为 <strong>{{ comparisonStats.differenceLevel.toFixed(1) }}%</strong>，
          属于{{ getDifferenceDescription(comparisonStats.differenceLevel) }}。
          其中对象1在 <strong>{{ comparisonStats.advantageCount }}</strong> 个维度上表现优势，
          对象2在 <strong>{{ comparisonStats.disadvantageCount }}</strong> 个维度上表现优势。</p>
        </div>
        
        <div class="analysis-section">
          <h4>关键发现</h4>
          <ul>
            <li v-if="comparisonStats.advantageCount > comparisonStats.disadvantageCount">
              对象1整体表现优于对象2，在多个维度上具有明显优势
            </li>
            <li v-else-if="comparisonStats.disadvantageCount > comparisonStats.advantageCount">
              对象2整体表现优于对象1，需要重点关注对象1的改进
            </li>
            <li v-else>
              两个对象表现相当，各有优势领域
            </li>
            <li v-if="comparisonStats.differenceLevel > 20">
              差异程度较大，建议深入分析原因并制定针对性改进措施
            </li>
            <li v-else-if="comparisonStats.differenceLevel > 10">
              存在一定差异，建议关注表现较弱的方面
            </li>
            <li v-else>
              差异较小，整体表现相对均衡
            </li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>优势分析</h4>
          <ul>
            <li v-for="advantage in comparisonStats.advantages" :key="advantage">
              {{ advantage }}
            </li>
            <li v-if="comparisonStats.advantages.length === 0">
              暂无显著优势项目
            </li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>改进建议</h4>
          <ul>
            <li v-for="suggestion in comparisonStats.suggestions" :key="suggestion">
              {{ suggestion }}
            </li>
            <li>建议定期进行对比分析，持续跟踪改进效果</li>
            <li>建议建立标杆管理机制，促进良性竞争</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { parseFieldValue } from '../../utils/fieldParser.js'

export default {
  name: 'ComparisonAnalysis',
  components: {
    Download
  },
  props: {
    filterData: {
      type: Array,
      default: () => []
    },
    gradeWorksheetId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    // 响应式数据
    const radarChartRef = ref(null)
    const barChartRef = ref(null)
    let radarChart = null
    let barChart = null
    
    // 筛选表单
    const filterForm = reactive({
      dimension: 'class',
      target1: '',
      target2: '',
      metric: 'average'
    })
    
    // 对比统计数据
    const comparisonStats = reactive({
      totalComparisons: 0,
      differenceLevel: 0,
      advantageCount: 0,
      disadvantageCount: 0,
      advantages: [],
      suggestions: []
    })
    
    // 对比详情数据
    const comparisonDetails = ref([])
    
    // 目标选项
    const targetOptions = ref([])
    
    // 计算属性
    const radarData = computed(() => {
      if (!comparisonDetails.value.length) return { indicators: [], series: [] }
      
      const indicators = comparisonDetails.value.map(item => ({
        name: item.metric,
        max: Math.max(item.target1Value, item.target2Value) * 1.2
      }))
      
      const series = [
        {
          name: '对象1',
          data: comparisonDetails.value.map(item => item.target1Value)
        },
        {
          name: '对象2',
          data: comparisonDetails.value.map(item => item.target2Value)
        }
      ]
      
      return { indicators, series }
    })
    
    // 方法
    const getDifferenceClass = (difference) => {
      if (Math.abs(difference) > 20) return 'difference-high'
      if (Math.abs(difference) > 10) return 'difference-medium'
      return 'difference-low'
    }
    
    const getDifferenceDescription = (difference) => {
      if (Math.abs(difference) > 20) return '差异显著'
      if (Math.abs(difference) > 10) return '差异明显'
      if (Math.abs(difference) > 5) return '差异较小'
      return '差异微小'
    }
    
    const loadTargetOptions = () => {
      if (!props.filterData || props.filterData.length === 0) {
        targetOptions.value = []
        return
      }
      
      const options = []
      
      switch (filterForm.dimension) {
        case 'class':
          const classes = [...new Set(props.filterData.map(row => parseFieldValue(row, '班级名称')).filter(Boolean))]
          classes.forEach(className => {
            options.push({ label: className, value: className })
          })
          break
        case 'course':
          const courses = [...new Set(props.filterData.map(row => parseFieldValue(row, '课程名称')).filter(Boolean))]
          courses.forEach(courseName => {
            options.push({ label: courseName, value: courseName })
          })
          break
        case 'time':
          const dates = [...new Set(props.filterData.map(row => parseFieldValue(row, '考试日期')).filter(Boolean))]
          dates.forEach(date => {
            options.push({ label: date, value: date })
          })
          break
        case 'student':
          const students = [...new Set(props.filterData.map(row => parseFieldValue(row, '学生姓名')).filter(Boolean))]
          students.forEach(studentName => {
            options.push({ label: studentName, value: studentName })
          })
          break
      }
      
      targetOptions.value = options
    }
    
    const calculateComparisonData = () => {
      if (!props.filterData || props.filterData.length === 0 || !filterForm.target1 || !filterForm.target2) {
        comparisonDetails.value = []
        return
      }
      
      // 筛选目标数据
      const target1Data = props.filterData.filter(row => {
        const value = parseFieldValue(row, getFieldName(filterForm.dimension))
        return value === filterForm.target1
      })
      
      const target2Data = props.filterData.filter(row => {
        const value = parseFieldValue(row, getFieldName(filterForm.dimension))
        return value === filterForm.target2
      })
      
      if (target1Data.length === 0 || target2Data.length === 0) {
        comparisonDetails.value = []
        return
      }
      
      // 计算各项指标
      const metrics = ['average', 'passRate', 'excellentRate', 'standardDeviation', 'maxScore', 'minScore']
      const details = []
      
      metrics.forEach(metric => {
        const target1Value = calculateMetric(target1Data, metric)
        const target2Value = calculateMetric(target2Data, metric)
        const difference = target1Value - target2Value
        const differenceRate = target2Value > 0 ? (difference / target2Value) * 100 : 0
        const advantage = difference > 0 ? 'target1' : 'target2'
        
        details.push({
          metric: getMetricName(metric),
          target1Value,
          target2Value,
          difference,
          differenceRate,
          advantage,
          analysis: getAnalysisText(metric, difference, advantage)
        })
      })
      
      comparisonDetails.value = details
      
      // 计算统计信息
      comparisonStats.totalComparisons = details.length
      comparisonStats.differenceLevel = details.reduce((sum, item) => sum + Math.abs(item.differenceRate), 0) / details.length
      comparisonStats.advantageCount = details.filter(item => item.advantage === 'target1').length
      comparisonStats.disadvantageCount = details.filter(item => item.advantage === 'target2').length
      
      // 生成优势和建议
      comparisonStats.advantages = []
      comparisonStats.suggestions = []
      
      details.forEach(item => {
        if (item.advantage === 'target1') {
          comparisonStats.advantages.push(`${item.metric}方面表现优秀，领先${Math.abs(item.difference).toFixed(1)}分`)
        } else {
          comparisonStats.suggestions.push(`需要加强${item.metric}方面的表现，差距${Math.abs(item.difference).toFixed(1)}分`)
        }
      })
    }
    
    const getFieldName = (dimension) => {
      switch (dimension) {
        case 'class': return '班级名称'
        case 'course': return '课程名称'
        case 'time': return '考试日期'
        case 'student': return '学生姓名'
        default: return '班级名称'
      }
    }
    
    const calculateMetric = (data, metric) => {
      const scores = data.map(row => parseFieldValue(row, '成绩')).filter(score => typeof score === 'number' && score > 0)
      
      if (scores.length === 0) return 0
      
      switch (metric) {
        case 'average':
          return scores.reduce((sum, score) => sum + score, 0) / scores.length
        case 'passRate':
          const passCount = scores.filter(score => score >= 60).length
          return (passCount / scores.length) * 100
        case 'excellentRate':
          const excellentCount = scores.filter(score => score >= 90).length
          return (excellentCount / scores.length) * 100
        case 'standardDeviation':
          if (scores.length < 2) return 0
          const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
          const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
          return Math.sqrt(variance)
        case 'maxScore':
          return Math.max(...scores)
        case 'minScore':
          return Math.min(...scores)
        default:
          return 0
      }
    }
    
    const getMetricName = (metric) => {
      const names = {
        average: '平均分',
        passRate: '及格率',
        excellentRate: '优秀率',
        standardDeviation: '标准差',
        maxScore: '最高分',
        minScore: '最低分'
      }
      return names[metric] || metric
    }
    
    const getAnalysisText = (metric, difference, advantage) => {
      const target = advantage === 'target1' ? '对象1' : '对象2'
      const absDiff = Math.abs(difference)
      
      if (absDiff < 5) {
        return `${target}在${getMetricName(metric)}方面表现相当`
      } else if (absDiff < 15) {
        return `${target}在${getMetricName(metric)}方面表现较好`
      } else {
        return `${target}在${getMetricName(metric)}方面表现突出`
      }
    }
    
    const updateRadarChart = () => {
      if (!radarChart || !radarData.value.indicators.length) return
      
      const option = {
        title: {
          text: '雷达图对比分析',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          data: ['对象1', '对象2'],
          bottom: 10
        },
        radar: {
          indicator: radarData.value.indicators,
          radius: '65%'
        },
        series: [
          {
            name: '对比分析',
            type: 'radar',
            data: radarData.value.series.map(series => ({
              name: series.name,
              value: series.data,
              areaStyle: {
                opacity: 0.3
              }
            }))
          }
        ]
      }
      
      radarChart.setOption(option)
    }
    
    const updateBarChart = () => {
      if (!barChart || !comparisonDetails.value.length) return
      
      const metrics = comparisonDetails.value.map(item => item.metric)
      const target1Data = comparisonDetails.value.map(item => item.target1Value)
      const target2Data = comparisonDetails.value.map(item => item.target2Value)
      
      const option = {
        title: {
          text: '柱状图对比分析',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['对象1', '对象2'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: metrics
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '对象1',
            type: 'bar',
            data: target1Data,
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '对象2',
            type: 'bar',
            data: target2Data,
            itemStyle: { color: '#67C23A' }
          }
        ]
      }
      
      barChart.setOption(option)
    }
    
    const handleDimensionChange = () => {
      filterForm.target1 = ''
      filterForm.target2 = ''
      loadTargetOptions()
      calculateComparisonData()
    }
    
    const handleFilterChange = () => {
      calculateComparisonData()
    }
    
    const exportRadarChart = () => {
      if (radarChart) {
        const url = radarChart.getDataURL()
        const link = document.createElement('a')
        link.download = '雷达图对比.png'
        link.href = url
        link.click()
        ElMessage.success('雷达图导出成功')
      }
    }
    
    const exportBarChart = () => {
      if (barChart) {
        const url = barChart.getDataURL()
        const link = document.createElement('a')
        link.download = '柱状图对比.png'
        link.href = url
        link.click()
        ElMessage.success('柱状图导出成功')
      }
    }
    
    const exportTable = () => {
      ElMessage.success('对比表格导出功能开发中')
    }
    
    const initCharts = () => {
      if (radarChartRef.value) {
        radarChart = echarts.init(radarChartRef.value)
      }
      if (barChartRef.value) {
        barChart = echarts.init(barChartRef.value)
      }
      updateRadarChart()
      updateBarChart()
    }
    
    // 监听数据变化
    watch(() => props.filterData, () => {
      loadTargetOptions()
      calculateComparisonData()
    }, { deep: true })
    
    watch(comparisonDetails, () => {
      nextTick(() => {
        updateRadarChart()
        updateBarChart()
      })
    }, { deep: true })
    
    // 生命周期
    onMounted(() => {
      loadTargetOptions()
      calculateComparisonData()
      nextTick(() => {
        initCharts()
      })
    })
    
    return {
      radarChartRef,
      barChartRef,
      filterForm,
      comparisonStats,
      comparisonDetails,
      targetOptions,
      getDifferenceClass,
      getDifferenceDescription,
      handleDimensionChange,
      handleFilterChange,
      exportRadarChart,
      exportBarChart,
      exportTable
    }
  }
}
</script>

<style scoped lang="less">
.comparison-analysis {
  .stats-overview {
    margin-bottom: 20px;
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
      
      &.trend-up {
        color: #67C23A;
      }
      
      &.trend-down {
        color: #F56C6C;
      }
      
      &.difference-high {
        color: #F56C6C;
      }
      
      &.difference-medium {
        color: #E6A23C;
      }
      
      &.difference-low {
        color: #67C23A;
      }
    }
    
    .stat-desc {
      font-size: 12px;
      color: #666;
    }
  }
  
  .filter-card {
    margin-bottom: 20px;
  }
  
  .charts-row {
    margin-bottom: 20px;
  }
  
  .chart-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chart-container {
      .chart {
        width: 100%;
      }
    }
  }
  
  .table-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .analysis-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .analysis-content {
      .analysis-section {
        margin-bottom: 20px;
        
        h4 {
          color: #409EFF;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        p {
          line-height: 1.6;
          margin-bottom: 10px;
          color: #333;
        }
        
        ul {
          padding-left: 20px;
          
          li {
            line-height: 1.6;
            margin-bottom: 5px;
            color: #666;
          }
        }
      }
    }
  }
  
  // 差异样式
  .difference-high {
    color: #F56C6C;
    font-weight: bold;
  }
  
  .difference-medium {
    color: #E6A23C;
    font-weight: bold;
  }
  
  .difference-low {
    color: #67C23A;
    font-weight: bold;
  }
  
  .value-highlight {
    font-weight: bold;
    color: #409EFF;
  }
}
</style> 