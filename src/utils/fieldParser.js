/**
 * 字段值解析工具函数库
 * 严格按照明道云字段类型规范处理各种字段类型
 */

/**
 * 解析单选字段值
 * @param {any} value - 字段值
 * @returns {string} 解析后的值
 */
export function parseSingleChoice(value) {
  if (!value) return '';
  
  // 单选字段可能是对象或字符串
  if (typeof value === 'object' && value.value !== undefined) {
    return value.value;
  }
  
  return String(value);
}

/**
 * 解析多选字段值
 * @param {any} value - 字段值
 * @returns {string[]} 解析后的值数组
 */
export function parseMultipleChoice(value) {
  if (!value) return [];
  
  // 多选字段可能是数组或字符串
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'object' && item.value !== undefined) {
        return item.value;
      }
      return String(item);
    });
  }
  
  // 如果是字符串，尝试解析为数组
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item));
      }
    } catch (e) {
      // 如果不是JSON格式，按逗号分割
      return value.split(',').map(item => item.trim()).filter(item => item);
    }
  }
  
  return [];
}

/**
 * 解析成员字段值
 * @param {any} value - 字段值
 * @returns {object[]} 解析后的成员对象数组
 */
export function parseMember(value) {
  if (!value) return [];
  
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'object') {
        return {
          id: item.id || item.accountId || '',
          name: item.name || item.accountName || '',
          avatar: item.avatar || ''
        };
      }
      return { id: String(item), name: '', avatar: '' };
    });
  }
  
  if (typeof value === 'object') {
    return [{
      id: value.id || value.accountId || '',
      name: value.name || value.accountName || '',
      avatar: value.avatar || ''
    }];
  }
  
  return [];
}

/**
 * 解析部门字段值
 * @param {any} value - 字段值
 * @returns {object[]} 解析后的部门对象数组
 */
export function parseDepartment(value) {
  if (!value) return [];
  
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'object') {
        return {
          id: item.id || item.departmentId || '',
          name: item.name || item.departmentName || ''
        };
      }
      return { id: String(item), name: '' };
    });
  }
  
  if (typeof value === 'object') {
    return [{
      id: value.id || value.departmentId || '',
      name: value.name || value.departmentName || ''
    }];
  }
  
  return [];
}

/**
 * 解析日期字段值
 * @param {any} value - 字段值
 * @returns {string} 解析后的日期字符串
 */
export function parseDate(value) {
  if (!value) return '';
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object' && value.value !== undefined) {
    return value.value;
  }
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  
  return String(value);
}

/**
 * 解析数字字段值
 * @param {any} value - 字段值
 * @returns {number} 解析后的数字
 */
export function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * 解析文本字段值
 * @param {any} value - 字段值
 * @returns {string} 解析后的文本
 */
export function parseText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  return String(value);
}

/**
 * 根据字段类型解析字段值
 * @param {any} value - 字段值
 * @param {string} fieldType - 字段类型
 * @returns {any} 解析后的值
 */
export function parseFieldValue(value, fieldType) {
  switch (fieldType) {
    case 'singleChoice':
      return parseSingleChoice(value);
    case 'multipleChoice':
      return parseMultipleChoice(value);
    case 'member':
      return parseMember(value);
    case 'department':
      return parseDepartment(value);
    case 'date':
      return parseDate(value);
    case 'number':
      return parseNumber(value);
    case 'text':
    case 'textarea':
    default:
      return parseText(value);
  }
}

/**
 * 格式化字段值用于显示
 * @param {any} value - 字段值
 * @param {string} fieldType - 字段类型
 * @returns {string} 格式化后的显示文本
 */
export function formatFieldValue(value, fieldType) {
  const parsed = parseFieldValue(value, fieldType);
  
  switch (fieldType) {
    case 'multipleChoice':
      return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
    case 'member':
      return Array.isArray(parsed) ? parsed.map(m => m.name).join(', ') : String(parsed);
    case 'department':
      return Array.isArray(parsed) ? parsed.map(d => d.name).join(', ') : String(parsed);
    default:
      return String(parsed);
  }
}

/**
 * 验证字段值是否有效
 * @param {any} value - 字段值
 * @param {string} fieldType - 字段类型
 * @param {object} fieldConfig - 字段配置
 * @returns {boolean} 是否有效
 */
export function validateFieldValue(value, fieldType, fieldConfig = {}) {
  if (fieldConfig.required && (value === null || value === undefined || value === '')) {
    return false;
  }
  
  switch (fieldType) {
    case 'number':
      const num = parseNumber(value);
      if (fieldConfig.min !== undefined && num < fieldConfig.min) {
        return false;
      }
      if (fieldConfig.max !== undefined && num > fieldConfig.max) {
        return false;
      }
      break;
    case 'date':
      const date = parseDate(value);
      if (date && !isValidDate(date)) {
        return false;
      }
      break;
  }
  
  return true;
}

/**
 * 检查日期是否有效
 * @param {string} dateString - 日期字符串
 * @returns {boolean} 是否有效
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * 获取字段的默认值
 * @param {string} fieldType - 字段类型
 * @returns {any} 默认值
 */
export function getFieldDefaultValue(fieldType) {
  switch (fieldType) {
    case 'singleChoice':
      return '';
    case 'multipleChoice':
      return [];
    case 'member':
      return [];
    case 'department':
      return [];
    case 'date':
      return '';
    case 'number':
      return 0;
    case 'text':
    case 'textarea':
    default:
      return '';
  }
} 