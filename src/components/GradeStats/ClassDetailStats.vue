<template>
  <div class="class-detail-stats">
    <!-- 班级基本信息 -->
    <el-row :gutter="20" class="basic-info">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>班级信息</span>
            </div>
          </template>
          <div class="info-item">
            <label>班级名称：</label>
            <span>{{ classData.className }}</span>
          </div>
          <div class="info-item">
            <label>学生人数：</label>
            <span>{{ classData.studentCount }}人</span>
          </div>
          <div class="info-item">
            <label>成绩记录数：</label>
            <span>{{ classData.recordCount }}条</span>
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
            <span :class="getScoreClass(classData.averageScore)">
              {{ classData.averageScore.toFixed(1) }}
            </span>
          </div>
          <div class="info-item">
            <label>最高分：</label>
            <span>{{ classData.highestScore }}</span>
          </div>
          <div class="info-item">
            <label>最低分：</label>
            <span>{{ classData.lowestScore }}</span>
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
            <span :class="getPassRateClass(classData.passRate)">
              {{ (classData.passRate * 100).toFixed(1) }}%
            </span>
          </div>
          <div class="info-item">
            <label>优秀率：</label>
            <span :class="getExcellentRateClass(classData.excellentRate)">
              {{ (classData.excellentRate * 100).toFixed(1) }}%
            </span>
          </div>
          <div class="info-item">
            <label>不及格率：</label>
            <span class="rate-poor">
              {{ ((1 - classData.passRate) * 100).toFixed(1) }}%
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
              <span>成绩分布直方图</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="histogramRef" class="chart" style="height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>成绩等级饼图</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="pieChartRef" class="chart" style="height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成绩详情表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>成绩详情</span>
        </div>
      </template>
      
      <el-table :data="scoreDetails" stripe style="width: 100%">
        <el-table-column prop="score" label="分数" width="80" />
        <el-table-column prop="count" label="人数" width="80" />
        <el-table-column prop="percentage" label="占比" width="100">
          <template #default="scope">
            {{ scope.row.percentage.toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="等级" width="100">
          <template #default="scope">
            <el-tag :type="getGradeTagType(scope.row.grade)">
              {{ scope.row.grade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
      </el-table>
    </el-card>

    <!-- 分析报告 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>班级分析报告</span>
        </div>
      </template>
      
      <div class="analysis-content">
        <div class="analysis-section">
          <h4>整体表现</h4>
          <p>{{ classData.className }} 班级共有 <strong>{{ classData.studentCount }}</strong> 名学生，
          平均分为 <strong>{{ classData.averageScore.toFixed(1) }}</strong> 分，
          在全校班级中处于{{ getPerformanceLevel() }}水平。</p>
        </div>
        
        <div class="analysis-section">
          <h4>成绩特点</h4>
          <ul>
            <li>最高分：{{ classData.highestScore }}分，最低分：{{ classData.lowestScore }}分，分数跨度：{{ classData.highestScore - classData.lowestScore }}分</li>
            <li>及格率：{{ (classData.passRate * 100).toFixed(1) }}%，{{ classData.passRate >= 0.9 ? '表现优秀' : classData.passRate >= 0.8 ? '表现良好' : '需要关注' }}</li>
            <li>优秀率：{{ (classData.excellentRate * 100).toFixed(1) }}%，{{ classData.excellentRate >= 0.3 ? '优秀学生较多' : classData.excellentRate >= 0.2 ? '优秀学生适中' : '优秀学生偏少' }}</li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>改进建议</h4>
          <ul>
            <li v-if="classData.passRate < 0.8">及格率偏低，建议加强基础教学和课后辅导</li>
            <li v-if="classData.excellentRate < 0.2">优秀率偏低，建议提高教学质量和学习要求</li>
            <li v-if="classData.highestScore - classData.lowestScore > 40">学生成绩差异较大，建议关注学习困难学生</li>
            <li v-if="classData.averageScore < 75">平均分偏低，建议调整教学策略</li>
            <li v-else>整体表现良好，建议继续保持并进一步提升</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'ClassDetailStats',
  props: {
    classData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const histogramRef = ref(null)
    const pieChartRef = ref(null)
    let histogram = null
    let pieChart = null
    
    // 计算成绩详情
    const scoreDetails = computed(() => {
      if (!props.classData.scores || props.classData.scores.length === 0) {
        return []
      }
      
      // 创建分数区间
      const ranges = [
        { min: 90, max: 100, grade: '优秀', color: 'success' },
        { min: 80, max: 89, grade: '良好', color: 'warning' },
        { min: 70, max: 79, grade: '中等', color: 'danger' },
        { min: 60, max: 69, grade: '及格', color: 'info' },
        { min: 0, max: 59, grade: '不及格', color: 'danger' }
      ]
      
      return ranges.map(range => {
        const count = props.classData.scores.filter(score => score >= range.min && score <= range.max).length
        return {
          score: `${range.min}-${range.max}`,
          count,
          percentage: (count / props.classData.scores.length) * 100,
          grade: range.grade,
          color: range.color,
          description: range.grade === '优秀' ? '表现优异，学习能力强' :
                      range.grade === '良好' ? '表现良好，有提升空间' :
                      range.grade === '中等' ? '表现一般，需要加强' :
                      range.grade === '及格' ? '勉强及格，需要努力' :
                      '不及格，需要重点关注'
        }
      }).filter(item => item.count > 0)
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
    
    const getPerformanceLevel = () => {
      const score = props.classData.averageScore
      if (score >= 90) return '优秀'
      if (score >= 80) return '良好'
      if (score >= 70) return '中等'
      return '需要改进'
    }
    
    const updateHistogram = () => {
      if (!histogram || !props.classData.scores || props.classData.scores.length === 0) return
      
      // 创建分数区间
      const ranges = [
        { min: 0, max: 59, name: '0-59' },
        { min: 60, max: 69, name: '60-69' },
        { min: 70, max: 79, name: '70-79' },
        { min: 80, max: 89, name: '80-89' },
        { min: 90, max: 100, name: '90-100' }
      ]
      
      const data = ranges.map(range => {
        const count = props.classData.scores.filter(score => score >= range.min && score <= range.max).length
        return { name: range.name, value: count }
      })
      
      const option = {
        title: {
          text: '成绩分布',
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
            return `${data.name}<br/>人数: ${data.value}`
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
          name: '人数'
        },
        series: [
          {
            name: '人数',
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
    
    const updatePieChart = () => {
      if (!pieChart || !scoreDetails.value.length) return
      
      const pieData = scoreDetails.value.map(item => ({
        value: item.count,
        name: item.grade,
        itemStyle: { color: item.color === 'success' ? '#67C23A' : 
                              item.color === 'warning' ? '#E6A23C' : 
                              item.color === 'danger' ? '#F56C6C' : '#909399' }
      }))
      
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
      if (histogramRef.value) {
        histogram = echarts.init(histogramRef.value)
      }
      if (pieChartRef.value) {
        pieChart = echarts.init(pieChartRef.value)
      }
      updateHistogram()
      updatePieChart()
    }
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initCharts()
      })
    })
    
    return {
      histogramRef,
      pieChartRef,
      scoreDetails,
      getScoreClass,
      getPassRateClass,
      getExcellentRateClass,
      getGradeTagType,
      getPerformanceLevel
    }
  }
}
</script>

<style scoped lang="less">
.class-detail-stats {
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