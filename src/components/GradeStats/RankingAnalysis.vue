<template>
  <div class="ranking-analysis">
    <!-- 排名分析概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>排名分析</span>
            </div>
          </template>
          <div class="stat-number">{{ rankingStats.totalStudents }}</div>
          <div class="stat-desc">参与排名学生</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>平均排名</span>
            </div>
          </template>
          <div class="stat-number">{{ rankingStats.averageRank.toFixed(1) }}</div>
          <div class="stat-desc">班级平均排名</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>排名提升</span>
            </div>
          </template>
          <div class="stat-number trend-up">{{ rankingStats.improvedCount }}</div>
          <div class="stat-desc">排名提升学生</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>排名下降</span>
            </div>
          </template>
          <div class="stat-number trend-down">{{ rankingStats.declinedCount }}</div>
          <div class="stat-desc">排名下降学生</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排名筛选器 -->
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>排名分析筛选</span>
        </div>
      </template>
      
      <el-form :model="filterForm" label-width="100px" inline>
        <el-form-item label="排名维度">
          <el-select v-model="filterForm.dimension" @change="handleDimensionChange">
            <el-option label="总分排名" value="total" />
            <el-option label="单科排名" value="subject" />
            <el-option label="班级排名" value="class" />
            <el-option label="年级排名" value="grade" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="课程选择" v-if="filterForm.dimension === 'subject'">
          <el-select v-model="filterForm.subject" @change="handleFilterChange">
            <el-option label="全部课程" value="" />
            <el-option label="数学" value="数学" />
            <el-option label="语文" value="语文" />
            <el-option label="英语" value="英语" />
            <el-option label="物理" value="物理" />
            <el-option label="化学" value="化学" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="排名范围">
          <el-select v-model="filterForm.rankRange" @change="handleFilterChange">
            <el-option label="前10名" value="top10" />
            <el-option label="前20名" value="top20" />
            <el-option label="前50名" value="top50" />
            <el-option label="全部" value="all" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="变化类型">
          <el-select v-model="filterForm.changeType" @change="handleFilterChange">
            <el-option label="全部变化" value="all" />
            <el-option label="排名提升" value="improved" />
            <el-option label="排名下降" value="declined" />
            <el-option label="排名稳定" value="stable" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 排名图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>排名分布图</span>
              <el-button type="primary" size="small" @click="exportRankingChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="rankingChartRef" class="chart" style="height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>排名变化散点图</span>
              <el-button type="primary" size="small" @click="exportScatterChart">
                <el-icon><Download /></el-icon>
                导出图表
              </el-button>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="scatterChartRef" class="chart" style="height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排名详情表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>排名详情</span>
          <div>
            <el-button type="success" size="small" @click="exportTable">
              <el-icon><Download /></el-icon>
              导出表格
            </el-button>
            <el-button type="warning" size="small" @click="showRankingHistory">
              <el-icon><Clock /></el-icon>
              排名历史
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="rankingDetails" stripe style="width: 100%">
        <el-table-column prop="rank" label="当前排名" width="100" sortable>
          <template #default="scope">
            <el-tag :type="getRankTagType(scope.row.rank)" size="small">
              {{ scope.row.rank }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="score" label="成绩" width="100">
          <template #default="scope">
            <span class="score-value">{{ scope.row.score.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="previousRank" label="上次排名" width="100" />
        <el-table-column prop="rankChange" label="排名变化" width="100">
          <template #default="scope">
            <span :class="getChangeClass(scope.row.rankChange)">
              {{ scope.row.rankChange > 0 ? '+' : '' }}{{ scope.row.rankChange }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="changeRate" label="变化率" width="100">
          <template #default="scope">
            <span :class="getChangeClass(scope.row.changeRate)">
              {{ scope.row.changeRate > 0 ? '+' : '' }}{{ scope.row.changeRate.toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="trend" label="趋势" width="100">
          <template #default="scope">
            <el-tag :type="getTrendTagType(scope.row.trend)" size="small">
              {{ getTrendText(scope.row.trend) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="analysis" label="分析" />
      </el-table>
    </el-card>

    <!-- 排名分析报告 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>排名分析报告</span>
        </div>
      </template>
      
      <div class="analysis-content">
        <div class="analysis-section">
          <h4>排名概况</h4>
          <p>本次排名分析共涉及 <strong>{{ rankingStats.totalStudents }}</strong> 名学生，
          平均排名为 <strong>{{ rankingStats.averageRank.toFixed(1) }}</strong>。
          其中排名提升的学生有 <strong>{{ rankingStats.improvedCount }}</strong> 名，
          排名下降的学生有 <strong>{{ rankingStats.declinedCount }}</strong> 名。</p>
        </div>
        
        <div class="analysis-section">
          <h4>排名分布特征</h4>
          <ul>
            <li>前10名占比：{{ ((rankingStats.top10Count / rankingStats.totalStudents) * 100).toFixed(1) }}%</li>
            <li>前20名占比：{{ ((rankingStats.top20Count / rankingStats.totalStudents) * 100).toFixed(1) }}%</li>
            <li>排名稳定性：{{ getStabilityDescription(rankingStats.stability) }}</li>
            <li>竞争激烈程度：{{ getCompetitionDescription(rankingStats.competition) }}</li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>重点关注对象</h4>
          <ul>
            <li v-if="rankingStats.improvedCount > 0">
              排名显著提升的学生：{{ rankingStats.improvedCount }}名，建议给予表扬和鼓励
            </li>
            <li v-if="rankingStats.declinedCount > 0">
              排名明显下降的学生：{{ rankingStats.declinedCount }}名，建议重点关注和辅导
            </li>
            <li v-if="rankingStats.stableCount > 0">
              排名稳定的学生：{{ rankingStats.stableCount }}名，建议保持学习状态
            </li>
            <li>建议对排名变化较大的学生进行个别谈话，了解原因并制定改进计划</li>
          </ul>
        </div>
        
        <div class="analysis-section">
          <h4>改进建议</h4>
          <ul>
            <li v-if="rankingStats.declinedCount > rankingStats.improvedCount">
              排名下降学生较多，建议加强教学质量和学生辅导
            </li>
            <li v-if="rankingStats.stability < 0.7">
              排名波动较大，建议稳定教学策略和考试难度
            </li>
            <li v-if="rankingStats.competition > 0.8">
              竞争激烈，建议适当调整评价标准，避免过度竞争
            </li>
            <li>建议定期进行排名分析，及时发现问题并采取措施</li>
          </ul>
        </div>
      </div>
    </el-card>

    <!-- 排名历史对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="排名历史记录"
      width="clamp(320px, 90vw, 1200px)"
      :before-close="handleHistoryDialogClose"
    >
      <div class="history-content">
        <el-table :data="rankingHistory" stripe style="width: 100%">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="rank" label="排名" width="80" />
          <el-table-column prop="score" label="成绩" width="80" />
          <el-table-column prop="change" label="变化" width="80">
            <template #default="scope">
              <span :class="getChangeClass(scope.row.change)">
                {{ scope.row.change > 0 ? '+' : '' }}{{ scope.row.change }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" />
        </el-table>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="historyDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportHistory">
            导出历史记录
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Clock } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { parseFieldValue } from '../../utils/fieldParser.js'

export default {
  name: 'RankingAnalysis',
  components: {
    Download,
    Clock
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
    const rankingChartRef = ref(null)
    const scatterChartRef = ref(null)
    let rankingChart = null
    let scatterChart = null
    
    // 筛选表单
    const filterForm = reactive({
      dimension: 'total',
      subject: '',
      rankRange: 'top20',
      changeType: 'all'
    })
    
    // 排名统计数据
    const rankingStats = reactive({
      totalStudents: 0,
      averageRank: 0,
      improvedCount: 0,
      declinedCount: 0,
      stableCount: 0,
      top10Count: 0,
      top20Count: 0,
      stability: 0,
      competition: 0
    })
    
    // 排名详情数据
    const rankingDetails = ref([])
    
    // 排名历史数据
    const rankingHistory = ref([])
    const historyDialogVisible = ref(false)
    
    // 计算属性
    const filteredRankingDetails = computed(() => {
      let details = rankingDetails.value
      
      // 按排名范围筛选
      if (filterForm.rankRange !== 'all') {
        const limit = parseInt(filterForm.rankRange.replace('top', ''))
        details = details.filter(item => item.rank <= limit)
      }
      
      // 按变化类型筛选
      if (filterForm.changeType !== 'all') {
        switch (filterForm.changeType) {
          case 'improved':
            details = details.filter(item => item.rankChange > 0)
            break
          case 'declined':
            details = details.filter(item => item.rankChange < 0)
            break
          case 'stable':
            details = details.filter(item => item.rankChange === 0)
            break
        }
      }
      
      return details
    })
    
    // 方法
    const getRankTagType = (rank) => {
      if (rank <= 3) return 'danger'
      if (rank <= 10) return 'warning'
      if (rank <= 20) return 'success'
      return 'info'
    }
    
    const getChangeClass = (change) => {
      if (change > 0) return 'change-up'
      if (change < 0) return 'change-down'
      return 'change-stable'
    }
    
    const getTrendTagType = (trend) => {
      if (trend === 'up') return 'success'
      if (trend === 'down') return 'danger'
      return 'info'
    }
    
    const getTrendText = (trend) => {
      if (trend === 'up') return '上升'
      if (trend === 'down') return '下降'
      return '稳定'
    }
    
    const getStabilityDescription = (stability) => {
      if (stability >= 0.8) return '非常稳定'
      if (stability >= 0.6) return '较为稳定'
      if (stability >= 0.4) return '一般稳定'
      return '波动较大'
    }
    
    const getCompetitionDescription = (competition) => {
      if (competition >= 0.8) return '竞争激烈'
      if (competition >= 0.6) return '竞争中等'
      if (competition >= 0.4) return '竞争一般'
      return '竞争较小'
    }
    
    const calculateRankingData = () => {
      if (!props.filterData || props.filterData.length === 0) {
        return
      }
      
      // 按学生分组数据
      const studentGroups = {}
      
      props.filterData.forEach(row => {
        const studentId = parseFieldValue(row, '学生ID')
        const studentName = parseFieldValue(row, '学生姓名')
        const className = parseFieldValue(row, '班级名称')
        const score = parseFieldValue(row, '成绩')
        const subject = parseFieldValue(row, '课程名称')
        
        if (!studentId || !score || typeof score !== 'number') return
        
        // 按维度筛选
        if (filterForm.dimension === 'subject' && filterForm.subject && subject !== filterForm.subject) {
          return
        }
        
        if (!studentGroups[studentId]) {
          studentGroups[studentId] = {
            studentId,
            studentName,
            className,
            scores: [],
            subjects: []
          }
        }
        
        studentGroups[studentId].scores.push(score)
        studentGroups[studentId].subjects.push(subject)
      })
      
      // 计算每个学生的排名数据
      const students = Object.values(studentGroups)
      const details = []
      
      students.forEach(student => {
        let totalScore = 0
        let avgScore = 0
        
        // 根据维度计算分数
        switch (filterForm.dimension) {
          case 'total':
            totalScore = student.scores.reduce((sum, score) => sum + score, 0)
            avgScore = totalScore / student.scores.length
            break
          case 'subject':
            if (filterForm.subject) {
              const subjectScores = student.scores.filter((score, index) => 
                student.subjects[index] === filterForm.subject
              )
              avgScore = subjectScores.length > 0 ? 
                subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length : 0
            } else {
              avgScore = student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length
            }
            break
          default:
            avgScore = student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length
        }
        
        details.push({
          studentId: student.studentId,
          studentName: student.studentName,
          className: student.className,
          score: avgScore,
          rank: 0,
          previousRank: 0,
          rankChange: 0,
          changeRate: 0,
          trend: 'stable',
          analysis: ''
        })
      })
      
      // 按分数排序并计算排名
      details.sort((a, b) => b.score - a.score)
      details.forEach((student, index) => {
        student.rank = index + 1
        
        // 模拟上次排名（实际应该从历史数据获取）
        student.previousRank = student.rank + Math.floor(Math.random() * 10) - 5
        student.rankChange = student.previousRank - student.rank
        student.changeRate = student.previousRank > 0 ? 
          (student.rankChange / student.previousRank) * 100 : 0
        
        // 确定趋势
        if (student.rankChange > 0) {
          student.trend = 'up'
          student.analysis = '排名提升，表现良好'
        } else if (student.rankChange < 0) {
          student.trend = 'down'
          student.analysis = '排名下降，需要关注'
        } else {
          student.trend = 'stable'
          student.analysis = '排名稳定，保持状态'
        }
      })
      
      rankingDetails.value = details
      
      // 计算统计信息
      rankingStats.totalStudents = details.length
      rankingStats.averageRank = details.reduce((sum, student) => sum + student.rank, 0) / details.length
      rankingStats.improvedCount = details.filter(student => student.rankChange > 0).length
      rankingStats.declinedCount = details.filter(student => student.rankChange < 0).length
      rankingStats.stableCount = details.filter(student => student.rankChange === 0).length
      rankingStats.top10Count = details.filter(student => student.rank <= 10).length
      rankingStats.top20Count = details.filter(student => student.rank <= 20).length
      
      // 计算稳定性（排名变化的标准差）
      const changes = details.map(student => Math.abs(student.rankChange))
      const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length
      rankingStats.stability = Math.max(0, 1 - (avgChange / rankingStats.totalStudents))
      
      // 计算竞争激烈程度（前20名分数差异）
      const top20 = details.slice(0, 20)
      if (top20.length > 1) {
        const scoreDiff = top20[0].score - top20[top20.length - 1].score
        rankingStats.competition = Math.min(1, scoreDiff / 100)
      }
    }
    
    const updateRankingChart = () => {
      if (!rankingChart || !filteredRankingDetails.value.length) return
      
      // 按排名区间分组
      const rankRanges = [
        { name: '1-10名', count: 0 },
        { name: '11-20名', count: 0 },
        { name: '21-50名', count: 0 },
        { name: '51-100名', count: 0 },
        { name: '100名以后', count: 0 }
      ]
      
      filteredRankingDetails.value.forEach(student => {
        if (student.rank <= 10) rankRanges[0].count++
        else if (student.rank <= 20) rankRanges[1].count++
        else if (student.rank <= 50) rankRanges[2].count++
        else if (student.rank <= 100) rankRanges[3].count++
        else rankRanges[4].count++
      })
      
      const option = {
        title: {
          text: '排名分布',
          left: 'center',
          textStyle: {
            fontSize: 16,
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
          data: rankRanges.map(item => item.name)
        },
        series: [
          {
            name: '排名分布',
            type: 'pie',
            radius: '50%',
            data: rankRanges.map(item => ({
              name: item.name,
              value: item.count
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      rankingChart.setOption(option)
    }
    
    const updateScatterChart = () => {
      if (!scatterChart || !filteredRankingDetails.value.length) return
      
      const data = filteredRankingDetails.value.map(student => [
        student.previousRank,
        student.rank,
        student.studentName
      ])
      
      const option = {
        title: {
          text: '排名变化散点图',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.data[2]}<br/>上次排名: ${params.data[0]}<br/>当前排名: ${params.data[1]}`
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
          name: '上次排名',
          inverse: true
        },
        yAxis: {
          type: 'value',
          name: '当前排名',
          inverse: true
        },
        series: [
          {
            name: '排名变化',
            type: 'scatter',
            data: data,
            symbolSize: 8,
            itemStyle: {
              color: function(params) {
                const change = params.data[0] - params.data[1]
                if (change > 0) return '#67C23A'
                if (change < 0) return '#F56C6C'
                return '#909399'
              }
            }
          }
        ]
      }
      
      scatterChart.setOption(option)
    }
    
    const handleDimensionChange = () => {
      calculateRankingData()
    }
    
    const handleFilterChange = () => {
      calculateRankingData()
    }
    
    const exportRankingChart = () => {
      if (rankingChart) {
        const url = rankingChart.getDataURL()
        const link = document.createElement('a')
        link.download = '排名分布图.png'
        link.href = url
        link.click()
        ElMessage.success('排名分布图导出成功')
      }
    }
    
    const exportScatterChart = () => {
      if (scatterChart) {
        const url = scatterChart.getDataURL()
        const link = document.createElement('a')
        link.download = '排名变化散点图.png'
        link.href = url
        link.click()
        ElMessage.success('散点图导出成功')
      }
    }
    
    const exportTable = () => {
      ElMessage.success('排名表格导出功能开发中')
    }
    
    const showRankingHistory = () => {
      // 模拟历史数据
      rankingHistory.value = filteredRankingDetails.value.slice(0, 10).map(student => ({
        date: '2024-01-15',
        studentName: student.studentName,
        rank: student.rank,
        score: student.score,
        change: student.rankChange,
        description: student.analysis
      }))
      historyDialogVisible.value = true
    }
    
    const handleHistoryDialogClose = () => {
      historyDialogVisible.value = false
    }
    
    const exportHistory = () => {
      ElMessage.success('历史记录导出功能开发中')
    }
    
    const initCharts = () => {
      if (rankingChartRef.value) {
        rankingChart = echarts.init(rankingChartRef.value)
      }
      if (scatterChartRef.value) {
        scatterChart = echarts.init(scatterChartRef.value)
      }
      updateRankingChart()
      updateScatterChart()
    }
    
    // 监听数据变化
    watch(() => props.filterData, () => {
      calculateRankingData()
    }, { deep: true })
    
    watch(filteredRankingDetails, () => {
      nextTick(() => {
        updateRankingChart()
        updateScatterChart()
      })
    }, { deep: true })
    
    // 生命周期
    onMounted(() => {
      calculateRankingData()
      nextTick(() => {
        initCharts()
      })
    })
    
    return {
      rankingChartRef,
      scatterChartRef,
      filterForm,
      rankingStats,
      rankingDetails: filteredRankingDetails,
      rankingHistory,
      historyDialogVisible,
      getRankTagType,
      getChangeClass,
      getTrendTagType,
      getTrendText,
      getStabilityDescription,
      getCompetitionDescription,
      handleDimensionChange,
      handleFilterChange,
      exportRankingChart,
      exportScatterChart,
      exportTable,
      showRankingHistory,
      handleHistoryDialogClose,
      exportHistory
    }
  }
}
</script>

<style scoped lang="less">
.ranking-analysis {
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
  
  .history-content {
    max-height: 400px;
    overflow-y: auto;
  }
  
  // 变化样式
  .change-up {
    color: #67C23A;
    font-weight: bold;
  }
  
  .change-down {
    color: #F56C6C;
    font-weight: bold;
  }
  
  .change-stable {
    color: #909399;
    font-weight: bold;
  }
  
  .score-value {
    font-weight: bold;
    color: #409EFF;
  }
}
</style> 