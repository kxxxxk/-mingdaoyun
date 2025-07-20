<template>
  <div class="class-stats">
    <!-- 班级统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>班级数量</span>
            </div>
          </template>
          <div class="stat-number">{{ classStats.totalClasses }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最高平均分</span>
            </div>
          </template>
          <div class="stat-number">{{ classStats.highestAverage.toFixed(1) }}</div>
          <div class="stat-desc">{{ classStats.highestClass }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最低平均分</span>
            </div>
          </template>
          <div class="stat-number">{{ classStats.lowestAverage.toFixed(1) }}</div>
          <div class="stat-desc">{{ classStats.lowestClass }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 班级平均分柱状图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>班级平均分对比</span>
          <el-button type="primary" size="small" @click="exportChart">
            <el-icon><Download /></el-icon>
            导出图表
          </el-button>
        </div>
      </template>
      
      <div class="chart-container">
        <div ref="barChartRef" class="chart" style="height: 400px;"></div>
      </div>
    </el-card>

    <!-- 班级详细统计表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>班级详细统计</span>
          <el-button type="success" size="small" @click="exportTable">
            <el-icon><Download /></el-icon>
            导出表格
          </el-button>
        </div>
      </template>
      
      <el-table :data="classStats.details" stripe style="width: 100%">
        <el-table-column prop="className" label="班级名称" width="150" />
        <el-table-column prop="studentCount" label="学生人数" width="100" />
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
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewClassDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 班级详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`${selectedClass.className} - 详细统计`"
      width="80%"
    >
      <ClassDetailStats :class-data="selectedClass" />
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { parseFieldValue } from '../../utils/fieldParser.js'
import ClassDetailStats from './ClassDetailStats.vue'

export default {
  name: 'ClassStats',
  components: {
    ClassDetailStats,
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
    const detailDialogVisible = ref(false)
    const selectedClass = ref({})
    let barChart = null
    
    // 班级统计数据
    const classStats = reactive({
      totalClasses: 0,
      highestAverage: 0,
      highestClass: '',
      lowestAverage: 100,
      lowestClass: '',
      details: []
    })
    
    // 方法
    const calculateClassStats = () => {
      if (!props.filterData || props.filterData.length === 0) {
        return
      }
      
      // 按班级分组数据
      const classGroups = {}
      
      props.filterData.forEach(row => {
        const className = parseFieldValue(row, '班级') || '未分类'
        const score = parseFieldValue(row, '成绩')
        
        if (!classGroups[className]) {
          classGroups[className] = {
            className,
            scores: [],
            studentIds: new Set()
          }
        }
        
        if (typeof score === 'number' && score >= 0) {
          classGroups[className].scores.push(score)
        }
        
        // 统计学生数量（去重）
        const studentId = parseFieldValue(row, '学生')
        if (studentId) {
          classGroups[className].studentIds.add(studentId)
        }
      })
      
      // 计算每个班级的统计数据
      const details = []
      let highestAverage = 0
      let highestClass = ''
      let lowestAverage = 100
      let lowestClass = ''
      
      Object.values(classGroups).forEach(group => {
        const scores = group.scores
        if (scores.length === 0) return
        
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
        const highestScore = Math.max(...scores)
        const lowestScore = Math.min(...scores)
        const passCount = scores.filter(score => score >= 60).length
        const excellentCount = scores.filter(score => score >= 90).length
        const passRate = passCount / scores.length
        const excellentRate = excellentCount / scores.length
        
        details.push({
          className: group.className,
          studentCount: group.studentIds.size,
          recordCount: scores.length,
          averageScore,
          highestScore,
          lowestScore,
          passRate,
          excellentRate,
          scores
        })
        
        // 更新最高和最低平均分
        if (averageScore > highestAverage) {
          highestAverage = averageScore
          highestClass = group.className
        }
        
        if (averageScore < lowestAverage) {
          lowestAverage = averageScore
          lowestClass = group.className
        }
      })
      
      // 按平均分排序
      details.sort((a, b) => b.averageScore - a.averageScore)
      
      // 更新统计数据
      classStats.totalClasses = details.length
      classStats.highestAverage = highestAverage
      classStats.highestClass = highestClass
      classStats.lowestAverage = lowestAverage
      classStats.lowestClass = lowestClass
      classStats.details = details
      
      // 更新图表
      updateChart()
    }
    
    const updateChart = () => {
      if (!barChart || !classStats.details.length) return
      
      const chartData = classStats.details.map(item => ({
        name: item.className,
        value: item.averageScore
      }))
      
      const option = {
        title: {
          text: '班级平均分对比',
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
          data: chartData.map(item => item.name),
          axisLabel: {
            rotate: 45,
            fontSize: 12
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
    
    const initChart = () => {
      if (barChartRef.value) {
        barChart = echarts.init(barChartRef.value)
        updateChart()
      }
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
    
    const viewClassDetail = (classData) => {
      selectedClass.value = classData
      detailDialogVisible.value = true
    }
    
    const exportChart = () => {
      if (barChart) {
        const url = barChart.getDataURL()
        const link = document.createElement('a')
        link.download = '班级平均分对比图.png'
        link.href = url
        link.click()
        ElMessage.success('图表导出成功')
      }
    }
    
    const exportTable = () => {
      // 这里可以实现表格导出功能
      ElMessage.success('表格导出功能开发中')
    }
    
    // 监听筛选数据变化
    watch(() => props.filterData, () => {
      calculateClassStats()
    }, { deep: true })
    
    // 监听窗口大小变化
    const handleResize = () => {
      if (barChart) {
        barChart.resize()
      }
    }
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initChart()
        calculateClassStats()
      })
      
      window.addEventListener('resize', handleResize)
    })
    
    return {
      barChartRef,
      detailDialogVisible,
      selectedClass,
      classStats,
      getScoreClass,
      getPassRateClass,
      getExcellentRateClass,
      viewClassDetail,
      exportChart,
      exportTable
    }
  }
}
</script>

<style scoped lang="less">
.class-stats {
  .stats-overview {
    margin-bottom: 20px;
    
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #409EFF;
      text-align: center;
      margin-bottom: 10px;
    }
    
    .stat-desc {
      font-size: 14px;
      color: #666;
      text-align: center;
    }
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