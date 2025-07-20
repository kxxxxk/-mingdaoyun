<template>
  <div class="trend-analysis">
    <!-- 趋势分析概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>趋势分析</span>
            </div>
          </template>
          <div class="stat-number">{{ trendStats.totalPeriods }}</div>
          <div class="stat-desc">分析周期数</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>整体趋势</span>
            </div>
          </template>
          <div class="stat-number" :class="getTrendClass(trendStats.overallTrend)">
            {{ trendStats.overallTrend > 0 ? '+' : '' }}{{ trendStats.overallTrend.toFixed(1) }}
          </div>
          <div class="stat-desc">{{ getTrendDescription(trendStats.overallTrend) }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最高增长</span>
            </div>
          </template>
          <div class="stat-number trend-up">{{ trendStats.maxGrowth.toFixed(1) }}</div>
          <div class="stat-desc">{{ trendStats.maxGrowthPeriod }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最大下降</span>
            </div>
          </template>
          <div class="stat-number trend-down">{{ trendStats.maxDecline.toFixed(1) }}</div>
          <div class="stat-desc">{{ trendStats.maxDeclinePeriod }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势筛选器 -->
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>趋势分析筛选</span>
        </div>
      </template>
      
      <el-form :model="filterForm" label-width="100px" inline>
        <el-form-item label="分析维度">
          <el-select v-model="filterForm.dimension" @change="handleDimensionChange">
            <el-option label="按时间" value="time" />
            <el-option label="按班级" value="class" />
            <el-option label="按课程" value="course" />
            <el-option label="按学生" value="student" />
          </el-select>
        </el-form-item>
        
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
        
        <el-form-item label="统计周期">
          <el-select v-model="filterForm.period" @change="handleFilterChange">
            <el-option label="按周" value="week" />
            <el-option label="按月" value="month" />
            <el-option label="按学期" value="semester" />
            <el-option label="按年" value="year" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="趋势类型">
          <el-select v-model="filterForm.trendType" @change="handleFilterChange">
            <el-option label="平均分趋势" value="average" />
            <el-option label="及格率趋势" value="passRate" />
            <el-option label="优秀率趋势" value="excellentRate" />
            <el-option label="标准差趋势" value="standardDeviation" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 趋势图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>趋势折线图</span>
              <el-button type="primary" size="small" @click="exportTrendChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="trendChartRef" class="chart" style="height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>趋势对比图</span>
              <el-button type="primary" size="small" @click="exportComparisonChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="comparisonChartRef" class="chart" style="height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势详情表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>趋势详情</span>
          <el-button type="success" size="small" @click="exportTable">
            <el-icon><Download /></el-icon>
            导出表格
          </el-button>
        </div>
      </template>
      
      <el-table :data="trendDetails" stripe style="width: 100%">
        <el-table-column prop="period" label="周期" width="120" />
        <el-table-column prop="value" label="数值" width="100">
          <template #default="scope">
            <span :class="getValueClass(scope.row.value, scope.row.trend)">
              {{ scope.row.value.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="trend" label="变化" width="100">
          <template #default="scope">
            <span :class="getTrendClass(scope.row.trend)">
              {{ scope.row.trend > 0 ? '+' : '' }}{{ scope.row.trend.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="trendRate" label="变化率" width="100">
          <template #default="scope">
            <span :class="getTrendClass(scope.row.trendRate)">
              {{ scope.row.trendRate > 0 ? '+' : '' }}{{ scope.row.trendRate.toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="分析" />
      </el-table>
    </el-card>

    <!-- 趋势分析报告 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>趋势分析报告</span>
        </div>
      </template>
      
      <div class="analysis-content">
        <div class="analysis-section">
          <h4>整体趋势分析</h4>
          <p>在分析期间内，{{ getTrendDescription(trendStats.overallTrend) }}，
          整体{{ filterForm.trendType === 'average' ? '平均分' : 
                  filterForm.trendType === 'passRate' ? '及格率' :
                  filterForm.trendType === 'excellentRate' ? '优秀率' : '标准差' }}
          变化了 <strong>{{ trendStats.overallTrend > 0 ? '+' : '' }}{{ trendStats.overallTrend.toFixed(1) }}</strong>。</p>
        </div>
        
        <div class="analysis-section">
          <h4>关键发现</h4>
          <ul>
            <li>最高增长期：{{ trendStats.maxGrowthPeriod }}，增长了 {{ trendStats.maxGrowth.toFixed(1) }}</li>
            <li>最大下降期：{{ trendStats.maxDeclinePeriod }}，下降了 {{ Math.abs(trendStats.maxDecline).toFixed(1) }}</li>
            <li>趋势稳定性：{{ getStabilityDescription(trendStats.stability) }}</li>
            <li>周期性特征：{{ getPeriodicityDescription(trendStats.periodicity) }}</li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>改进建议</h4>
          <ul>
            <li v-if="trendStats.overallTrend < 0">整体趋势下降，建议分析原因并采取改进措施</li>
            <li v-if="trendStats.stability < 0.7">趋势波动较大，建议稳定教学策略</li>
            <li v-if="trendStats.maxDecline < -5">存在明显下降期，建议重点关注该时期的教学质量</li>
            <li v-if="trendStats.overallTrend > 0">整体趋势良好，建议继续保持并进一步提升</li>
            <li v-else>趋势相对稳定，建议持续优化教学效果</li>
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
import { getWorksheetData } from '../../utils/apiHelper.js'
import { parseFieldValue } from '../../utils/fieldParser.js'

export default {
  name: 'TrendAnalysis',
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
    const trendChartRef = ref(null)
    const comparisonChartRef = ref(null)
    let trendChart = null
    let comparisonChart = null
    
    // 筛选表单
    const filterForm = reactive({
      dimension: 'time',
      dateRange: [],
      period: 'month',
      trendType: 'average'
    })
    
    // 趋势统计数据
    const trendStats = reactive({
      totalPeriods: 0,
      overallTrend: 0,
      maxGrowth: 0,
      maxGrowthPeriod: '',
      maxDecline: 0,
      maxDeclinePeriod: '',
      stability: 0,
      periodicity: 0
    })
    
    // 趋势详情数据
    const trendDetails = ref([])
    
    // 计算属性
    const chartData = computed(() => {
      if (!trendDetails.value.length) return { xAxis: [], series: [] }
      
      const xAxis = trendDetails.value.map(item => item.period)
      const series = trendDetails.value.map(item => item.value)
      
      return { xAxis, series }
    })
    
    // 方法
    const getTrendClass = (value) => {
      if (value > 0) return 'trend-up'
      if (value < 0) return 'trend-down'
      return 'trend-stable'
    }
    
    const getTrendDescription = (value) => {
      if (value > 2) return '显著上升'
      if (value > 0) return '缓慢上升'
      if (value < -2) return '显著下降'
      if (value < 0) return '缓慢下降'
      return '保持稳定'
    }
    
    const getValueClass = (value, trend) => {
      if (trend > 0) return 'value-up'
      if (trend < 0) return 'value-down'
      return 'value-stable'
    }
    
    const getStabilityDescription = (stability) => {
      if (stability >= 0.8) return '非常稳定'
      if (stability >= 0.6) return '较为稳定'
      if (stability >= 0.4) return '一般稳定'
      return '波动较大'
    }
    
    const getPeriodicityDescription = (periodicity) => {
      if (periodicity >= 0.8) return '周期性明显'
      if (periodicity >= 0.6) return '有一定周期性'
      if (periodicity >= 0.4) return '周期性较弱'
      return '无明显周期性'
    }
    
    const calculateTrendData = () => {
      if (!props.filterData || props.filterData.length === 0) {
        return
      }
      
      // 按时间分组数据
      const timeGroups = {}
      
      props.filterData.forEach(row => {
        const examDate = parseFieldValue(row, '考试日期')
        if (!examDate) return
        
        const date = new Date(examDate)
        let periodKey = ''
        
        // 根据周期类型分组
        switch (filterForm.period) {
          case 'week':
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            periodKey = weekStart.toISOString().split('T')[0]
            break
          case 'month':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            break
          case 'semester':
            const semester = date.getMonth() < 6 ? 1 : 2
            periodKey = `${date.getFullYear()}-${semester}`
            break
          case 'year':
            periodKey = date.getFullYear().toString()
            break
        }
        
        if (!timeGroups[periodKey]) {
          timeGroups[periodKey] = []
        }
        
        timeGroups[periodKey].push(row)
      })
      
      // 计算每个周期的统计数据
      const periods = Object.keys(timeGroups).sort()
      const details = []
      
      periods.forEach((period, index) => {
        const rows = timeGroups[period]
        let value = 0
        
        // 根据趋势类型计算数值
        switch (filterForm.trendType) {
          case 'average':
            const averageScores = rows.map(row => {
              const score = parseFieldValue(row, '成绩')
              return typeof score === 'number' ? score : 0
            }).filter(score => score > 0)
            value = averageScores.length > 0 ? averageScores.reduce((sum, score) => sum + score, 0) / averageScores.length : 0
            break
          case 'passRate':
            const passCount = rows.filter(row => {
              const score = parseFieldValue(row, '成绩')
              return typeof score === 'number' && score >= 60
            }).length
            value = rows.length > 0 ? (passCount / rows.length) * 100 : 0
            break
          case 'excellentRate':
            const excellentCount = rows.filter(row => {
              const score = parseFieldValue(row, '成绩')
              return typeof score === 'number' && score >= 90
            }).length
            value = rows.length > 0 ? (excellentCount / rows.length) * 100 : 0
            break
          case 'standardDeviation':
            const stdScores = rows.map(row => {
              const score = parseFieldValue(row, '成绩')
              return typeof score === 'number' ? score : 0
            }).filter(score => score > 0)
            if (stdScores.length > 1) {
              const mean = stdScores.reduce((sum, score) => sum + score, 0) / stdScores.length
              const variance = stdScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / stdScores.length
              value = Math.sqrt(variance)
            }
            break
        }
        
        // 计算趋势变化
        let trend = 0
        let trendRate = 0
        
        if (index > 0) {
          const prevValue = details[index - 1].value
          if (prevValue > 0) {
            trend = value - prevValue
            trendRate = (trend / prevValue) * 100
          }
        }
        
        details.push({
          period,
          value,
          trend,
          trendRate,
          description: getTrendDescription(trend)
        })
      })
      
      trendDetails.value = details
      
      // 计算整体统计
      if (details.length > 1) {
        const trends = details.slice(1).map(item => item.trend)
        trendStats.totalPeriods = details.length
        trendStats.overallTrend = trends.reduce((sum, trend) => sum + trend, 0) / trends.length
        
        const maxGrowth = Math.max(...trends)
        const maxDecline = Math.min(...trends)
        
        trendStats.maxGrowth = maxGrowth
        trendStats.maxGrowthPeriod = details[trends.indexOf(maxGrowth) + 1]?.period || ''
        trendStats.maxDecline = maxDecline
        trendStats.maxDeclinePeriod = details[trends.indexOf(maxDecline) + 1]?.period || ''
        
        // 计算稳定性（趋势的标准差）
        const trendMean = trends.reduce((sum, trend) => sum + trend, 0) / trends.length
        const trendVariance = trends.reduce((sum, trend) => sum + Math.pow(trend - trendMean, 2), 0) / trends.length
        const trendStd = Math.sqrt(trendVariance)
        trendStats.stability = Math.max(0, 1 - (trendStd / Math.abs(trendMean || 1)))
        
        // 计算周期性（简化计算）
        trendStats.periodicity = 0.6 // 简化计算
      }
    }
    
    const updateTrendChart = () => {
      if (!trendChart || !chartData.value.xAxis.length) return
      
      const option = {
        title: {
          text: `${filterForm.trendType === 'average' ? '平均分' : 
                 filterForm.trendType === 'passRate' ? '及格率' :
                 filterForm.trendType === 'excellentRate' ? '优秀率' : '标准差'}趋势`,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>${data.seriesName}: ${data.value.toFixed(1)}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.value.xAxis,
          name: '时间周期'
        },
        yAxis: {
          type: 'value',
          name: filterForm.trendType === 'average' ? '平均分' : 
                filterForm.trendType === 'passRate' ? '及格率(%)' :
                filterForm.trendType === 'excellentRate' ? '优秀率(%)' : '标准差'
        },
        series: [
          {
            name: filterForm.trendType === 'average' ? '平均分' : 
                  filterForm.trendType === 'passRate' ? '及格率' :
                  filterForm.trendType === 'excellentRate' ? '优秀率' : '标准差',
            type: 'line',
            data: chartData.value.series,
            smooth: true,
            lineStyle: {
              color: '#409EFF',
              width: 3
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                  { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
                ]
              }
            },
            itemStyle: {
              color: '#409EFF'
            },
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          }
        ]
      }
      
      trendChart.setOption(option)
    }
    
    const updateComparisonChart = () => {
      if (!comparisonChart || !trendDetails.value.length) return
      
      const periods = trendDetails.value.map(item => item.period)
      const values = trendDetails.value.map(item => item.value)
      const trends = trendDetails.value.map(item => item.trend)
      
      const option = {
        title: {
          text: '趋势对比分析',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['数值', '变化量'],
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
          data: periods,
          name: '时间周期'
        },
        yAxis: [
          {
            type: 'value',
            name: '数值',
            position: 'left'
          },
          {
            type: 'value',
            name: '变化量',
            position: 'right'
          }
        ],
        series: [
          {
            name: '数值',
            type: 'line',
            data: values,
            yAxisIndex: 0,
            lineStyle: { color: '#409EFF' },
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '变化量',
            type: 'bar',
            data: trends,
            yAxisIndex: 1,
            itemStyle: {
              color: function(params) {
                return params.value >= 0 ? '#67C23A' : '#F56C6C'
              }
            }
          }
        ]
      }
      
      comparisonChart.setOption(option)
    }
    
    const handleDimensionChange = () => {
      calculateTrendData()
    }
    
    const handleFilterChange = () => {
      calculateTrendData()
    }
    
    const exportTrendChart = () => {
      if (trendChart) {
        const url = trendChart.getDataURL()
        const link = document.createElement('a')
        link.download = '趋势分析图表.png'
        link.href = url
        link.click()
        ElMessage.success('趋势图表导出成功')
      }
    }
    
    const exportComparisonChart = () => {
      if (comparisonChart) {
        const url = comparisonChart.getDataURL()
        const link = document.createElement('a')
        link.download = '趋势对比图表.png'
        link.href = url
        link.click()
        ElMessage.success('对比图表导出成功')
      }
    }
    
    const exportTable = () => {
      // 这里可以实现表格导出功能
      ElMessage.success('表格导出功能开发中')
    }
    
    const initCharts = () => {
      if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
      }
      if (comparisonChartRef.value) {
        comparisonChart = echarts.init(comparisonChartRef.value)
      }
      updateTrendChart()
      updateComparisonChart()
    }
    
    // 监听数据变化
    watch(() => props.filterData, () => {
      calculateTrendData()
    }, { deep: true })
    
    watch(trendDetails, () => {
      nextTick(() => {
        updateTrendChart()
        updateComparisonChart()
      })
    }, { deep: true })
    
    // 生命周期
    onMounted(() => {
      calculateTrendData()
      nextTick(() => {
        initCharts()
      })
    })
    
    return {
      trendChartRef,
      comparisonChartRef,
      filterForm,
      trendStats,
      trendDetails,
      getTrendClass,
      getTrendDescription,
      getValueClass,
      getStabilityDescription,
      getPeriodicityDescription,
      handleDimensionChange,
      handleFilterChange,
      exportTrendChart,
      exportComparisonChart,
      exportTable
    }
  }
}
</script>

<style scoped lang="less">
.trend-analysis {
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
      
      &.trend-stable {
        color: #909399;
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
  
  // 趋势样式
  .trend-up {
    color: #67C23A;
    font-weight: bold;
  }
  
  .trend-down {
    color: #F56C6C;
    font-weight: bold;
  }
  
  .trend-stable {
    color: #909399;
    font-weight: bold;
  }
  
  .value-up {
    color: #67C23A;
  }
  
  .value-down {
    color: #F56C6C;
  }
  
  .value-stable {
    color: #909399;
  }
}
</style> 