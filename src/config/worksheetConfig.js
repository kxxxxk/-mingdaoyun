/**
 * 工作表配置文件
 * 管理不同工作表的ID映射和字段配置
 */

import { env } from 'mdye';

/**
 * 工作表ID配置
 * 从环境变量中获取，如果没有配置则使用默认值
 */
export const worksheetConfig = {
  // 学生信息工作表
  student: {
    worksheetId: env.STUDENT_WORKSHEET_ID || '',
    viewId: env.STUDENT_VIEW_ID || '',
    fields: {
      studentName: env.STUDENT_NAME_FIELD_ID || 'studentName',
      studentId: env.STUDENT_ID_FIELD_ID || 'studentId',
      className: env.STUDENT_CLASS_FIELD_ID || 'className',
      grade: env.STUDENT_GRADE_FIELD_ID || 'grade'
    }
  },
  
  // 课程信息工作表
  course: {
    worksheetId: env.COURSE_WORKSHEET_ID || '',
    viewId: env.COURSE_VIEW_ID || '',
    fields: {
      courseName: env.COURSE_NAME_FIELD_ID || 'courseName',
      courseCode: env.COURSE_CODE_FIELD_ID || 'courseCode',
      teacherName: env.COURSE_TEACHER_FIELD_ID || 'teacherName',
      credit: env.COURSE_CREDIT_FIELD_ID || 'credit'
    }
  },
  
  // 成绩记录工作表
  grade: {
    worksheetId: env.GRADE_WORKSHEET_ID || '',
    viewId: env.GRADE_VIEW_ID || '',
    fields: {
      studentId: env.GRADE_STUDENT_FIELD_ID || 'studentId',
      courseId: env.GRADE_COURSE_FIELD_ID || 'courseId',
      score: env.GRADE_SCORE_FIELD_ID || 'score',
      examDate: env.GRADE_EXAM_DATE_FIELD_ID || 'examDate',
      remark: env.GRADE_REMARK_FIELD_ID || 'remark',
      createTime: env.GRADE_CREATE_TIME_FIELD_ID || 'createTime'
    }
  }
};

/**
 * 字段类型配置
 */
export const fieldTypeConfig = {
  // 文本字段
  text: {
    type: 'text',
    validation: {
      required: false,
      maxLength: 255
    }
  },
  
  // 数字字段
  number: {
    type: 'number',
    validation: {
      required: false,
      min: 0,
      max: 100
    }
  },
  
  // 日期字段
  date: {
    type: 'date',
    validation: {
      required: false
    }
  },
  
  // 单选字段
  singleChoice: {
    type: 'singleChoice',
    validation: {
      required: false
    }
  },
  
  // 多选字段
  multipleChoice: {
    type: 'multipleChoice',
    validation: {
      required: false
    }
  },
  
  // 成员字段
  member: {
    type: 'member',
    validation: {
      required: false
    }
  },
  
  // 部门字段
  department: {
    type: 'department',
    validation: {
      required: false
    }
  }
};

/**
 * 成绩验证规则
 */
export const gradeValidationRules = {
  score: {
    min: 0,
    max: 100,
    allowDecimal: true,
    precision: 1
  },
  examDate: {
    maxDate: new Date().toISOString().split('T')[0], // 不能超过今天
    minDate: '2020-01-01' // 最早日期
  },
  remark: {
    maxLength: 500
  }
};

/**
 * 获取工作表配置
 * @param {string} type - 工作表类型 (student, course, grade)
 * @returns {object} 工作表配置
 */
export function getWorksheetConfig(type) {
  return worksheetConfig[type] || null;
}

/**
 * 获取字段配置
 * @param {string} worksheetType - 工作表类型
 * @param {string} fieldName - 字段名称
 * @returns {object} 字段配置
 */
export function getFieldConfig(worksheetType, fieldName) {
  const config = worksheetConfig[worksheetType];
  if (!config || !config.fields[fieldName]) {
    return null;
  }
  
  return {
    fieldId: config.fields[fieldName],
    ...fieldTypeConfig[getFieldType(fieldName)]
  };
}

/**
 * 根据字段名称推断字段类型
 * @param {string} fieldName - 字段名称
 * @returns {string} 字段类型
 */
function getFieldType(fieldName) {
  const fieldNameLower = fieldName.toLowerCase();
  
  if (fieldNameLower.includes('date') || fieldNameLower.includes('time')) {
    return 'date';
  }
  
  if (fieldNameLower.includes('score') || fieldNameLower.includes('grade') || 
      fieldNameLower.includes('credit') || fieldNameLower.includes('number')) {
    return 'number';
  }
  
  if (fieldNameLower.includes('remark') || fieldNameLower.includes('note') || 
      fieldNameLower.includes('description')) {
    return 'text';
  }
  
  return 'text';
}

/**
 * 检查配置完整性
 * @returns {object} 检查结果
 */
export function checkConfigIntegrity() {
  const results = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  // 检查学生工作表配置
  if (!worksheetConfig.student.worksheetId) {
    results.valid = false;
    results.errors.push('学生工作表ID未配置');
  }
  
  // 检查课程工作表配置
  if (!worksheetConfig.course.worksheetId) {
    results.valid = false;
    results.errors.push('课程工作表ID未配置');
  }
  
  // 检查成绩工作表配置
  if (!worksheetConfig.grade.worksheetId) {
    results.valid = false;
    results.errors.push('成绩工作表ID未配置');
  }
  
  // 检查字段配置
  Object.keys(worksheetConfig).forEach(type => {
    const config = worksheetConfig[type];
    Object.keys(config.fields).forEach(fieldName => {
      if (!config.fields[fieldName]) {
        results.warnings.push(`${type}工作表的${fieldName}字段ID未配置`);
      }
    });
  });
  
  return results;
}

/**
 * 获取环境变量信息
 * @returns {object} 环境变量信息
 */
export function getEnvironmentInfo() {
  const info = {
    configured: {},
    missing: [],
    total: 0
  };
  
  // 检查工作表ID
  const worksheetIds = [
    'STUDENT_WORKSHEET_ID',
    'COURSE_WORKSHEET_ID', 
    'GRADE_WORKSHEET_ID'
  ];
  
  worksheetIds.forEach(id => {
    info.total++;
    if (env[id]) {
      info.configured[id] = env[id];
    } else {
      info.missing.push(id);
    }
  });
  
  // 检查视图ID
  const viewIds = [
    'STUDENT_VIEW_ID',
    'COURSE_VIEW_ID',
    'GRADE_VIEW_ID'
  ];
  
  viewIds.forEach(id => {
    info.total++;
    if (env[id]) {
      info.configured[id] = env[id];
    } else {
      info.missing.push(id);
    }
  });
  
  return info;
}

/**
 * 生成配置示例
 * @returns {string} 配置示例
 */
export function generateConfigExample() {
  return `
// 环境变量配置示例
STUDENT_WORKSHEET_ID=your_student_worksheet_id
COURSE_WORKSHEET_ID=your_course_worksheet_id
GRADE_WORKSHEET_ID=your_grade_worksheet_id

STUDENT_VIEW_ID=your_student_view_id
COURSE_VIEW_ID=your_course_view_id
GRADE_VIEW_ID=your_grade_view_id

// 字段ID配置（可选）
STUDENT_NAME_FIELD_ID=field_id_for_student_name
STUDENT_ID_FIELD_ID=field_id_for_student_id
COURSE_NAME_FIELD_ID=field_id_for_course_name
GRADE_SCORE_FIELD_ID=field_id_for_score
  `.trim();
} 