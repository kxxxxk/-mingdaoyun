/**
 * PDF报表生成工具
 * 支持多种格式的PDF报表生成功能
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * 生成成绩统计PDF报表
 * @param {Object} reportData - 报表数据
 * @param {Object} options - 生成选项
 */
export function generateGradeReportPDF(reportData, options = {}) {
  const {
    filename = '成绩统计报表',
    title = '成绩统计报表',
    orientation = 'portrait',
    unit = 'mm',
    format = 'a4'
  } = options

  try {
    const doc = new jsPDF(orientation, unit, format)
    
    // 设置中文字体
    doc.addFont('https://cdn.jsdelivr.net/npm/noto-sans-sc@1.0.1/NotoSansSC-Regular.otf', 'NotoSansSC', 'normal')
    doc.setFont('NotoSansSC')
    
    // 添加标题
    addTitle(doc, title)
    
    // 添加概览信息
    if (reportData.overview) {
      addOverviewSection(doc, reportData.overview)
    }
    
    // 添加详细数据表格
    if (reportData.details) {
      addDetailsTable(doc, reportData.details)
    }
    
    // 添加图表说明
    if (reportData.charts) {
      addChartsSection(doc, reportData.charts)
    }
    
    // 添加页脚
    addFooter(doc)
    
    // 保存文件
    doc.save(`${filename}_${getCurrentDate()}.pdf`)
    
    return {
      success: true,
      message: 'PDF报表生成成功'
    }
  } catch (error) {
    console.error('PDF生成失败:', error)
    return {
      success: false,
      message: 'PDF报表生成失败: ' + error.message
    }
  }
}

/**
 * 生成趋势分析PDF报表
 * @param {Object} trendData - 趋势数据
 * @param {Object} options - 生成选项
 */
export function generateTrendReportPDF(trendData, options = {}) {
  const {
    filename = '趋势分析报表',
    title = '趋势分析报表'
  } = options

  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    doc.addFont('https://cdn.jsdelivr.net/npm/noto-sans-sc@1.0.1/NotoSansSC-Regular.otf', 'NotoSansSC', 'normal')
    doc.setFont('NotoSansSC')
    
    // 添加标题
    addTitle(doc, title)
    
    // 添加趋势概览
    if (trendData.overview) {
      addTrendOverviewSection(doc, trendData.overview)
    }
    
    // 添加趋势详情表格
    if (trendData.details) {
      addTrendDetailsTable(doc, trendData.details)
    }
    
    // 添加趋势分析
    if (trendData.analysis) {
      addTrendAnalysisSection(doc, trendData.analysis)
    }
    
    // 添加页脚
    addFooter(doc)
    
    doc.save(`${filename}_${getCurrentDate()}.pdf`)
    
    return {
      success: true,
      message: '趋势分析PDF报表生成成功'
    }
  } catch (error) {
    console.error('趋势PDF生成失败:', error)
    return {
      success: false,
      message: '趋势分析PDF报表生成失败: ' + error.message
    }
  }
}

/**
 * 生成排名分析PDF报表
 * @param {Object} rankingData - 排名数据
 * @param {Object} options - 生成选项
 */
export function generateRankingReportPDF(rankingData, options = {}) {
  const {
    filename = '排名分析报表',
    title = '排名分析报表'
  } = options

  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    doc.addFont('https://cdn.jsdelivr.net/npm/noto-sans-sc@1.0.1/NotoSansSC-Regular.otf', 'NotoSansSC', 'normal')
    doc.setFont('NotoSansSC')
    
    // 添加标题
    addTitle(doc, title)
    
    // 添加排名概览
    if (rankingData.overview) {
      addRankingOverviewSection(doc, rankingData.overview)
    }
    
    // 添加排名详情表格
    if (rankingData.details) {
      addRankingDetailsTable(doc, rankingData.details)
    }
    
    // 添加排名变化分析
    if (rankingData.changes) {
      addRankingChangesSection(doc, rankingData.changes)
    }
    
    // 添加页脚
    addFooter(doc)
    
    doc.save(`${filename}_${getCurrentDate()}.pdf`)
    
    return {
      success: true,
      message: '排名分析PDF报表生成成功'
    }
  } catch (error) {
    console.error('排名PDF生成失败:', error)
    return {
      success: false,
      message: '排名分析PDF报表生成失败: ' + error.message
    }
  }
}

/**
 * 生成对比分析PDF报表
 * @param {Object} comparisonData - 对比数据
 * @param {Object} options - 生成选项
 */
export function generateComparisonReportPDF(comparisonData, options = {}) {
  const {
    filename = '对比分析报表',
    title = '对比分析报表'
  } = options

  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    doc.addFont('https://cdn.jsdelivr.net/npm/noto-sans-sc@1.0.1/NotoSansSC-Regular.otf', 'NotoSansSC', 'normal')
    doc.setFont('NotoSansSC')
    
    // 添加标题
    addTitle(doc, title)
    
    // 添加对比概览
    if (comparisonData.overview) {
      addComparisonOverviewSection(doc, comparisonData.overview)
    }
    
    // 添加对比详情表格
    if (comparisonData.details) {
      addComparisonDetailsTable(doc, comparisonData.details)
    }
    
    // 添加差异分析
    if (comparisonData.differences) {
      addDifferencesSection(doc, comparisonData.differences)
    }
    
    // 添加页脚
    addFooter(doc)
    
    doc.save(`${filename}_${getCurrentDate()}.pdf`)
    
    return {
      success: true,
      message: '对比分析PDF报表生成成功'
    }
  } catch (error) {
    console.error('对比PDF生成失败:', error)
    return {
      success: false,
      message: '对比分析PDF报表生成失败: ' + error.message
    }
  }
}

/**
 * 生成综合PDF报表
 * @param {Object} comprehensiveData - 综合数据
 * @param {Object} options - 生成选项
 */
export function generateComprehensiveReportPDF(comprehensiveData, options = {}) {
  const {
    filename = '综合统计报表',
    title = '综合统计报表'
  } = options

  try {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    doc.addFont('https://cdn.jsdelivr.net/npm/noto-sans-sc@1.0.1/NotoSansSC-Regular.otf', 'NotoSansSC', 'normal')
    doc.setFont('NotoSansSC')
    
    // 添加标题
    addTitle(doc, title)
    
    // 添加目录
    addTableOfContents(doc, comprehensiveData)
    
    // 添加各个部分
    let currentY = 40
    
    if (comprehensiveData.overview) {
      currentY = addOverviewSection(doc, comprehensiveData.overview, currentY)
      doc.addPage()
      currentY = 20
    }
    
    if (comprehensiveData.trend) {
      currentY = addTrendSection(doc, comprehensiveData.trend, currentY)
      doc.addPage()
      currentY = 20
    }
    
    if (comprehensiveData.ranking) {
      currentY = addRankingSection(doc, comprehensiveData.ranking, currentY)
      doc.addPage()
      currentY = 20
    }
    
    if (comprehensiveData.comparison) {
      currentY = addComparisonSection(doc, comprehensiveData.comparison, currentY)
    }
    
    // 添加页脚
    addFooter(doc)
    
    doc.save(`${filename}_${getCurrentDate()}.pdf`)
    
    return {
      success: true,
      message: '综合PDF报表生成成功'
    }
  } catch (error) {
    console.error('综合PDF生成失败:', error)
    return {
      success: false,
      message: '综合PDF报表生成失败: ' + error.message
    }
  }
}

// 辅助函数

/**
 * 添加标题
 */
function addTitle(doc, title) {
  doc.setFontSize(20)
  doc.setFont('NotoSansSC', 'bold')
  doc.text(title, 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  doc.text(`生成时间: ${getCurrentDateTime()}`, 105, 30, { align: 'center' })
}

/**
 * 添加概览部分
 */
function addOverviewSection(doc, overviewData, startY = 40) {
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('统计概览', 20, startY)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  const items = [
    ['总学生数', overviewData.totalStudents || 0],
    ['总课程数', overviewData.totalCourses || 0],
    ['成绩记录数', overviewData.totalRecords || 0],
    ['平均分', (overviewData.averageScore || 0).toFixed(1)]
  ]
  
  let currentY = startY + 15
  items.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 25, currentY)
    currentY += 8
  })
  
  return currentY + 10
}

/**
 * 添加详细数据表格
 */
function addDetailsTable(doc, detailsData) {
  if (!detailsData || detailsData.length === 0) return
  
  const headers = Object.keys(detailsData[0])
  const data = detailsData.map(row => Object.values(row))
  
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 80,
    margin: { top: 20 },
    styles: {
      fontSize: 10,
      font: 'NotoSansSC'
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    }
  })
}

/**
 * 添加图表说明部分
 */
function addChartsSection(doc, chartsData) {
  const currentY = doc.lastAutoTable.finalY + 20
  
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('图表说明', 20, currentY)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  let y = currentY + 15
  Object.entries(chartsData).forEach(([type, description]) => {
    doc.text(`${type}: ${description}`, 25, y)
    y += 8
  })
}

/**
 * 添加趋势概览部分
 */
function addTrendOverviewSection(doc, overviewData) {
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('趋势分析概览', 20, 40)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  const items = [
    ['分析周期数', overviewData.totalPeriods || 0],
    ['整体趋势', (overviewData.overallTrend || 0).toFixed(1)],
    ['最高增长', (overviewData.maxGrowth || 0).toFixed(1)],
    ['最大下降', (overviewData.maxDecline || 0).toFixed(1)],
    ['趋势稳定性', (overviewData.stability || 0).toFixed(2)]
  ]
  
  let currentY = 55
  items.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 25, currentY)
    currentY += 8
  })
}

/**
 * 添加趋势详情表格
 */
function addTrendDetailsTable(doc, detailsData) {
  if (!detailsData || detailsData.length === 0) return
  
  const headers = Object.keys(detailsData[0])
  const data = detailsData.map(row => Object.values(row))
  
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 100,
    margin: { top: 20 },
    styles: {
      fontSize: 10,
      font: 'NotoSansSC'
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    }
  })
}

/**
 * 添加趋势分析部分
 */
function addTrendAnalysisSection(doc, analysisData) {
  const currentY = doc.lastAutoTable.finalY + 20
  
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('趋势分析', 20, currentY)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  let y = currentY + 15
  Object.entries(analysisData).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 25, y)
    y += 8
  })
}

/**
 * 添加排名概览部分
 */
function addRankingOverviewSection(doc, overviewData) {
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('排名分析概览', 20, 40)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  const items = [
    ['参与排名学生', overviewData.totalStudents || 0],
    ['平均排名', (overviewData.averageRank || 0).toFixed(1)],
    ['排名提升学生', overviewData.improvedCount || 0],
    ['排名下降学生', overviewData.declinedCount || 0],
    ['排名稳定性', (overviewData.stability || 0).toFixed(2)]
  ]
  
  let currentY = 55
  items.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 25, currentY)
    currentY += 8
  })
}

/**
 * 添加排名详情表格
 */
function addRankingDetailsTable(doc, detailsData) {
  if (!detailsData || detailsData.length === 0) return
  
  const headers = Object.keys(detailsData[0])
  const data = detailsData.map(row => Object.values(row))
  
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 100,
    margin: { top: 20 },
    styles: {
      fontSize: 10,
      font: 'NotoSansSC'
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    }
  })
}

/**
 * 添加排名变化分析部分
 */
function addRankingChangesSection(doc, changesData) {
  const currentY = doc.lastAutoTable.finalY + 20
  
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('排名变化分析', 20, currentY)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  let y = currentY + 15
  Object.entries(changesData).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 25, y)
    y += 8
  })
}

/**
 * 添加对比概览部分
 */
function addComparisonOverviewSection(doc, overviewData) {
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('对比分析概览', 20, 40)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  const items = [
    ['对比维度数', overviewData.totalComparisons || 0],
    ['差异程度', (overviewData.differenceLevel || 0).toFixed(1) + '%'],
    ['优势项目', overviewData.advantageCount || 0],
    ['劣势项目', overviewData.disadvantageCount || 0]
  ]
  
  let currentY = 55
  items.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 25, currentY)
    currentY += 8
  })
}

/**
 * 添加对比详情表格
 */
function addComparisonDetailsTable(doc, detailsData) {
  if (!detailsData || detailsData.length === 0) return
  
  const headers = Object.keys(detailsData[0])
  const data = detailsData.map(row => Object.values(row))
  
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 100,
    margin: { top: 20 },
    styles: {
      fontSize: 10,
      font: 'NotoSansSC'
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    }
  })
}

/**
 * 添加差异分析部分
 */
function addDifferencesSection(doc, differencesData) {
  const currentY = doc.lastAutoTable.finalY + 20
  
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('差异分析', 20, currentY)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  let y = currentY + 15
  Object.entries(differencesData).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 25, y)
    y += 8
  })
}

/**
 * 添加目录
 */
function addTableOfContents(doc, data) {
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('目录', 20, 40)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  let y = 55
  const sections = []
  
  if (data.overview) sections.push('统计概览')
  if (data.trend) sections.push('趋势分析')
  if (data.ranking) sections.push('排名分析')
  if (data.comparison) sections.push('对比分析')
  
  sections.forEach((section, index) => {
    doc.text(`${index + 1}. ${section}`, 25, y)
    y += 8
  })
}

/**
 * 添加趋势部分
 */
function addTrendSection(doc, trendData, startY) {
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('趋势分析', 20, startY)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  let currentY = startY + 15
  if (trendData.overview) {
    Object.entries(trendData.overview).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 25, currentY)
      currentY += 8
    })
  }
  
  return currentY + 10
}

/**
 * 添加排名部分
 */
function addRankingSection(doc, rankingData, startY) {
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('排名分析', 20, startY)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  let currentY = startY + 15
  if (rankingData.overview) {
    Object.entries(rankingData.overview).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 25, currentY)
      currentY += 8
    })
  }
  
  return currentY + 10
}

/**
 * 添加对比部分
 */
function addComparisonSection(doc, comparisonData, startY) {
  doc.setFontSize(16)
  doc.setFont('NotoSansSC', 'bold')
  doc.text('对比分析', 20, startY)
  
  doc.setFontSize(12)
  doc.setFont('NotoSansSC', 'normal')
  
  let currentY = startY + 15
  if (comparisonData.overview) {
    Object.entries(comparisonData.overview).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 25, currentY)
      currentY += 8
    })
  }
  
  return currentY + 10
}

/**
 * 添加页脚
 */
function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setFont('NotoSansSC', 'normal')
    doc.text(`第 ${i} 页，共 ${pageCount} 页`, 105, 290, { align: 'center' })
  }
}

/**
 * 获取当前日期
 */
function getCurrentDate() {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * 获取当前日期时间
 */
function getCurrentDateTime() {
  const now = new Date()
  return now.toLocaleString('zh-CN')
} 