/**
 * API调用辅助函数
 * 严格按照明道云API规范进行数据操作
 */

import { api, env } from 'mdye';
import { parseFieldValue, formatFieldValue } from './fieldParser.js';

/**
 * 获取工作表数据
 * @param {object} params - 查询参数
 * @param {string} params.worksheetId - 工作表ID
 * @param {string} params.viewId - 视图ID
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.pageIndex - 页码
 * @param {array} params.sort - 排序条件
 * @param {array} params.filter - 筛选条件
 * @returns {Promise<object>} 查询结果
 */
export async function getWorksheetData(params) {
  try {
    const { getFilterRows } = api;
    const result = await getFilterRows(params);
    return {
      success: true,
      data: result,
      total: result.length
    };
  } catch (error) {
    console.error('获取工作表数据失败:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
}

/**
 * 获取工作表记录总数
 * @param {object} params - 查询参数
 * @param {string} params.worksheetId - 工作表ID
 * @param {string} params.viewId - 视图ID
 * @returns {Promise<object>} 查询结果
 */
export async function getWorksheetTotal(params) {
  try {
    const { getFilterRowsTotalNum } = api;
    const total = await getFilterRowsTotalNum(params);
    return {
      success: true,
      total
    };
  } catch (error) {
    console.error('获取记录总数失败:', error);
    return {
      success: false,
      error: error.message,
      total: 0
    };
  }
}

/**
 * 添加工作表记录
 * @param {object} params - 添加参数
 * @param {string} params.worksheetId - 工作表ID
 * @param {object} params.row - 记录数据
 * @returns {Promise<object>} 添加结果
 */
export async function addWorksheetRow(params) {
  try {
    const { addWorksheetRow } = api;
    const result = await addWorksheetRow(params);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('添加记录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新工作表记录
 * @param {object} params - 更新参数
 * @param {string} params.worksheetId - 工作表ID
 * @param {string} params.rowId - 记录ID
 * @param {object} params.row - 更新数据
 * @returns {Promise<object>} 更新结果
 */
export async function updateWorksheetRow(params) {
  try {
    const { updateWorksheetRow } = api;
    const result = await updateWorksheetRow(params);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('更新记录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 删除工作表记录
 * @param {object} params - 删除参数
 * @param {string} params.worksheetId - 工作表ID
 * @param {string} params.rowId - 记录ID
 * @returns {Promise<object>} 删除结果
 */
export async function deleteWorksheetRow(params) {
  try {
    const { deleteWorksheetRow } = api;
    const result = await deleteWorksheetRow(params);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('删除记录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取记录详情
 * @param {object} params - 查询参数
 * @param {string} params.worksheetId - 工作表ID
 * @param {string} params.rowId - 记录ID
 * @returns {Promise<object>} 查询结果
 */
export async function getRowDetail(params) {
  try {
    const { getRowDetail } = api;
    const result = await getRowDetail(params);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('获取记录详情失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取关联记录
 * @param {object} params - 查询参数
 * @param {string} params.worksheetId - 工作表ID
 * @param {string} params.rowId - 记录ID
 * @param {string} params.controlId - 控件ID
 * @returns {Promise<object>} 查询结果
 */
export async function getRowRelationRows(params) {
  try {
    const { getRowRelationRows } = api;
    const result = await getRowRelationRows(params);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('获取关联记录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 处理字段值，根据字段类型进行解析
 * @param {object} rowData - 原始数据
 * @param {object} fieldConfig - 字段配置
 * @returns {object} 处理后的数据
 */
export function processRowData(rowData, fieldConfig) {
  const processedData = {};
  
  for (const [fieldId, value] of Object.entries(rowData)) {
    const fieldInfo = fieldConfig[fieldId];
    if (fieldInfo) {
      processedData[fieldId] = parseFieldValue(value, fieldInfo.type);
    } else {
      processedData[fieldId] = value;
    }
  }
  
  return processedData;
}

/**
 * 格式化记录数据用于显示
 * @param {object} rowData - 原始数据
 * @param {object} fieldConfig - 字段配置
 * @returns {object} 格式化后的数据
 */
export function formatRowData(rowData, fieldConfig) {
  const formattedData = {};
  
  for (const [fieldId, value] of Object.entries(rowData)) {
    const fieldInfo = fieldConfig[fieldId];
    if (fieldInfo) {
      formattedData[fieldId] = formatFieldValue(value, fieldInfo.type);
    } else {
      formattedData[fieldId] = value;
    }
  }
  
  return formattedData;
}

/**
 * 构建查询参数
 * @param {object} options - 查询选项
 * @param {string} options.worksheetId - 工作表ID
 * @param {string} options.viewId - 视图ID
 * @param {number} options.pageSize - 每页数量
 * @param {number} options.pageIndex - 页码
 * @param {array} options.sort - 排序条件
 * @param {array} options.filter - 筛选条件
 * @returns {object} 查询参数
 */
export function buildQueryParams(options) {
  const {
    worksheetId,
    viewId,
    pageSize = 20,
    pageIndex = 1,
    sort = [],
    filter = []
  } = options;
  
  return {
    worksheetId,
    viewId,
    pageSize,
    pageIndex,
    sort,
    filter
  };
}

/**
 * 构建筛选条件
 * @param {array} conditions - 筛选条件数组
 * @returns {array} 筛选条件
 */
export function buildFilterConditions(conditions) {
  return conditions.map(condition => ({
    controlId: condition.fieldId,
    dataType: condition.dataType || 1,
    spliceType: condition.spliceType || 1,
    filterType: condition.filterType || 1,
    value: condition.value
  }));
}

/**
 * 构建排序条件
 * @param {array} sorts - 排序条件数组
 * @returns {array} 排序条件
 */
export function buildSortConditions(sorts) {
  return sorts.map(sort => ({
    controlId: sort.fieldId,
    isAsc: sort.isAsc !== false
  }));
}

/**
 * 检查API权限
 * @param {string} permission - 权限类型
 * @returns {boolean} 是否有权限
 */
export function checkPermission(permission) {
  // 这里可以根据实际需求实现权限检查逻辑
  // 目前返回true，表示有权限
  return true;
}

/**
 * 批量操作结果处理
 * @param {array} results - 操作结果数组
 * @returns {object} 处理结果
 */
export function processBatchResults(results) {
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  const errors = results.filter(r => !r.success).map(r => r.error);
  
  return {
    total: results.length,
    success: successCount,
    fail: failCount,
    errors,
    successRate: results.length > 0 ? (successCount / results.length) * 100 : 0
  };
} 