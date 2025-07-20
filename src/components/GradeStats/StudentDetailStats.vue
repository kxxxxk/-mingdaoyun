<template>
  <div class="student-detail-stats">
    <!-- 学生基本信息 -->
    <el-row :gutter="20" class="basic-info">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>学生信息</span>
            </div>
          </template>
          <div class="info-item">
            <label>学生姓名：</label>
            <span>{{ studentData.studentName }}</span>
          </div>
          <div class="info-item">
            <label>所属班级：</label>
            <span>{{ studentData.className }}</span>
          </div>
          <div class="info-item">
            <label>课程数量：</label>
            <span>{{ studentData.courseCount }}门</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>成绩统计</span>
            </div>
          </template>
          <div class="info-item">
            <label>平均分：</label>
            <span :class="getScoreClass(studentData.averageScore)">
              {{ studentData.averageScore.toFixed(1) }}
            </span>
          </div>
          <div class="info-item">
            <label>总分：</label>
            <span>{{ studentData.totalScore }}</span>
          </div>
          <div class="info-item">
            <label>排名：</label>
            <span>第{{ studentData.rank }}名</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>通过率统计</span>
            </div>
          </template>
          <div class="info-item">
            <label>及格率：</label>
            <span :class="getPassRateClass(studentData.passRate)">
              {{ (studentData.passRate * 100).toFixed(1) }}%
            </span>
          </div>
          <div class="info-item">
            <label>优秀率：</label>
            <span :class="getExcellentRateClass(studentData.excellentRate)">
              {{ (studentData.excellentRate * 100).toFixed(1) }}%
            </span>
          </div>
          <div class="info-item">
            <label>不及格率：</label>
            <span class="rate-poor">
              {{ ((1 - studentData.passRate) * 100).toFixed(1) }}%
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成绩分布图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>各科成绩对比</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="barChartRef" class="chart" style="height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>成绩等级分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="pieChartRef" class="chart" style="height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 各科成绩详情表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>各科成绩详情</span>
        </div>
      </template>
      
      <el-table :data="courseScores" stripe style="width: 100%">
        <el-table-column prop="courseName" label="课程名称" width="150" />
        <el-table-column prop="score" label="成绩" width="100">
          <template #default="scope">
            <span :class="getScoreClass(scope.row.score)">
              {{ scope.row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="等级" width="100">
          <template #default="scope">
            <el-tag :type="getGradeTagType(scope.row.grade)">
              {{ scope.row.grade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="100">
          <template #default="scope">
            <span v-if="scope.row.rank">第{{ scope.row.rank }}名</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="评价" />
      </el-table>
    </el-card>

    <!-- 分析报告 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>学生分析报告</span>
        </div>
      </template>
      
      <div class="analysis-content">
        <div class="analysis-section">
          <h4>整体表现</h4>
          <p>{{ studentData.studentName }} 同学来自 <strong>{{ studentData.className }}</strong> 班级，
          共参加了 <strong>{{ studentData.courseCount }}</strong> 门课程的学习，
          平均分为 <strong>{{ studentData.averageScore.toFixed(1) }}</strong> 分，
          在班级中排名第 <strong>{{ studentData.rank }}</strong> 名。</p>
        </div>
        
        <div class="analysis-section">
          <h4>成绩特点</h4>
          <ul>
            <li>最高分：{{ studentData.highestScore }}分，最低分：{{ studentData.lowestScore }}分，分数跨度：{{ studentData.highestScore - studentData.lowestScore }}分</li>
            <li>及格率：{{ (studentData.passRate * 100).toFixed(1) }}%，{{ studentData.passRate >= 0.9 ? '表现优秀' : studentData.passRate >= 0.8 ? '表现良好' : '需要关注' }}</li>
            <li>优秀率：{{ (studentData.excellentRate * 100).toFixed(1) }}%，{{ studentData.excellentRate >= 0.3 ? '优秀科目较多' : studentData.excellentRate >= 0.2 ? '优秀科目适中' : '优秀科目偏少' }}</li>
            <li>总分：{{ studentData.totalScore }}分，平均每科{{ (studentData.totalScore / studentData.courseCount).toFixed(1) }}分</li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>学习建议</h4>
          <ul>
            <li v-if="studentData.passRate < 0.8">及格率偏低，建议加强基础学习，重点关注不及格科目</li>
            <li v-if="studentData.excellentRate < 0.2">优秀率偏低，建议提高学习要求，争取更多优秀成绩</li>
            <li v-if="studentData.highestScore - studentData.lowestScore > 30">各科成绩差异较大，建议均衡发展，重点提升薄弱科目</li>
            <li v-if="studentData.averageScore < 75">平均分偏低，建议调整学习方法，提高学习效率</li>
            <li v-if="studentData.rank > studentData.courseCount * 0.7">排名偏后，建议加强学习，争取更好的排名</li>
            <li v-else>整体表现良好，建议继续保持并进一步提升</li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>优势科目</h4>
          <p v-if="excellentCourses.length > 0">
            {{ studentData.studentName }} 同学在以下科目表现优秀：
            <strong>{{ excellentCourses.join('、') }}</strong>，
            建议继续保持这些科目的优势。
          </p>
          <p v-else>暂无特别突出的优势科目，建议全面发展。</p>
        </div>
        
        <div class="analysis-section">
          <h4>需要提升的科目</h4>
          <p v-if="weakCourses.length > 0">
            以下科目需要重点关注：
            <strong>{{ weakCourses.join('、') }}</strong>，
            建议加强这些科目的学习和练习。
          </p>
          <p v-else>各科成绩相对均衡，继续保持。</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'StudentDetailStats',
  props: {
    studentData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const barChartRef = ref(null)
    const pieChartRef = ref(null)
    let barChart = null
    let pieChart = null
    
    // 计算各科成绩（这里需要根据实际数据结构调整）
    const courseScores = computed(() => {
      // 这里应该从props.studentData中获取各科成绩数据
      // 由于当前数据结构中没有具体的各科成绩，这里创建一个示例
      const courses = ['语文', '数学', '英语', '物理', '化学', '生物']
      return courses.map((course, index) => {
        const score = Math.floor(Math.random() * 40) + 60 // 60-100分
        return {
          courseName: course,
          score,
          grade: score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 70 ? '中等' : score >= 60 ? '及格' : '不及格',
          rank: Math.floor(Math.random() * 30) + 1,
          description: score >= 90 ? '表现优异，学习能力强' :
                      score >= 80 ? '表现良好，有提升空间' :
                      score >= 70 ? '表现一般，需要加强' :
                      score >= 60 ? '勉强及格，需要努力' :
                      '不及格，需要重点关注'
        }
      })
    })
    
    // 计算优秀科目
    const excellentCourses = computed(() => {
      return courseScores.value
        .filter(course => course.score >= 90)
        .map(course => course.courseName)
    })
    
    // 计算薄弱科目
    const weakCourses = computed(() => {
      return courseScores.value
        .filter(course => course.score < 70)
        .map(course => course.courseName)
    })
    
    // 方法
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
    
    const updateBarChart = () => {
      if (!barChart || !courseScores.value.length) return
      
      const chartData = courseScores.value.map(item => ({
        name: item.courseName,
        value: item.score
      }))
      
      const option = {
        title: {
          text: '各科成绩对比',
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
            return `${data.name}<br/>成绩: ${data.value}分`
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
          name: '成绩',
          min: 0,
          max: 100
        },
        series: [
          {
            name: '成绩',
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
      if (!pieChart || !courseScores.value.length) return
      
      // 计算成绩等级分布
      const excellent = courseScores.value.filter(course => course.score >= 90).length
      const good = courseScores.value.filter(course => course.score >= 80 && course.score < 90).length
      const average = courseScores.value.filter(course => course.score >= 70 && course.score < 80).length
      const pass = courseScores.value.filter(course => course.score >= 60 && course.score < 70).length
      const fail = courseScores.value.filter(course => course.score < 60).length
      
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
      updateBarChart()
      updatePieChart()
    }
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initCharts()
      })
    })
    
    return {
      barChartRef,
      pieChartRef,
      courseScores,
      excellentCourses,
      weakCourses,
      getScoreClass,
      getPassRateClass,
      getExcellentRateClass,
      getGradeTagType
    }
  }
}
</script>

<style scoped lang="less">
.student-detail-stats {
  .basic-info {
    margin-bottom: 20px;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      
      label {
        font-weight: bold;
        color: #666;
      }
      
      span {
        color: #333;
      }
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