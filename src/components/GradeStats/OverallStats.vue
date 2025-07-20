<template>
  <div class="overall-stats">
    <!-- 综合统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>总成绩记录</span>
            </div>
          </template>
          <div class="stat-number">{{ overallStats.totalRecords }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>整体平均分</span>
            </div>
          </template>
          <div class="stat-number">{{ overallStats.averageScore.toFixed(1) }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>整体及格率</span>
            </div>
          </template>
          <div class="stat-number">{{ (overallStats.passRate * 100).toFixed(1) }}%</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>整体优秀率</span>
            </div>
          </template>
          <div class="stat-number">{{ (overallStats.excellentRate * 100).toFixed(1) }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 成绩趋势折线图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>成绩趋势分析</span>
              <el-button type="primary" size="small" @click="exportTrendChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="trendChartRef" class="chart" style="height: 350px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 成绩分布雷达图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>成绩分布雷达图</span>
              <el-button type="primary" size="small" @click="exportRadarChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="radarChartRef" class="chart" style="height: 350px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>详细统计信息</span>
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
      
      <el-descriptions :column="3" border>
        <el-descriptions-item label="总成绩记录数">
          {{ overallStats.totalRecords }}
        </el-descriptions-item>
        <el-descriptions-item label="有效成绩记录数">
          {{ overallStats.validRecords }}
        </el-descriptions-item>
        <el-descriptions-item label="参与学生数">
          {{ overallStats.totalStudents }}
        </el-descriptions-item>
        <el-descriptions-item label="参与班级数">
          {{ overallStats.totalClasses }}
        </el-descriptions-item>
        <el-descriptions-item label="参与课程数">
          {{ overallStats.totalCourses }}
        </el-descriptions-item>
        <el-descriptions-item label="数据完整性">
          {{ (overallStats.dataIntegrity * 100).toFixed(1) }}%
        </el-descriptions-item>
        <el-descriptions-item label="最高分">
          <span class="score-excellent">{{ overallStats.highestScore }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="最低分">
          <span class="score-poor">{{ overallStats.lowestScore }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="分数标准差">
          {{ overallStats.standardDeviation.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="中位数">
          {{ overallStats.median.toFixed(1) }}
        </el-descriptions-item>
        <el-descriptions-item label="众数">
          {{ overallStats.mode }}
        </el-descriptions-item>
        <el-descriptions-item label="分数范围">
          {{ overallStats.scoreRange }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 成绩等级分布表格 -->
    <el-card class="grade-distribution-card">
      <template #header>
        <div class="card-header">
          <span>成绩等级分布</span>
        </div>
      </template>
      
      <el-table :data="overallStats.gradeDistribution" stripe style="width: 100%">
        <el-table-column prop="grade" label="等级" width="120">
          <template #default="scope">
            <el-tag :type="getGradeTagType(scope.row.grade)">
              {{ scope.row.grade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="range" label="分数范围" width="120" />
        <el-table-column prop="count" label="人数" width="100" />
        <el-table-column prop="percentage" label="占比" width="100">
          <template #default="scope">
            {{ scope.row.percentage.toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
      </el-table>
    </el-card>

    <!-- 统计报告 -->
    <el-card class="report-card">
      <template #header>
        <div class="card-header">
          <span>统计报告</span>
          <el-button type="primary" size="small" @click="generateReport">
            <el-icon><Document /></el-icon>
            生成报告
          </el-button>
        </div>
      </template>
      
      <div class="report-content">
        <div class="report-section">
          <h4>整体表现分析</h4>
          <p>本次统计共包含 <strong>{{ overallStats.totalRecords }}</strong> 条成绩记录，
          涉及 <strong>{{ overallStats.totalStudents }}</strong> 名学生，
          <strong>{{ overallStats.totalClasses }}</strong> 个班级，
          <strong>{{ overallStats.totalCourses }}</strong> 门课程。</p>
          
          <p>整体平均分为 <strong>{{ overallStats.averageScore.toFixed(1) }}</strong> 分，
          及格率为 <strong>{{ (overallStats.passRate * 100).toFixed(1) }}%</strong>，
          优秀率为 <strong>{{ (overallStats.excellentRate * 100).toFixed(1) }}%</strong>。</p>
        </div>
        
        <div class="report-section">
          <h4>成绩分布特点</h4>
          <p>成绩分布的标准差为 <strong>{{ overallStats.standardDeviation.toFixed(2) }}</strong>，
          表明成绩的离散程度{{ overallStats.standardDeviation > 15 ? '较高' : '适中' }}。</p>
          
          <p>中位数为 <strong>{{ overallStats.median.toFixed(1) }}</strong> 分，
          众数为 <strong>{{ overallStats.mode }}</strong> 分，
          分数范围为 <strong>{{ overallStats.scoreRange }}</strong>。</p>
        </div>
        
        <div class="report-section">
          <h4>改进建议</h4>
          <ul>
            <li v-if="overallStats.passRate < 0.8">及格率偏低，建议加强基础教学</li>
            <li v-if="overallStats.excellentRate < 0.2">优秀率偏低，建议提高教学质量</li>
            <li v-if="overallStats.standardDeviation > 15">成绩差异较大，建议关注学习困难学生</li>
            <li v-if="overallStats.dataIntegrity < 0.9">数据完整性有待提高，建议完善数据录入</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Document } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { parseFieldValue } from '../../utils/fieldParser.js'

export default {
  name: 'OverallStats',
  components: {
    Download,
    Document
  },
  props: {
    filterData: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 响应式数据
    const trendChartRef = ref(null)
    const radarChartRef = ref(null)
    let trendChart = null
    let radarChart = null
    
    // 综合统计数据
    const overallStats = reactive({
      totalRecords: 0,
      validRecords: 0,
      totalStudents: 0,
      totalClasses: 0,
      totalCourses: 0,
      averageScore: 0,
      passRate: 0,
      excellentRate: 0,
      highestScore: 0,
      lowestScore: 100,
      standardDeviation: 0,
      median: 0,
      mode: 0,
      scoreRange: '',
      dataIntegrity: 0,
      gradeDistribution: []
    })
    
    // 方法
    const calculateOverallStats = () => {
      if (!props.filterData || props.filterData.length === 0) {
        return
      }
      
      // 提取所有有效成绩
      const allScores = props.filterData
        .map(row => parseFieldValue(row, '成绩'))
        .filter(score => typeof score === 'number' && score >= 0)
      
      if (allScores.length === 0) return
      
      // 基础统计
      overallStats.totalRecords = props.filterData.length
      overallStats.validRecords = allScores.length
      overallStats.averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length
      overallStats.highestScore = Math.max(...allScores)
      overallStats.lowestScore = Math.min(...allScores)
      overallStats.scoreRange = `${overallStats.lowestScore} - ${overallStats.highestScore}`
      
      // 及格率和优秀率
      const passCount = allScores.filter(score => score >= 60).length
      const excellentCount = allScores.filter(score => score >= 90).length
      overallStats.passRate = passCount / allScores.length
      overallStats.excellentRate = excellentCount / allScores.length
      
      // 标准差
      const variance = allScores.reduce((sum, score) => sum + Math.pow(score - overallStats.averageScore, 2), 0) / allScores.length
      overallStats.standardDeviation = Math.sqrt(variance)
      
      // 中位数
      const sortedScores = [...allScores].sort((a, b) => a - b)
      const mid = Math.floor(sortedScores.length / 2)
      overallStats.median = sortedScores.length % 2 === 0 
        ? (sortedScores[mid - 1] + sortedScores[mid]) / 2 
        : sortedScores[mid]
      
      // 众数
      const scoreCount = {}
      allScores.forEach(score => {
        scoreCount[score] = (scoreCount[score] || 0) + 1
      })
      const maxCount = Math.max(...Object.values(scoreCount))
      const modes = Object.keys(scoreCount).filter(score => scoreCount[score] === maxCount)
      overallStats.mode = modes.join(', ')
      
      // 统计学生、班级、课程数量
      const students = new Set()
      const classes = new Set()
      const courses = new Set()
      
      props.filterData.forEach(row => {
        const student = parseFieldValue(row, '学生')
        const className = parseFieldValue(row, '班级')
        const course = parseFieldValue(row, '课程')
        
        if (student) students.add(student)
        if (className) classes.add(className)
        if (course) courses.add(course)
      })
      
      overallStats.totalStudents = students.size
      overallStats.totalClasses = classes.size
      overallStats.totalCourses = courses.size
      
      // 数据完整性
      overallStats.dataIntegrity = overallStats.validRecords / overallStats.totalRecords
      
      // 成绩等级分布
      const gradeRanges = [
        { grade: '优秀', min: 90, max: 100, color: 'success' },
        { grade: '良好', min: 80, max: 89, color: 'warning' },
        { grade: '中等', min: 70, max: 79, color: 'danger' },
        { grade: '及格', min: 60, max: 69, color: 'info' },
        { grade: '不及格', min: 0, max: 59, color: 'danger' }
      ]
      
      overallStats.gradeDistribution = gradeRanges.map(range => {
        const count = allScores.filter(score => score >= range.min && score <= range.max).length
        return {
          grade: range.grade,
          range: `${range.min}-${range.max}`,
          count,
          percentage: (count / allScores.length) * 100,
          description: range.grade === '优秀' ? '表现优异，学习能力强' :
                      range.grade === '良好' ? '表现良好，有提升空间' :
                      range.grade === '中等' ? '表现一般，需要加强' :
                      range.grade === '及格' ? '勉强及格，需要努力' :
                      '不及格，需要重点关注'
        }
      })
      
      // 更新图表
      updateCharts()
    }
    
    const updateCharts = () => {
      updateTrendChart()
      updateRadarChart()
    }
    
    const updateTrendChart = () => {
      if (!trendChart || !props.filterData.length) return
      
      // 按时间分组（这里假设有考试日期字段）
      const timeGroups = {}
      props.filterData.forEach(row => {
        const date = parseFieldValue(row, '考试日期')
        const score = parseFieldValue(row, '成绩')
        
        if (date && typeof score === 'number' && score >= 0) {
          const month = date.substring(0, 7) // 取年月
          if (!timeGroups[month]) {
            timeGroups[month] = []
          }
          timeGroups[month].push(score)
        }
      })
      
      const months = Object.keys(timeGroups).sort()
      const averageScores = months.map(month => {
        const scores = timeGroups[month]
        return scores.reduce((sum, score) => sum + score, 0) / scores.length
      })
      
      const option = {
        title: {
          text: '成绩趋势分析',
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
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months,
          name: '时间'
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
            type: 'line',
            data: averageScores,
            smooth: true,
            lineStyle: {
              color: '#409EFF',
              width: 3
            },
            itemStyle: {
              color: '#409EFF'
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
            }
          }
        ]
      }
      
      trendChart.setOption(option)
    }
    
    const updateRadarChart = () => {
      if (!radarChart || !overallStats.gradeDistribution.length) return
      
      const indicator = overallStats.gradeDistribution.map(item => ({
        name: item.grade,
        max: 100
      }))
      
      const data = [{
        value: overallStats.gradeDistribution.map(item => item.percentage),
        name: '成绩分布'
      }]
      
      const option = {
        title: {
          text: '成绩分布雷达图',
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        radar: {
          indicator: indicator,
          radius: '65%'
        },
        series: [
          {
            name: '成绩分布',
            type: 'radar',
            data: data,
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            },
            lineStyle: {
              color: '#409EFF',
              width: 2
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      }
      
      radarChart.setOption(option)
    }
    
    const initCharts = () => {
      if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
      }
      if (radarChartRef.value) {
        radarChart = echarts.init(radarChartRef.value)
      }
      updateCharts()
    }
    
    const getGradeTagType = (grade) => {
      const typeMap = {
        '优秀': 'success',
        '良好': 'warning',
        '中等': 'danger',
        '及格': 'info',
        '不及格': 'danger'
      }
      return typeMap[grade] || 'info'
    }
    
    const exportTrendChart = () => {
      if (trendChart) {
        const url = trendChart.getDataURL()
        const link = document.createElement('a')
        link.download = '成绩趋势分析图.png'
        link.href = url
        link.click()
        ElMessage.success('趋势图导出成功')
      }
    }
    
    const exportRadarChart = () => {
      if (radarChart) {
        const url = radarChart.getDataURL()
        const link = document.createElement('a')
        link.download = '成绩分布雷达图.png'
        link.href = url
        link.click()
        ElMessage.success('雷达图导出成功')
      }
    }
    
    const exportAllCharts = () => {
      exportTrendChart()
      setTimeout(() => {
        exportRadarChart()
      }, 500)
      ElMessage.success('所有图表导出完成')
    }
    
    const exportTable = () => {
      // 这里可以实现表格导出功能
      ElMessage.success('表格导出功能开发中')
    }
    
    const generateReport = () => {
      // 这里可以实现报告生成功能
      ElMessage.success('报告生成功能开发中')
    }
    
    // 监听筛选数据变化
    watch(() => props.filterData, () => {
      calculateOverallStats()
    }, { deep: true })
    
    // 监听窗口大小变化
    const handleResize = () => {
      if (trendChart) {
        trendChart.resize()
      }
      if (radarChart) {
        radarChart.resize()
      }
    }
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initCharts()
        calculateOverallStats()
      })
      
      window.addEventListener('resize', handleResize)
    })
    
    return {
      trendChartRef,
      radarChartRef,
      overallStats,
      getGradeTagType,
      exportTrendChart,
      exportRadarChart,
      exportAllCharts,
      exportTable,
      generateReport
    }
  }
}
</script>

<style scoped lang="less">
.overall-stats {
  .stats-overview {
    margin-bottom: 20px;
    
    .stat-number {
      font-size: 28px;
      font-weight: bold;
      color: #409EFF;
      text-align: center;
      margin-bottom: 10px;
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
    margin-bottom: 20px;
    
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
  
  .grade-distribution-card {
    margin-bottom: 20px;
  }
  
  .report-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .report-content {
      .report-section {
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
  
  // 成绩等级样式
  .score-excellent {
    color: #67C23A;
    font-weight: bold;
  }
  
  .score-poor {
    color: #F56C6C;
    font-weight: bold;
  }
}
</style> 