/**
 * Excel导出工具
 * 支持多种格式的数据导出功能
 */

import * as XLSX from 'xlsx'

/**
 * 导出成绩数据到Excel
 * @param {Array} data - 要导出的数据
 * @param {Object} options - 导出选项
 * @param {string} options.filename - 文件名
 * @param {string} options.sheetName - 工作表名称
 * @param {Array} options.columns - 列配置
 * @param {Object} options.styles - 样式配置
 */
export function exportGradeDataToExcel(data, options = {}) {
  const {
    filename = '成绩数据',
    sheetName = '成绩统计',
    columns = [],
    styles = {}
  } = options

  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 准备数据
    const exportData = prepareExportData(data, columns)
    
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // 设置列宽
    if (columns.length > 0) {
      const colWidths = columns.map(col => ({ wch: col.width || 15 }))
      worksheet['!cols'] = colWidths
    }
    
    // 应用样式
    applyExcelStyles(worksheet, styles)
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    
    // 导出文件
    XLSX.writeFile(workbook, `${filename}_${getCurrentDate()}.xlsx`)
    
    return {
      success: true,
      message: 'Excel文件导出成功'
    }
  } catch (error) {
    console.error('Excel导出失败:', error)
    return {
      success: false,
      message: 'Excel文件导出失败: ' + error.message
    }
  }
}

/**
 * 导出统计报表到Excel
 * @param {Object} reportData - 报表数据
 * @param {Object} options - 导出选项
 */
export function exportReportToExcel(reportData, options = {}) {
  const {
    filename = '统计报表',
    sheetName = '成绩统计报表'
  } = options

  try {
    const workbook = XLSX.utils.book_new()
    
    // 创建概览工作表
    if (reportData.overview) {
      const overviewSheet = createOverviewSheet(reportData.overview)
      XLSX.utils.book_append_sheet(workbook, overviewSheet, '概览')
    }
    
    // 创建详细数据工作表
    if (reportData.details) {
      const detailsSheet = createDetailsSheet(reportData.details)
      XLSX.utils.book_append_sheet(workbook, detailsSheet, '详细数据')
    }
    
    // 创建图表工作表
    if (reportData.charts) {
      const chartsSheet = createChartsSheet(reportData.charts)
      XLSX.utils.book_append_sheet(workbook, chartsSheet, '图表数据')
    }
    
    // 导出文件
    XLSX.writeFile(workbook, `${filename}_${getCurrentDate()}.xlsx`)
    
    return {
      success: true,
      message: '统计报表导出成功'
    }
  } catch (error) {
    console.error('报表导出失败:', error)
    return {
      success: false,
      message: '统计报表导出失败: ' + error.message
    }
  }
}

/**
 * 导出趋势分析报表
 * @param {Object} trendData - 趋势数据
 * @param {Object} options - 导出选项
 */
export function exportTrendReportToExcel(trendData, options = {}) {
  const {
    filename = '趋势分析报表',
    sheetName = '趋势分析'
  } = options

  try {
    const workbook = XLSX.utils.book_new()
    
    // 趋势概览
    if (trendData.overview) {
      const overviewSheet = createTrendOverviewSheet(trendData.overview)
      XLSX.utils.book_append_sheet(workbook, overviewSheet, '趋势概览')
    }
    
    // 趋势详情
    if (trendData.details) {
      const detailsSheet = createTrendDetailsSheet(trendData.details)
      XLSX.utils.book_append_sheet(workbook, detailsSheet, '趋势详情')
    }
    
    // 趋势分析
    if (trendData.analysis) {
      const analysisSheet = createTrendAnalysisSheet(trendData.analysis)
      XLSX.utils.book_append_sheet(workbook, analysisSheet, '趋势分析')
    }
    
    XLSX.writeFile(workbook, `${filename}_${getCurrentDate()}.xlsx`)
    
    return {
      success: true,
      message: '趋势分析报表导出成功'
    }
  } catch (error) {
    console.error('趋势报表导出失败:', error)
    return {
      success: false,
      message: '趋势分析报表导出失败: ' + error.message
    }
  }
}

/**
 * 导出排名分析报表
 * @param {Object} rankingData - 排名数据
 * @param {Object} options - 导出选项
 */
export function exportRankingReportToExcel(rankingData, options = {}) {
  const {
    filename = '排名分析报表',
    sheetName = '排名分析'
  } = options

  try {
    const workbook = XLSX.utils.book_new()
    
    // 排名概览
    if (rankingData.overview) {
      const overviewSheet = createRankingOverviewSheet(rankingData.overview)
      XLSX.utils.book_append_sheet(workbook, overviewSheet, '排名概览')
    }
    
    // 排名详情
    if (rankingData.details) {
      const detailsSheet = createRankingDetailsSheet(rankingData.details)
      XLSX.utils.book_append_sheet(workbook, detailsSheet, '排名详情')
    }
    
    // 排名变化
    if (rankingData.changes) {
      const changesSheet = createRankingChangesSheet(rankingData.changes)
      XLSX.utils.book_append_sheet(workbook, changesSheet, '排名变化')
    }
    
    XLSX.writeFile(workbook, `${filename}_${getCurrentDate()}.xlsx`)
    
    return {
      success: true,
      message: '排名分析报表导出成功'
    }
  } catch (error) {
    console.error('排名报表导出失败:', error)
    return {
      success: false,
      message: '排名分析报表导出失败: ' + error.message
    }
  }
}

/**
 * 导出对比分析报表
 * @param {Object} comparisonData - 对比数据
 * @param {Object} options - 导出选项
 */
export function exportComparisonReportToExcel(comparisonData, options = {}) {
  const {
    filename = '对比分析报表',
    sheetName = '对比分析'
  } = options

  try {
    const workbook = XLSX.utils.book_new()
    
    // 对比概览
    if (comparisonData.overview) {
      const overviewSheet = createComparisonOverviewSheet(comparisonData.overview)
      XLSX.utils.book_append_sheet(workbook, overviewSheet, '对比概览')
    }
    
    // 对比详情
    if (comparisonData.details) {
      const detailsSheet = createComparisonDetailsSheet(comparisonData.details)
      XLSX.utils.book_append_sheet(workbook, detailsSheet, '对比详情')
    }
    
    // 差异分析
    if (comparisonData.differences) {
      const differencesSheet = createDifferencesSheet(comparisonData.differences)
      XLSX.utils.book_append_sheet(workbook, differencesSheet, '差异分析')
    }
    
    XLSX.writeFile(workbook, `${filename}_${getCurrentDate()}.xlsx`)
    
    return {
      success: true,
      message: '对比分析报表导出成功'
    }
  } catch (error) {
    console.error('对比报表导出失败:', error)
    return {
      success: false,
      message: '对比分析报表导出失败: ' + error.message
    }
  }
}

/**
 * 批量导出多个报表
 * @param {Array} reports - 报表配置数组
 * @param {Object} options - 导出选项
 */
export function batchExportReports(reports, options = {}) {
  const {
    filename = '批量报表',
    zipFile = true
  } = options

  try {
    const workbook = XLSX.utils.book_new()
    
    reports.forEach((report, index) => {
      const sheetName = report.sheetName || `报表${index + 1}`
      const worksheet = XLSX.utils.json_to_sheet(report.data)
      
      // 设置列宽
      if (report.columns) {
        const colWidths = report.columns.map(col => ({ wch: col.width || 15 }))
        worksheet['!cols'] = colWidths
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })
    
    XLSX.writeFile(workbook, `${filename}_${getCurrentDate()}.xlsx`)
    
    return {
      success: true,
      message: '批量报表导出成功'
    }
  } catch (error) {
    console.error('批量导出失败:', error)
    return {
      success: false,
      message: '批量报表导出失败: ' + error.message
    }
  }
}

// 辅助函数

/**
 * 准备导出数据
 */
function prepareExportData(data, columns) {
  if (!columns || columns.length === 0) {
    return data
  }
  
  return data.map(row => {
    const exportRow = {}
    columns.forEach(col => {
      exportRow[col.title] = row[col.key] || ''
    })
    return exportRow
  })
}

/**
 * 应用Excel样式
 */
function applyExcelStyles(worksheet, styles) {
  // 设置标题行样式
  if (styles.header) {
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center' }
      }
    }
  }
}

/**
 * 创建概览工作表
 */
function createOverviewSheet(overviewData) {
  const data = [
    ['成绩统计概览'],
    [''],
    ['统计项目', '数值'],
    ['总学生数', overviewData.totalStudents || 0],
    ['总课程数', overviewData.totalCourses || 0],
    ['成绩记录数', overviewData.totalRecords || 0],
    ['平均分', (overviewData.averageScore || 0).toFixed(1)],
    [''],
    ['生成时间', getCurrentDateTime()]
  ]
  
  return XLSX.utils.aoa_to_sheet(data)
}

/**
 * 创建详细数据工作表
 */
function createDetailsSheet(detailsData) {
  return XLSX.utils.json_to_sheet(detailsData)
}

/**
 * 创建图表数据工作表
 */
function createChartsSheet(chartsData) {
  const data = [
    ['图表数据'],
    [''],
    ['图表类型', '数据']
  ]
  
  Object.entries(chartsData).forEach(([type, chartData]) => {
    data.push([type, JSON.stringify(chartData)])
  })
  
  return XLSX.utils.aoa_to_sheet(data)
}

/**
 * 创建趋势概览工作表
 */
function createTrendOverviewSheet(overviewData) {
  const data = [
    ['趋势分析概览'],
    [''],
    ['分析周期数', overviewData.totalPeriods || 0],
    ['整体趋势', (overviewData.overallTrend || 0).toFixed(1)],
    ['最高增长', (overviewData.maxGrowth || 0).toFixed(1)],
    ['最大下降', (overviewData.maxDecline || 0).toFixed(1)],
    ['趋势稳定性', (overviewData.stability || 0).toFixed(2)],
    [''],
    ['生成时间', getCurrentDateTime()]
  ]
  
  return XLSX.utils.aoa_to_sheet(data)
}

/**
 * 创建趋势详情工作表
 */
function createTrendDetailsSheet(detailsData) {
  return XLSX.utils.json_to_sheet(detailsData)
}

/**
 * 创建趋势分析工作表
 */
function createTrendAnalysisSheet(analysisData) {
  const data = [
    ['趋势分析报告'],
    [''],
    ['分析内容', '结果']
  ]
  
  Object.entries(analysisData).forEach(([key, value]) => {
    data.push([key, value])
  })
  
  return XLSX.utils.aoa_to_sheet(data)
}

/**
 * 创建排名概览工作表
 */
function createRankingOverviewSheet(overviewData) {
  const data = [
    ['排名分析概览'],
    [''],
    ['参与排名学生', overviewData.totalStudents || 0],
    ['平均排名', (overviewData.averageRank || 0).toFixed(1)],
    ['排名提升学生', overviewData.improvedCount || 0],
    ['排名下降学生', overviewData.declinedCount || 0],
    ['排名稳定性', (overviewData.stability || 0).toFixed(2)],
    [''],
    ['生成时间', getCurrentDateTime()]
  ]
  
  return XLSX.utils.aoa_to_sheet(data)
}

/**
 * 创建排名详情工作表
 */
function createRankingDetailsSheet(detailsData) {
  return XLSX.utils.json_to_sheet(detailsData)
}

/**
 * 创建排名变化工作表
 */
function createRankingChangesSheet(changesData) {
  return XLSX.utils.json_to_sheet(changesData)
}

/**
 * 创建对比概览工作表
 */
function createComparisonOverviewSheet(overviewData) {
  const data = [
    ['对比分析概览'],
    [''],
    ['对比维度数', overviewData.totalComparisons || 0],
    ['差异程度', (overviewData.differenceLevel || 0).toFixed(1) + '%'],
    ['优势项目', overviewData.advantageCount || 0],
    ['劣势项目', overviewData.disadvantageCount || 0],
    [''],
    ['生成时间', getCurrentDateTime()]
  ]
  
  return XLSX.utils.aoa_to_sheet(data)
}

/**
 * 创建对比详情工作表
 */
function createComparisonDetailsSheet(detailsData) {
  return XLSX.utils.json_to_sheet(detailsData)
}

/**
 * 创建差异分析工作表
 */
function createDifferencesSheet(differencesData) {
  return XLSX.utils.json_to_sheet(differencesData)
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

/**
 * 默认列配置
 */
export const DEFAULT_COLUMNS = {
  grade: [
    { key: 'studentName', title: '学生姓名', width: 15 },
    { key: 'className', title: '班级', width: 12 },
    { key: 'courseName', title: '课程', width: 12 },
    { key: 'score', title: '成绩', width: 10 },
    { key: 'examDate', title: '考试日期', width: 15 },
    { key: 'remark', title: '备注', width: 20 }
  ],
  student: [
    { key: 'studentName', title: '学生姓名', width: 15 },
    { key: 'className', title: '班级', width: 12 },
    { key: 'averageScore', title: '平均分', width: 12 },
    { key: 'totalScore', title: '总分', width: 12 },
    { key: 'courseCount', title: '课程数', width: 10 },
    { key: 'passRate', title: '及格率', width: 12 },
    { key: 'excellentRate', title: '优秀率', width: 12 }
  ],
  class: [
    { key: 'className', title: '班级名称', width: 15 },
    { key: 'studentCount', title: '学生数', width: 10 },
    { key: 'averageScore', title: '平均分', width: 12 },
    { key: 'passRate', title: '及格率', width: 12 },
    { key: 'excellentRate', title: '优秀率', width: 12 },
    { key: 'highestScore', title: '最高分', width: 12 },
    { key: 'lowestScore', title: '最低分', width: 12 }
  ],
  course: [
    { key: 'courseName', title: '课程名称', width: 15 },
    { key: 'studentCount', title: '学生数', width: 10 },
    { key: 'averageScore', title: '平均分', width: 12 },
    { key: 'passRate', title: '及格率', width: 12 },
    { key: 'excellentRate', title: '优秀率', width: 12 },
    { key: 'highestScore', title: '最高分', width: 12 },
    { key: 'lowestScore', title: '最低分', width: 12 }
  ]
} 