/**
 * 数据验证工具函数
 * 用于验证成绩录入数据的有效性
 */

import { parseNumber, parseDate } from './fieldParser.js';

/**
 * 验证成绩分数
 * @param {any} score - 成绩分数
 * @param {object} options - 验证选项
 * @param {number} options.min - 最低分数
 * @param {number} options.max - 最高分数
 * @param {boolean} options.allowDecimal - 是否允许小数
 * @returns {object} 验证结果
 */
export function validateScore(score, options = {}) {
  const {
    min = 0,
    max = 100,
    allowDecimal = true
  } = options;
  
  const num = parseNumber(score);
  
  // 检查是否为有效数字
  if (isNaN(num)) {
    return {
      valid: false,
      message: '成绩必须是有效的数字'
    };
  }
  
  // 检查小数位数
  if (!allowDecimal && num % 1 !== 0) {
    return {
      valid: false,
      message: '成绩必须是整数'
    };
  }
  
  // 检查分数范围
  if (num < min) {
    return {
      valid: false,
      message: `成绩不能低于${min}分`
    };
  }
  
  if (num > max) {
    return {
      valid: false,
      message: `成绩不能高于${max}分`
    };
  }
  
  return {
    valid: true,
    message: '成绩有效'
  };
}

/**
 * 验证学生信息
 * @param {any} student - 学生信息
 * @returns {object} 验证结果
 */
export function validateStudent(student) {
  if (!student) {
    return {
      valid: false,
      message: '请选择学生'
    };
  }
  
  if (typeof student === 'string' && student.trim() === '') {
    return {
      valid: false,
      message: '请选择学生'
    };
  }
  
  if (typeof student === 'object' && (!student.id || !student.name)) {
    return {
      valid: false,
      message: '学生信息不完整'
    };
  }
  
  return {
    valid: true,
    message: '学生信息有效'
  };
}

/**
 * 验证课程信息
 * @param {any} course - 课程信息
 * @returns {object} 验证结果
 */
export function validateCourse(course) {
  if (!course) {
    return {
      valid: false,
      message: '请选择课程'
    };
  }
  
  if (typeof course === 'string' && course.trim() === '') {
    return {
      valid: false,
      message: '请选择课程'
    };
  }
  
  if (typeof course === 'object' && (!course.id || !course.name)) {
    return {
      valid: false,
      message: '课程信息不完整'
    };
  }
  
  return {
    valid: true,
    message: '课程信息有效'
  };
}

/**
 * 验证考试日期
 * @param {any} date - 考试日期
 * @param {object} options - 验证选项
 * @param {string} options.minDate - 最早日期
 * @param {string} options.maxDate - 最晚日期
 * @returns {object} 验证结果
 */
export function validateExamDate(date, options = {}) {
  if (!date) {
    return {
      valid: false,
      message: '请选择考试日期'
    };
  }
  
  const dateStr = parseDate(date);
  if (!dateStr) {
    return {
      valid: false,
      message: '日期格式无效'
    };
  }
  
  const examDate = new Date(dateStr);
  const today = new Date();
  
  // 检查日期是否有效
  if (isNaN(examDate.getTime())) {
    return {
      valid: false,
      message: '日期格式无效'
    };
  }
  
  // 检查是否超过今天
  if (examDate > today) {
    return {
      valid: false,
      message: '考试日期不能超过今天'
    };
  }
  
  // 检查最小日期
  if (options.minDate) {
    const minDate = new Date(options.minDate);
    if (examDate < minDate) {
      return {
        valid: false,
        message: `考试日期不能早于${options.minDate}`
      };
    }
  }
  
  // 检查最大日期
  if (options.maxDate) {
    const maxDate = new Date(options.maxDate);
    if (examDate > maxDate) {
      return {
        valid: false,
        message: `考试日期不能晚于${options.maxDate}`
      };
    }
  }
  
  return {
    valid: true,
    message: '考试日期有效'
  };
}

/**
 * 验证成绩记录完整性
 * @param {object} record - 成绩记录
 * @param {object} options - 验证选项
 * @returns {object} 验证结果
 */
export function validateGradeRecord(record, options = {}) {
  const errors = [];
  
  // 验证学生信息
  const studentResult = validateStudent(record.student);
  if (!studentResult.valid) {
    errors.push(studentResult.message);
  }
  
  // 验证课程信息
  const courseResult = validateCourse(record.course);
  if (!courseResult.valid) {
    errors.push(courseResult.message);
  }
  
  // 验证成绩分数
  const scoreResult = validateScore(record.score, options.score);
  if (!scoreResult.valid) {
    errors.push(scoreResult.message);
  }
  
  // 验证考试日期
  const dateResult = validateExamDate(record.examDate, options.date);
  if (!dateResult.valid) {
    errors.push(dateResult.message);
  }
  
  // 验证备注（可选）
  if (record.remark && typeof record.remark === 'string' && record.remark.length > 500) {
    errors.push('备注不能超过500个字符');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    message: errors.length === 0 ? '成绩记录有效' : errors.join('; ')
  };
}

/**
 * 验证批量导入数据
 * @param {array} data - 批量数据
 * @param {object} options - 验证选项
 * @returns {object} 验证结果
 */
export function validateBatchData(data, options = {}) {
  if (!Array.isArray(data)) {
    return {
      valid: false,
      message: '数据格式错误，必须是数组'
    };
  }
  
  if (data.length === 0) {
    return {
      valid: false,
      message: '没有数据需要导入'
    };
  }
  
  const maxCount = options.maxCount || 1000;
  if (data.length > maxCount) {
    return {
      valid: false,
      message: `单次导入不能超过${maxCount}条记录`
    };
  }
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    const rowNumber = i + 1;
    
    const result = validateGradeRecord(record, options);
    if (!result.valid) {
      errors.push({
        row: rowNumber,
        errors: result.errors,
        data: record
      });
    }
    
    results.push({
      row: rowNumber,
      valid: result.valid,
      errors: result.errors
    });
  }
  
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.length - validCount;
  
  return {
    valid: invalidCount === 0,
    total: data.length,
    valid: validCount,
    invalid: invalidCount,
    errors,
    results,
    message: invalidCount === 0 
      ? `所有${data.length}条记录验证通过` 
      : `${validCount}条记录有效，${invalidCount}条记录有错误`
  };
}

/**
 * 验证字段值格式
 * @param {any} value - 字段值
 * @param {string} fieldType - 字段类型
 * @param {object} fieldConfig - 字段配置
 * @returns {object} 验证结果
 */
export function validateFieldFormat(value, fieldType, fieldConfig = {}) {
  switch (fieldType) {
    case 'text':
    case 'textarea':
      if (fieldConfig.required && (!value || value.trim() === '')) {
        return {
          valid: false,
          message: '此字段为必填项'
        };
      }
      if (value && fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
        return {
          valid: false,
          message: `文本长度不能超过${fieldConfig.maxLength}个字符`
        };
      }
      break;
      
    case 'number':
      if (fieldConfig.required && (value === null || value === undefined || value === '')) {
        return {
          valid: false,
          message: '此字段为必填项'
        };
      }
      if (value !== null && value !== undefined && value !== '') {
        const num = parseNumber(value);
        if (isNaN(num)) {
          return {
            valid: false,
            message: '请输入有效的数字'
          };
        }
        if (fieldConfig.min !== undefined && num < fieldConfig.min) {
          return {
            valid: false,
            message: `数值不能小于${fieldConfig.min}`
          };
        }
        if (fieldConfig.max !== undefined && num > fieldConfig.max) {
          return {
            valid: false,
            message: `数值不能大于${fieldConfig.max}`
          };
        }
      }
      break;
      
    case 'date':
      if (fieldConfig.required && (!value || value.trim() === '')) {
        return {
          valid: false,
          message: '此字段为必填项'
        };
      }
      if (value && value.trim() !== '') {
        const date = parseDate(value);
        if (!date || isNaN(new Date(date).getTime())) {
          return {
            valid: false,
            message: '请输入有效的日期'
          };
        }
      }
      break;
      
    case 'singleChoice':
      if (fieldConfig.required && (!value || value.trim() === '')) {
        return {
          valid: false,
          message: '此字段为必填项'
        };
      }
      break;
      
    case 'member':
      if (fieldConfig.required && (!value || (Array.isArray(value) && value.length === 0))) {
        return {
          valid: false,
          message: '此字段为必填项'
        };
      }
      break;
  }
  
  return {
    valid: true,
    message: '字段值有效'
  };
}

/**
 * 生成验证规则
 * @param {object} fieldConfig - 字段配置
 * @returns {array} 验证规则数组
 */
export function generateValidationRules(fieldConfig) {
  const rules = [];
  
  if (fieldConfig.required) {
    rules.push({
      required: true,
      message: '此字段为必填项',
      trigger: 'blur'
    });
  }
  
  switch (fieldConfig.type) {
    case 'number':
      rules.push({
        type: 'number',
        message: '请输入有效的数字',
        trigger: 'blur'
      });
      if (fieldConfig.min !== undefined) {
        rules.push({
          min: fieldConfig.min,
          message: `数值不能小于${fieldConfig.min}`,
          trigger: 'blur'
        });
      }
      if (fieldConfig.max !== undefined) {
        rules.push({
          max: fieldConfig.max,
          message: `数值不能大于${fieldConfig.max}`,
          trigger: 'blur'
        });
      }
      break;
      
    case 'date':
      rules.push({
        type: 'date',
        message: '请输入有效的日期',
        trigger: 'change'
      });
      break;
  }
  
  return rules;
} 