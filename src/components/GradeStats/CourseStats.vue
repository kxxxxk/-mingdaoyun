<template>
  <div class="course-stats">
    <!-- 课程统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>课程数量</span>
            </div>
          </template>
          <div class="stat-number">{{ courseStats.totalCourses }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最高平均分</span>
            </div>
          </template>
          <div class="stat-number">{{ courseStats.highestAverage.toFixed(1) }}</div>
          <div class="stat-desc">{{ courseStats.highestCourse }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最低平均分</span>
            </div>
          </template>
          <div class="stat-number">{{ courseStats.lowestAverage.toFixed(1) }}</div>
          <div class="stat-desc">{{ courseStats.lowestCourse }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>平均及格率</span>
            </div>
          </template>
          <div class="stat-number">{{ (courseStats.averagePassRate * 100).toFixed(1) }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 课程平均分柱状图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>课程平均分对比</span>
              <el-button type="primary" size="small" @click="exportBarChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="barChartRef" class="chart" style="height: 350px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 成绩分布饼图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>成绩等级分布</span>
              <el-button type="primary" size="small" @click="exportPieChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="pieChartRef" class="chart" style="height: 350px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程详细统计表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>课程详细统计</span>
          <div class="header-actions">
            <el-button type="success" size="small" @click="exportTable">
              <el-icon><Download /></el-icon>
              导出表格
            </el-button>
            <el-button type="warning" size="small" @click="exportAllCharts">
              <el-icon><Download /></el-icon>
              导出所有图表
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="courseStats.details" stripe style="width: 100%">
        <el-table-column prop="courseName" label="课程名称" width="150" />
        <el-table-column prop="recordCount" label="成绩记录数" width="120" />
        <el-table-column prop="averageScore" label="平均分" width="100">
          <template #default="scope">
            <span :class="getScoreClass(scope.row.averageScore)">
              {{ scope.row.averageScore.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="highestScore" label="最高分" width="100" />
        <el-table-column prop="lowestScore" label="最低分" width="100" />
        <el-table-column prop="passRate" label="及格率" width="100">
          <template #default="scope">
            <span :class="getPassRateClass(scope.row.passRate)">
              {{ (scope.row.passRate * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="excellentRate" label="优秀率" width="100">
          <template #default="scope">
            <span :class="getExcellentRateClass(scope.row.excellentRate)">
              {{ (scope.row.excellentRate * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="standardDeviation" label="标准差" width="100">
          <template #default="scope">
            <span>{{ scope.row.standardDeviation.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewCourseDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`${selectedCourse.courseName} - 详细统计`"
      width="80%"
    >
      <CourseDetailStats :course-data="selectedCourse" />
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { parseFieldValue } from '../../utils/fieldParser.js'
import CourseDetailStats from './CourseDetailStats.vue'

export default {
  name: 'CourseStats',
  components: {
    CourseDetailStats,
    Download
  },
  props: {
    filterData: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 响应式数据
    const barChartRef = ref(null)
    const pieChartRef = ref(null)
    const detailDialogVisible = ref(false)
    const selectedCourse = ref({})
    let barChart = null
    let pieChart = null
    
    // 课程统计数据
    const courseStats = reactive({
      totalCourses: 0,
      highestAverage: 0,
      highestCourse: '',
      lowestAverage: 100,
      lowestCourse: '',
      averagePassRate: 0,
      details: []
    })
    
    // 方法
    const calculateCourseStats = () => {
      if (!props.filterData || props.filterData.length === 0) {
        return
      }
      
      // 按课程分组数据
      const courseGroups = {}
      
      props.filterData.forEach(row => {
        const courseName = parseFieldValue(row, '课程') || '未分类'
        const score = parseFieldValue(row, '成绩')
        
        if (!courseGroups[courseName]) {
          courseGroups[courseName] = {
            courseName,
            scores: []
          }
        }
        
        if (typeof score === 'number' && score >= 0) {
          courseGroups[courseName].scores.push(score)
        }
      })
      
      // 计算每个课程的统计数据
      const details = []
      let highestAverage = 0
      let highestCourse = ''
      let lowestAverage = 100
      let lowestCourse = ''
      let totalPassRate = 0
      let courseCount = 0
      
      Object.values(courseGroups).forEach(group => {
        const scores = group.scores
        if (scores.length === 0) return
        
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
        const highestScore = Math.max(...scores)
        const lowestScore = Math.min(...scores)
        const passCount = scores.filter(score => score >= 60).length
        const excellentCount = scores.filter(score => score >= 90).length
        const passRate = passCount / scores.length
        const excellentRate = excellentCount / scores.length
        
        // 计算标准差
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length
        const standardDeviation = Math.sqrt(variance)
        
        details.push({
          courseName: group.courseName,
          recordCount: scores.length,
          averageScore,
          highestScore,
          lowestScore,
          passRate,
          excellentRate,
          standardDeviation,
          scores
        })
        
        // 更新最高和最低平均分
        if (averageScore > highestAverage) {
          highestAverage = averageScore
          highestCourse = group.courseName
        }
        
        if (averageScore < lowestAverage) {
          lowestAverage = averageScore
          lowestCourse = group.courseName
        }
        
        totalPassRate += passRate
        courseCount++
      })
      
      // 按平均分排序
      details.sort((a, b) => b.averageScore - a.averageScore)
      
      // 更新统计数据
      courseStats.totalCourses = details.length
      courseStats.highestAverage = highestAverage
      courseStats.highestCourse = highestCourse
      courseStats.lowestAverage = lowestAverage
      courseStats.lowestCourse = lowestCourse
      courseStats.averagePassRate = courseCount > 0 ? totalPassRate / courseCount : 0
      courseStats.details = details
      
      // 更新图表
      updateCharts()
    }
    
    const updateCharts = () => {
      updateBarChart()
      updatePieChart()
    }
    
    const updateBarChart = () => {
      if (!barChart || !courseStats.details.length) return
      
      const chartData = courseStats.details.map(item => ({
        name: item.courseName,
        value: item.averageScore
      }))
      
      const option = {
        title: {
          text: '课程平均分对比',
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>平均分: ${data.value.toFixed(1)}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.map(item => item.name),
          axisLabel: {
            rotate: 45,
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          name: '平均分',
          min: 0,
          max: 100
        },
        series: [
          {
            name: '平均分',
            type: 'bar',
            data: chartData.map(item => item.value),
            itemStyle: {
              color: function(params) {
                const value = params.value
                if (value >= 90) return '#67C23A'
                if (value >= 80) return '#E6A23C'
                if (value >= 70) return '#F56C6C'
                return '#909399'
              }
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}'
            }
          }
        ]
      }
      
      barChart.setOption(option)
    }
    
    const updatePieChart = () => {
      if (!pieChart || !props.filterData.length) return
      
      // 计算成绩等级分布
      const allScores = props.filterData
        .map(row => parseFieldValue(row, '成绩'))
        .filter(score => typeof score === 'number' && score >= 0)
      
      const excellent = allScores.filter(score => score >= 90).length
      const good = allScores.filter(score => score >= 80 && score < 90).length
      const average = allScores.filter(score => score >= 70 && score < 80).length
      const pass = allScores.filter(score => score >= 60 && score < 70).length
      const fail = allScores.filter(score => score < 60).length
      
      const pieData = [
        { value: excellent, name: '优秀(90-100)', itemStyle: { color: '#67C23A' } },
        { value: good, name: '良好(80-89)', itemStyle: { color: '#E6A23C' } },
        { value: average, name: '中等(70-79)', itemStyle: { color: '#F56C6C' } },
        { value: pass, name: '及格(60-69)', itemStyle: { color: '#909399' } },
        { value: fail, name: '不及格(<60)', itemStyle: { color: '#F56C6C' } }
      ].filter(item => item.value > 0)
      
      const option = {
        title: {
          text: '成绩等级分布',
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle'
        },
        series: [
          {
            name: '成绩等级',
            type: 'pie',
            radius: '50%',
            center: ['60%', '50%'],
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c} ({d}%)'
            }
          }
        ]
      }
      
      pieChart.setOption(option)
    }
    
    const initCharts = () => {
      if (barChartRef.value) {
        barChart = echarts.init(barChartRef.value)
      }
      if (pieChartRef.value) {
        pieChart = echarts.init(pieChartRef.value)
      }
      updateCharts()
    }
    
    const getScoreClass = (score) => {
      if (score >= 90) return 'score-excellent'
      if (score >= 80) return 'score-good'
      if (score >= 70) return 'score-average'
      return 'score-poor'
    }
    
    const getPassRateClass = (rate) => {
      if (rate >= 0.9) return 'rate-excellent'
      if (rate >= 0.8) return 'rate-good'
      if (rate >= 0.6) return 'rate-average'
      return 'rate-poor'
    }
    
    const getExcellentRateClass = (rate) => {
      if (rate >= 0.3) return 'rate-excellent'
      if (rate >= 0.2) return 'rate-good'
      if (rate >= 0.1) return 'rate-average'
      return 'rate-poor'
    }
    
    const viewCourseDetail = (courseData) => {
      selectedCourse.value = courseData
      detailDialogVisible.value = true
    }
    
    const exportBarChart = () => {
      if (barChart) {
        const url = barChart.getDataURL()
        const link = document.createElement('a')
        link.download = '课程平均分对比图.png'
        link.href = url
        link.click()
        ElMessage.success('柱状图导出成功')
      }
    }
    
    const exportPieChart = () => {
      if (pieChart) {
        const url = pieChart.getDataURL()
        const link = document.createElement('a')
        link.download = '成绩等级分布图.png'
        link.href = url
        link.click()
        ElMessage.success('饼图导出成功')
      }
    }
    
    const exportAllCharts = () => {
      exportBarChart()
      setTimeout(() => {
        exportPieChart()
      }, 500)
      ElMessage.success('所有图表导出完成')
    }
    
    const exportTable = () => {
      // 这里可以实现表格导出功能
      ElMessage.success('表格导出功能开发中')
    }
    
    // 监听筛选数据变化
    watch(() => props.filterData, () => {
      calculateCourseStats()
    }, { deep: true })
    
    // 监听窗口大小变化
    const handleResize = () => {
      if (barChart) {
        barChart.resize()
      }
      if (pieChart) {
        pieChart.resize()
      }
    }
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initCharts()
        calculateCourseStats()
      })
      
      window.addEventListener('resize', handleResize)
    })
    
    return {
      barChartRef,
      pieChartRef,
      detailDialogVisible,
      selectedCourse,
      courseStats,
      getScoreClass,
      getPassRateClass,
      getExcellentRateClass,
      viewCourseDetail,
      exportBarChart,
      exportPieChart,
      exportAllCharts,
      exportTable
    }
  }
}
</script>

<style scoped lang="less">
.course-stats {
  .stats-overview {
    margin-bottom: 20px;
    
    .stat-number {
      font-size: 28px;
      font-weight: bold;
      color: #409EFF;
      text-align: center;
      margin-bottom: 10px;
    }
    
    .stat-desc {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
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
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
  
  // 成绩等级样式
  .score-excellent {
    color: #67C23A;
    font-weight: bold;
  }
  
  .score-good {
    color: #E6A23C;
    font-weight: bold;
  }
  
  .score-average {
    color: #F56C6C;
    font-weight: bold;
  }
  
  .score-poor {
    color: #909399;
    font-weight: bold;
  }
  
  // 比率等级样式
  .rate-excellent {
    color: #67C23A;
    font-weight: bold;
  }
  
  .rate-good {
    color: #E6A23C;
    font-weight: bold;
  }
  
  .rate-average {
    color: #F56C6C;
    font-weight: bold;
  }
  
  .rate-poor {
    color: #909399;
    font-weight: bold;
  }
}
</style> 