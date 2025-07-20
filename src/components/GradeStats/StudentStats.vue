<template>
  <div class="student-stats">
    <!-- 学生统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>学生数量</span>
            </div>
          </template>
          <div class="stat-number">{{ studentStats.totalStudents }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最高分学生</span>
            </div>
          </template>
          <div class="stat-number">{{ studentStats.highestScore }}</div>
          <div class="stat-desc">{{ studentStats.highestStudent }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>平均分最高</span>
            </div>
          </template>
          <div class="stat-number">{{ studentStats.highestAverage.toFixed(1) }}</div>
          <div class="stat-desc">{{ studentStats.highestAverageStudent }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>优秀学生数</span>
            </div>
          </template>
          <div class="stat-number">{{ studentStats.excellentCount }}</div>
          <div class="stat-desc">平均分≥90分</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 学生成绩分布直方图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>学生成绩分布</span>
              <el-button type="primary" size="small" @click="exportHistogram">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="histogramRef" class="chart" style="height: 350px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 学生排名散点图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>学生排名分布</span>
              <el-button type="primary" size="small" @click="exportScatter">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="scatterRef" class="chart" style="height: 350px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 学生排名表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>学生成绩排名</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学生姓名"
              style="width: 200px; margin-right: 10px"
              clearable
              @input="handleSearch"
            />
            <el-select
              v-model="sortBy"
              placeholder="排序方式"
              style="width: 150px; margin-right: 10px"
              @change="handleSort"
            >
              <el-option label="按平均分排序" value="average" />
              <el-option label="按总分排序" value="total" />
              <el-option label="按课程数排序" value="courseCount" />
            </el-select>
            <el-button type="success" size="small" @click="exportTable">
              <el-icon><Download /></el-icon>
              导出表格
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredStudentList" stripe style="width: 100%">
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="courseCount" label="课程数" width="100" />
        <el-table-column prop="totalScore" label="总分" width="100" />
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
            <el-button type="primary" size="small" @click="viewStudentDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 学生详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`${selectedStudent.studentName} - 详细成绩`"
      width="80%"
    >
      <StudentDetailStats :student-data="selectedStudent" />
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { parseFieldValue } from '../../utils/fieldParser.js'


export default {
  name: 'StudentStats',
  components: {
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
    const histogramRef = ref(null)
    const scatterRef = ref(null)
    const detailDialogVisible = ref(false)
    const selectedStudent = ref({})
    const searchKeyword = ref('')
    const sortBy = ref('average')
    let histogram = null
    let scatter = null
    
    // 学生统计数据
    const studentStats = reactive({
      totalStudents: 0,
      highestScore: 0,
      highestStudent: '',
      highestAverage: 0,
      highestAverageStudent: '',
      excellentCount: 0,
      details: []
    })
    
    // 计算属性
    const filteredStudentList = computed(() => {
      let list = [...studentStats.details]
      
      // 搜索过滤
      if (searchKeyword.value) {
        list = list.filter(student => 
          student.studentName.toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
      }
      
      return list
    })
    
    // 方法
    const calculateStudentStats = () => {
      if (!props.filterData || props.filterData.length === 0) {
        return
      }
      
      // 按学生分组数据
      const studentGroups = {}
      
      props.filterData.forEach(row => {
        const studentName = parseFieldValue(row, '学生') || '未知学生'
        const className = parseFieldValue(row, '班级') || '未分类'
        const score = parseFieldValue(row, '成绩')
        
        if (!studentGroups[studentName]) {
          studentGroups[studentName] = {
            studentName,
            className,
            scores: []
          }
        }
        
        if (typeof score === 'number' && score >= 0) {
          studentGroups[studentName].scores.push(score)
        }
      })
      
      // 计算每个学生的统计数据
      const details = []
      let highestScore = 0
      let highestStudent = ''
      let highestAverage = 0
      let highestAverageStudent = ''
      let excellentCount = 0
      
      Object.values(studentGroups).forEach(group => {
        const scores = group.scores
        if (scores.length === 0) return
        
        const totalScore = scores.reduce((sum, score) => sum + score, 0)
        const averageScore = totalScore / scores.length
        const highestScoreInGroup = Math.max(...scores)
        const lowestScoreInGroup = Math.min(...scores)
        const passCount = scores.filter(score => score >= 60).length
        const excellentCountInGroup = scores.filter(score => score >= 90).length
        const passRate = passCount / scores.length
        const excellentRate = excellentCountInGroup / scores.length
        
        details.push({
          studentName: group.studentName,
          className: group.className,
          courseCount: scores.length,
          totalScore,
          averageScore,
          highestScore: highestScoreInGroup,
          lowestScore: lowestScoreInGroup,
          passRate,
          excellentRate,
          scores
        })
        
        // 更新最高分
        if (highestScoreInGroup > highestScore) {
          highestScore = highestScoreInGroup
          highestStudent = group.studentName
        }
        
        // 更新最高平均分
        if (averageScore > highestAverage) {
          highestAverage = averageScore
          highestAverageStudent = group.studentName
        }
        
        // 统计优秀学生
        if (averageScore >= 90) {
          excellentCount++
        }
      })
      
      // 排序并添加排名
      sortStudentList(details)
      
      // 更新统计数据
      studentStats.totalStudents = details.length
      studentStats.highestScore = highestScore
      studentStats.highestStudent = highestStudent
      studentStats.highestAverage = highestAverage
      studentStats.highestAverageStudent = highestAverageStudent
      studentStats.excellentCount = excellentCount
      studentStats.details = details
      
      // 更新图表
      updateCharts()
    }
    
    const sortStudentList = (list) => {
      switch (sortBy.value) {
        case 'average':
          list.sort((a, b) => b.averageScore - a.averageScore)
          break
        case 'total':
          list.sort((a, b) => b.totalScore - a.totalScore)
          break
        case 'courseCount':
          list.sort((a, b) => b.courseCount - a.courseCount)
          break
      }
      
      // 添加排名
      list.forEach((student, index) => {
        student.rank = index + 1
      })
    }
    
    const updateCharts = () => {
      updateHistogram()
      updateScatter()
    }
    
    const updateHistogram = () => {
      if (!histogram || !props.filterData.length) return
      
      // 计算成绩分布
      const allScores = props.filterData
        .map(row => parseFieldValue(row, '成绩'))
        .filter(score => typeof score === 'number' && score >= 0)
      
      // 创建分数区间
      const ranges = [
        { min: 0, max: 59, name: '0-59' },
        { min: 60, max: 69, name: '60-69' },
        { min: 70, max: 79, name: '70-79' },
        { min: 80, max: 89, name: '80-89' },
        { min: 90, max: 100, name: '90-100' }
      ]
      
      const data = ranges.map(range => {
        const count = allScores.filter(score => score >= range.min && score <= range.max).length
        return { name: range.name, value: count }
      })
      
      const option = {
        title: {
          text: '学生成绩分布',
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
            return `${data.name}<br/>学生数: ${data.value}`
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
          data: data.map(item => item.name),
          name: '分数区间'
        },
        yAxis: {
          type: 'value',
          name: '学生数量'
        },
        series: [
          {
            name: '学生数量',
            type: 'bar',
            data: data.map(item => item.value),
            itemStyle: {
              color: function(params) {
                const colors = ['#F56C6C', '#909399', '#F56C6C', '#E6A23C', '#67C23A']
                return colors[params.dataIndex]
              }
            },
            label: {
              show: true,
              position: 'top'
            }
          }
        ]
      }
      
      histogram.setOption(option)
    }
    
    const updateScatter = () => {
      if (!scatter || !studentStats.details.length) return
      
      const data = studentStats.details.map(student => [
        student.rank,
        student.averageScore,
        student.studentName
      ])
      
      const option = {
        title: {
          text: '学生排名分布',
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `排名: ${params.value[0]}<br/>平均分: ${params.value[1].toFixed(1)}<br/>学生: ${params.value[2]}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '排名',
          inverse: true
        },
        yAxis: {
          type: 'value',
          name: '平均分',
          min: 0,
          max: 100
        },
        series: [
          {
            name: '学生成绩',
            type: 'scatter',
            data: data,
            symbolSize: 8,
            itemStyle: {
              color: function(params) {
                const score = params.value[1]
                if (score >= 90) return '#67C23A'
                if (score >= 80) return '#E6A23C'
                if (score >= 70) return '#F56C6C'
                return '#909399'
              }
            }
          }
        ]
      }
      
      scatter.setOption(option)
    }
    
    const initCharts = () => {
      if (histogramRef.value) {
        histogram = echarts.init(histogramRef.value)
      }
      if (scatterRef.value) {
        scatter = echarts.init(scatterRef.value)
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
    
    const viewStudentDetail = (studentData) => {
      selectedStudent.value = studentData
      detailDialogVisible.value = true
    }
    
    const handleSearch = () => {
      // 搜索功能已通过计算属性实现
    }
    
    const handleSort = () => {
      sortStudentList(studentStats.details)
    }
    
    const exportHistogram = () => {
      if (histogram) {
        const url = histogram.getDataURL()
        const link = document.createElement('a')
        link.download = '学生成绩分布图.png'
        link.href = url
        link.click()
        ElMessage.success('直方图导出成功')
      }
    }
    
    const exportScatter = () => {
      if (scatter) {
        const url = scatter.getDataURL()
        const link = document.createElement('a')
        link.download = '学生排名分布图.png'
        link.href = url
        link.click()
        ElMessage.success('散点图导出成功')
      }
    }
    
    const exportTable = () => {
      // 这里可以实现表格导出功能
      ElMessage.success('表格导出功能开发中')
    }
    
    // 监听筛选数据变化
    watch(() => props.filterData, () => {
      calculateStudentStats()
    }, { deep: true })
    
    // 监听窗口大小变化
    const handleResize = () => {
      if (histogram) {
        histogram.resize()
      }
      if (scatter) {
        scatter.resize()
      }
    }
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initCharts()
        calculateStudentStats()
      })
      
      window.addEventListener('resize', handleResize)
    })
    
    return {
      histogramRef,
      scatterRef,
      detailDialogVisible,
      selectedStudent,
      searchKeyword,
      sortBy,
      studentStats,
      filteredStudentList,
      getScoreClass,
      getPassRateClass,
      getExcellentRateClass,
      viewStudentDetail,
      handleSearch,
      handleSort,
      exportHistogram,
      exportScatter,
      exportTable
    }
  }
}
</script>

<style scoped lang="less">
.student-stats {
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
        align-items: center;
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