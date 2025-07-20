/**
 * 报表模板管理工具
 * 实现自定义报表模板的创建、编辑和管理功能
 */

/**
 * 默认报表模板配置
 */
export const DEFAULT_TEMPLATES = {
  // 基础统计报表模板
  basicStats: {
    id: 'basicStats',
    name: '基础统计报表',
    description: '包含基础统计信息的报表模板',
    type: 'excel',
    sections: [
      {
        id: 'overview',
        name: '统计概览',
        type: 'overview',
        enabled: true,
        fields: ['totalStudents', 'totalCourses', 'totalRecords', 'averageScore']
      },
      {
        id: 'details',
        name: '详细数据',
        type: 'table',
        enabled: true,
        fields: ['studentName', 'className', 'courseName', 'score', 'examDate']
      }
    ],
    styles: {
      header: {
        backgroundColor: '#4472C4',
        textColor: '#FFFFFF',
        fontSize: 12,
        bold: true
      },
      data: {
        fontSize: 10,
        alternatingRows: true
      }
    }
  },

  // 趋势分析报表模板
  trendAnalysis: {
    id: 'trendAnalysis',
    name: '趋势分析报表',
    description: '包含趋势分析信息的报表模板',
    type: 'excel',
    sections: [
      {
        id: 'overview',
        name: '趋势概览',
        type: 'overview',
        enabled: true,
        fields: ['totalPeriods', 'overallTrend', 'maxGrowth', 'maxDecline', 'stability']
      },
      {
        id: 'details',
        name: '趋势详情',
        type: 'table',
        enabled: true,
        fields: ['period', 'value', 'trend', 'trendRate', 'description']
      },
      {
        id: 'analysis',
        name: '趋势分析',
        type: 'text',
        enabled: true,
        fields: ['trendAnalysis', 'recommendations']
      }
    ],
    styles: {
      header: {
        backgroundColor: '#70AD47',
        textColor: '#FFFFFF',
        fontSize: 12,
        bold: true
      },
      data: {
        fontSize: 10,
        alternatingRows: true
      }
    }
  },

  // 排名分析报表模板
  rankingAnalysis: {
    id: 'rankingAnalysis',
    name: '排名分析报表',
    description: '包含排名分析信息的报表模板',
    type: 'excel',
    sections: [
      {
        id: 'overview',
        name: '排名概览',
        type: 'overview',
        enabled: true,
        fields: ['totalStudents', 'averageRank', 'improvedCount', 'declinedCount', 'stability']
      },
      {
        id: 'details',
        name: '排名详情',
        type: 'table',
        enabled: true,
        fields: ['studentName', 'className', 'rank', 'previousRank', 'change', 'changeType']
      },
      {
        id: 'changes',
        name: '排名变化',
        type: 'table',
        enabled: true,
        fields: ['studentName', 'rankChange', 'changeRate', 'trend']
      }
    ],
    styles: {
      header: {
        backgroundColor: '#ED7D31',
        textColor: '#FFFFFF',
        fontSize: 12,
        bold: true
      },
      data: {
        fontSize: 10,
        alternatingRows: true
      }
    }
  },

  // 对比分析报表模板
  comparisonAnalysis: {
    id: 'comparisonAnalysis',
    name: '对比分析报表',
    description: '包含对比分析信息的报表模板',
    type: 'excel',
    sections: [
      {
        id: 'overview',
        name: '对比概览',
        type: 'overview',
        enabled: true,
        fields: ['totalComparisons', 'differenceLevel', 'advantageCount', 'disadvantageCount']
      },
      {
        id: 'details',
        name: '对比详情',
        type: 'table',
        enabled: true,
        fields: ['dimension', 'target1', 'target2', 'difference', 'advantage']
      },
      {
        id: 'differences',
        name: '差异分析',
        type: 'table',
        enabled: true,
        fields: ['metric', 'difference', 'significance', 'recommendation']
      }
    ],
    styles: {
      header: {
        backgroundColor: '#9C27B0',
        textColor: '#FFFFFF',
        fontSize: 12,
        bold: true
      },
      data: {
        fontSize: 10,
        alternatingRows: true
      }
    }
  },

  // 综合统计报表模板
  comprehensive: {
    id: 'comprehensive',
    name: '综合统计报表',
    description: '包含所有统计信息的综合报表模板',
    type: 'pdf',
    sections: [
      {
        id: 'overview',
        name: '统计概览',
        type: 'overview',
        enabled: true,
        fields: ['totalStudents', 'totalCourses', 'totalRecords', 'averageScore']
      },
      {
        id: 'trend',
        name: '趋势分析',
        type: 'section',
        enabled: true,
        fields: ['trendOverview', 'trendDetails', 'trendAnalysis']
      },
      {
        id: 'ranking',
        name: '排名分析',
        type: 'section',
        enabled: true,
        fields: ['rankingOverview', 'rankingDetails', 'rankingChanges']
      },
      {
        id: 'comparison',
        name: '对比分析',
        type: 'section',
        enabled: true,
        fields: ['comparisonOverview', 'comparisonDetails', 'differences']
      }
    ],
    styles: {
      title: {
        fontSize: 20,
        bold: true,
        alignment: 'center'
      },
      section: {
        fontSize: 16,
        bold: true
      },
      content: {
        fontSize: 12
      }
    }
  }
}

/**
 * 字段定义
 */
export const FIELD_DEFINITIONS = {
  // 基础统计字段
  totalStudents: {
    key: 'totalStudents',
    name: '总学生数',
    type: 'number',
    description: '参与统计的学生总数'
  },
  totalCourses: {
    key: 'totalCourses',
    name: '总课程数',
    type: 'number',
    description: '参与统计的课程总数'
  },
  totalRecords: {
    key: 'totalRecords',
    name: '成绩记录数',
    type: 'number',
    description: '成绩记录的总数'
  },
  averageScore: {
    key: 'averageScore',
    name: '平均分',
    type: 'number',
    description: '所有成绩的平均分',
    format: 'decimal'
  },

  // 学生信息字段
  studentName: {
    key: 'studentName',
    name: '学生姓名',
    type: 'string',
    description: '学生姓名'
  },
  className: {
    key: 'className',
    name: '班级',
    type: 'string',
    description: '学生所在班级'
  },
  courseName: {
    key: 'courseName',
    name: '课程',
    type: 'string',
    description: '课程名称'
  },
  score: {
    key: 'score',
    name: '成绩',
    type: 'number',
    description: '学生成绩',
    format: 'decimal'
  },
  examDate: {
    key: 'examDate',
    name: '考试日期',
    type: 'date',
    description: '考试日期',
    format: 'YYYY-MM-DD'
  },

  // 趋势分析字段
  totalPeriods: {
    key: 'totalPeriods',
    name: '分析周期数',
    type: 'number',
    description: '趋势分析的周期数量'
  },
  overallTrend: {
    key: 'overallTrend',
    name: '整体趋势',
    type: 'number',
    description: '整体趋势值',
    format: 'decimal'
  },
  maxGrowth: {
    key: 'maxGrowth',
    name: '最高增长',
    type: 'number',
    description: '最大增长值',
    format: 'decimal'
  },
  maxDecline: {
    key: 'maxDecline',
    name: '最大下降',
    type: 'number',
    description: '最大下降值',
    format: 'decimal'
  },
  stability: {
    key: 'stability',
    name: '趋势稳定性',
    type: 'number',
    description: '趋势稳定性指标',
    format: 'decimal'
  },
  period: {
    key: 'period',
    name: '时间周期',
    type: 'string',
    description: '时间周期标识'
  },
  value: {
    key: 'value',
    name: '数值',
    type: 'number',
    description: '该周期的数值',
    format: 'decimal'
  },
  trend: {
    key: 'trend',
    name: '变化量',
    type: 'number',
    description: '相对于上一周期的变化量',
    format: 'decimal'
  },
  trendRate: {
    key: 'trendRate',
    name: '变化率',
    type: 'number',
    description: '相对于上一周期的变化率',
    format: 'percentage'
  },
  description: {
    key: 'description',
    name: '描述',
    type: 'string',
    description: '趋势描述'
  },

  // 排名分析字段
  averageRank: {
    key: 'averageRank',
    name: '平均排名',
    type: 'number',
    description: '学生平均排名',
    format: 'decimal'
  },
  improvedCount: {
    key: 'improvedCount',
    name: '排名提升学生',
    type: 'number',
    description: '排名提升的学生数量'
  },
  declinedCount: {
    key: 'declinedCount',
    name: '排名下降学生',
    type: 'number',
    description: '排名下降的学生数量'
  },
  rank: {
    key: 'rank',
    name: '当前排名',
    type: 'number',
    description: '学生当前排名'
  },
  previousRank: {
    key: 'previousRank',
    name: '上次排名',
    type: 'number',
    description: '学生上次排名'
  },
  change: {
    key: 'change',
    name: '排名变化',
    type: 'number',
    description: '排名变化值'
  },
  changeType: {
    key: 'changeType',
    name: '变化类型',
    type: 'string',
    description: '排名变化类型（提升/下降/持平）'
  },
  rankChange: {
    key: 'rankChange',
    name: '排名变化',
    type: 'number',
    description: '排名变化值'
  },
  changeRate: {
    key: 'changeRate',
    name: '变化率',
    type: 'number',
    description: '排名变化率',
    format: 'percentage'
  },

  // 对比分析字段
  totalComparisons: {
    key: 'totalComparisons',
    name: '对比维度数',
    type: 'number',
    description: '对比分析的维度数量'
  },
  differenceLevel: {
    key: 'differenceLevel',
    name: '差异程度',
    type: 'number',
    description: '差异程度百分比',
    format: 'percentage'
  },
  advantageCount: {
    key: 'advantageCount',
    name: '优势项目',
    type: 'number',
    description: '优势项目数量'
  },
  disadvantageCount: {
    key: 'disadvantageCount',
    name: '劣势项目',
    type: 'number',
    description: '劣势项目数量'
  },
  dimension: {
    key: 'dimension',
    name: '对比维度',
    type: 'string',
    description: '对比分析的维度'
  },
  target1: {
    key: 'target1',
    name: '目标1',
    type: 'string',
    description: '对比目标1'
  },
  target2: {
    key: 'target2',
    name: '目标2',
    type: 'string',
    description: '对比目标2'
  },
  difference: {
    key: 'difference',
    name: '差异值',
    type: 'number',
    description: '两个目标的差异值',
    format: 'decimal'
  },
  advantage: {
    key: 'advantage',
    name: '优势方',
    type: 'string',
    description: '具有优势的一方'
  },
  metric: {
    key: 'metric',
    name: '指标',
    type: 'string',
    description: '对比指标'
  },
  significance: {
    key: 'significance',
    name: '显著性',
    type: 'string',
    description: '差异的显著性'
  },
  recommendation: {
    key: 'recommendation',
    name: '建议',
    type: 'string',
    description: '基于对比结果的建议'
  }
}

/**
 * 模板管理类
 */
export class ReportTemplateManager {
  constructor() {
    this.templates = new Map()
    this.loadDefaultTemplates()
  }

  /**
   * 加载默认模板
   */
  loadDefaultTemplates() {
    Object.values(DEFAULT_TEMPLATES).forEach(template => {
      this.templates.set(template.id, { ...template })
    })
  }

  /**
   * 获取所有模板
   */
  getAllTemplates() {
    return Array.from(this.templates.values())
  }

  /**
   * 根据ID获取模板
   */
  getTemplateById(id) {
    return this.templates.get(id)
  }

  /**
   * 根据类型获取模板
   */
  getTemplatesByType(type) {
    return Array.from(this.templates.values()).filter(template => template.type === type)
  }

  /**
   * 创建新模板
   */
  createTemplate(templateData) {
    const template = {
      id: templateData.id || `template_${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      type: templateData.type || 'excel',
      sections: templateData.sections || [],
      styles: templateData.styles || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.templates.set(template.id, template)
    return template
  }

  /**
   * 更新模板
   */
  updateTemplate(id, updates) {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`模板不存在: ${id}`)
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.templates.set(id, updatedTemplate)
    return updatedTemplate
  }

  /**
   * 删除模板
   */
  deleteTemplate(id) {
    if (DEFAULT_TEMPLATES[id]) {
      throw new Error('不能删除默认模板')
    }
    
    return this.templates.delete(id)
  }

  /**
   * 复制模板
   */
  copyTemplate(id, newName) {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`模板不存在: ${id}`)
    }

    const newTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: newName || `${template.name}_副本`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.templates.set(newTemplate.id, newTemplate)
    return newTemplate
  }

  /**
   * 验证模板
   */
  validateTemplate(template) {
    const errors = []

    if (!template.name || template.name.trim() === '') {
      errors.push('模板名称不能为空')
    }

    if (!template.type || !['excel', 'pdf'].includes(template.type)) {
      errors.push('模板类型必须是 excel 或 pdf')
    }

    if (!template.sections || template.sections.length === 0) {
      errors.push('模板必须包含至少一个部分')
    }

    template.sections.forEach((section, index) => {
      if (!section.name || section.name.trim() === '') {
        errors.push(`第 ${index + 1} 个部分名称不能为空`)
      }

      if (!section.type || !['overview', 'table', 'text', 'section'].includes(section.type)) {
        errors.push(`第 ${index + 1} 个部分类型无效`)
      }

      if (!section.fields || section.fields.length === 0) {
        errors.push(`第 ${index + 1} 个部分必须包含至少一个字段`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 导出模板配置
   */
  exportTemplateConfig(id) {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`模板不存在: ${id}`)
    }

    return {
      template,
      fieldDefinitions: FIELD_DEFINITIONS,
      exportTime: new Date().toISOString()
    }
  }

  /**
   * 导入模板配置
   */
  importTemplateConfig(config) {
    if (!config.template) {
      throw new Error('配置中缺少模板数据')
    }

    const validation = this.validateTemplate(config.template)
    if (!validation.isValid) {
      throw new Error(`模板验证失败: ${validation.errors.join(', ')}`)
    }

    const template = this.createTemplate(config.template)
    return template
  }

  /**
   * 获取模板预览数据
   */
  getTemplatePreview(templateId, sampleData) {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`模板不存在: ${templateId}`)
    }

    const preview = {
      template,
      sections: []
    }

    template.sections.forEach(section => {
      if (!section.enabled) return

      const sectionPreview = {
        id: section.id,
        name: section.name,
        type: section.type,
        data: this.generateSectionPreview(section, sampleData)
      }

      preview.sections.push(sectionPreview)
    })

    return preview
  }

  /**
   * 生成部分预览数据
   */
  generateSectionPreview(section, sampleData) {
    switch (section.type) {
      case 'overview':
        return this.generateOverviewPreview(section, sampleData)
      case 'table':
        return this.generateTablePreview(section, sampleData)
      case 'text':
        return this.generateTextPreview(section, sampleData)
      case 'section':
        return this.generateSectionPreview(section, sampleData)
      default:
        return []
    }
  }

  /**
   * 生成概览预览
   */
  generateOverviewPreview(section, sampleData) {
    const overview = {}
    section.fields.forEach(fieldKey => {
      const fieldDef = FIELD_DEFINITIONS[fieldKey]
      if (fieldDef && sampleData[fieldKey] !== undefined) {
        overview[fieldDef.name] = this.formatFieldValue(sampleData[fieldKey], fieldDef)
      }
    })
    return overview
  }

  /**
   * 生成表格预览
   */
  generateTablePreview(section, sampleData) {
    if (!sampleData || !Array.isArray(sampleData)) {
      return []
    }

    return sampleData.slice(0, 5).map(row => {
      const formattedRow = {}
      section.fields.forEach(fieldKey => {
        const fieldDef = FIELD_DEFINITIONS[fieldKey]
        if (fieldDef && row[fieldKey] !== undefined) {
          formattedRow[fieldDef.name] = this.formatFieldValue(row[fieldKey], fieldDef)
        }
      })
      return formattedRow
    })
  }

  /**
   * 生成文本预览
   */
  generateTextPreview(section, sampleData) {
    const text = {}
    section.fields.forEach(fieldKey => {
      const fieldDef = FIELD_DEFINITIONS[fieldKey]
      if (fieldDef && sampleData[fieldKey] !== undefined) {
        text[fieldDef.name] = this.formatFieldValue(sampleData[fieldKey], fieldDef)
      }
    })
    return text
  }

  /**
   * 格式化字段值
   */
  formatFieldValue(value, fieldDef) {
    if (value === null || value === undefined) {
      return '-'
    }

    switch (fieldDef.format) {
      case 'decimal':
        return typeof value === 'number' ? value.toFixed(2) : value
      case 'percentage':
        return typeof value === 'number' ? `${value.toFixed(1)}%` : value
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : value
      default:
        return value
    }
  }
}

/**
 * 创建模板管理器实例
 */
export const templateManager = new ReportTemplateManager()

/**
 * 获取字段定义
 */
export function getFieldDefinition(fieldKey) {
  return FIELD_DEFINITIONS[fieldKey]
}

/**
 * 获取所有字段定义
 */
export function getAllFieldDefinitions() {
  return FIELD_DEFINITIONS
}

/**
 * 根据类型获取字段定义
 */
export function getFieldDefinitionsByType(type) {
  return Object.values(FIELD_DEFINITIONS).filter(field => field.type === type)
} 