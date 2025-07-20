/**
 * Excel处理工具函数
 * 用于解析Excel文件和生成模板
 */

import * as XLSX from 'xlsx';
import { validateBatchData } from './validators.js';

/**
 * 解析Excel文件
 * @param {File} file - Excel文件对象
 * @param {object} options - 解析选项
 * @returns {Promise<object>} 解析结果
 */
export async function parseExcelFile(file, options = {}) {
  try {
    const {
      sheetName = 0, // 默认读取第一个工作表
      headerRow = 0, // 默认第一行为表头
      startRow = 1,  // 数据从第二行开始
      maxRows = 1000 // 最大行数限制
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 获取工作表
          const sheetNames = workbook.SheetNames;
          const sheetNameToUse = typeof sheetName === 'number' ? sheetNames[sheetName] : sheetName;
          
          if (!workbook.Sheets[sheetNameToUse]) {
            reject(new Error(`工作表 "${sheetNameToUse}" 不存在`));
            return;
          }
          
          // 解析工作表数据
          const worksheet = workbook.Sheets[sheetNameToUse];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false
          });
          
          if (jsonData.length === 0) {
            reject(new Error('Excel文件为空'));
            return;
          }
          
          // 提取表头
          const headers = jsonData[headerRow] || [];
          if (headers.length === 0) {
            reject(new Error('未找到有效的表头'));
            return;
          }
          
          // 提取数据行
          const dataRows = jsonData.slice(startRow, startRow + maxRows);
          const parsedData = dataRows
            .filter(row => row.some(cell => cell !== '')) // 过滤空行
            .map((row, index) => {
              const rowData = {};
              headers.forEach((header, colIndex) => {
                if (header) {
                  rowData[header] = row[colIndex] || '';
                }
              });
              return {
                rowNumber: startRow + index + 1,
                data: rowData
              };
            });
          
          resolve({
            success: true,
            headers,
            data: parsedData,
            totalRows: parsedData.length,
            sheetName: sheetNameToUse
          });
          
        } catch (error) {
          reject(new Error(`解析Excel文件失败: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 验证Excel数据格式
 * @param {array} data - Excel解析的数据
 * @param {object} fieldMapping - 字段映射配置
 * @returns {object} 验证结果
 */
export function validateExcelData(data, fieldMapping) {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    validData: [],
    invalidData: []
  };
  
  if (!Array.isArray(data) || data.length === 0) {
    results.valid = false;
    results.errors.push('Excel文件中没有有效数据');
    return results;
  }
  
  // 检查必需字段
  const requiredFields = ['学生姓名', '课程名称', '成绩', '考试日期'];
  const missingFields = requiredFields.filter(field => 
    !fieldMapping[field] || !data.some(row => row.data[fieldMapping[field]] !== undefined)
  );
  
  if (missingFields.length > 0) {
    results.valid = false;
    results.errors.push(`缺少必需字段: ${missingFields.join(', ')}`);
    return results;
  }
  
  // 验证每一行数据
  data.forEach((row, index) => {
    const rowErrors = [];
    const rowData = row.data;
    
    // 验证学生姓名
    const studentName = rowData[fieldMapping['学生姓名']];
    if (!studentName || studentName.trim() === '') {
      rowErrors.push('学生姓名不能为空');
    }
    
    // 验证课程名称
    const courseName = rowData[fieldMapping['课程名称']];
    if (!courseName || courseName.trim() === '') {
      rowErrors.push('课程名称不能为空');
    }
    
    // 验证成绩
    const score = rowData[fieldMapping['成绩']];
    if (score === undefined || score === '') {
      rowErrors.push('成绩不能为空');
    } else {
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        rowErrors.push('成绩必须是0-100之间的数字');
      }
    }
    
    // 验证考试日期
    const examDate = rowData[fieldMapping['考试日期']];
    if (!examDate || examDate.trim() === '') {
      rowErrors.push('考试日期不能为空');
    } else {
      const date = new Date(examDate);
      if (isNaN(date.getTime())) {
        rowErrors.push('考试日期格式无效');
      } else if (date > new Date()) {
        rowErrors.push('考试日期不能超过今天');
      }
    }
    
    // 验证备注（可选）
    const remark = rowData[fieldMapping['备注']];
    if (remark && typeof remark === 'string' && remark.length > 500) {
      rowErrors.push('备注不能超过500个字符');
    }
    
    if (rowErrors.length > 0) {
      results.invalidData.push({
        rowNumber: row.rowNumber,
        data: rowData,
        errors: rowErrors
      });
    } else {
      results.validData.push({
        rowNumber: row.rowNumber,
        data: rowData
      });
    }
  });
  
  results.valid = results.invalidData.length === 0;
  results.totalRows = data.length;
  results.validRows = results.validData.length;
  results.invalidRows = results.invalidData.length;
  
  return results;
}

/**
 * 生成Excel模板
 * @param {object} options - 模板选项
 * @returns {Blob} Excel文件Blob对象
 */
export function generateExcelTemplate(options = {}) {
  const {
    includeSampleData = true,
    sheetName = '成绩录入模板'
  } = options;
  
  // 定义表头
  const headers = [
    '学生姓名',
    '课程名称', 
    '成绩',
    '考试日期',
    '备注'
  ];
  
  // 定义列宽
  const colWidths = [
    { wch: 15 }, // 学生姓名
    { wch: 20 }, // 课程名称
    { wch: 10 }, // 成绩
    { wch: 15 }, // 考试日期
    { wch: 30 }  // 备注
  ];
  
  // 创建工作表数据
  const worksheetData = [headers];
  
  // 添加示例数据
  if (includeSampleData) {
    const sampleData = [
      ['张三', '数学', '85.5', '2024-12-01', '期中考试'],
      ['李四', '英语', '92.0', '2024-12-01', '期中考试'],
      ['王五', '物理', '78.5', '2024-12-01', '期中考试']
    ];
    worksheetData.push(...sampleData);
  }
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // 设置列宽
  worksheet['!cols'] = colWidths;
  
  // 设置单元格样式
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // 设置表头样式
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) {
      worksheet[cellAddress] = { v: headers[col] };
    }
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // 生成文件
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  });
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

/**
 * 下载Excel模板
 * @param {object} options - 下载选项
 */
export function downloadExcelTemplate(options = {}) {
  const blob = generateExcelTemplate(options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '成绩录入模板.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 将数据转换为Excel格式
 * @param {array} data - 要导出的数据
 * @param {object} options - 导出选项
 * @returns {Blob} Excel文件Blob对象
 */
export function exportDataToExcel(data, options = {}) {
  const {
    sheetName = '成绩数据',
    headers = ['学生姓名', '课程名称', '成绩', '考试日期', '备注']
  } = options;
  
  // 转换数据格式
  const worksheetData = [headers];
  
  data.forEach(item => {
    worksheetData.push([
      item.studentName || '',
      item.courseName || '',
      item.score || '',
      item.examDate || '',
      item.remark || ''
    ]);
  });
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 15 }, // 学生姓名
    { wch: 20 }, // 课程名称
    { wch: 10 }, // 成绩
    { wch: 15 }, // 考试日期
    { wch: 30 }  // 备注
  ];
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // 生成文件
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  });
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

/**
 * 获取默认字段映射
 * @returns {object} 字段映射配置
 */
export function getDefaultFieldMapping() {
  return {
    '学生姓名': 'studentName',
    '课程名称': 'courseName',
    '成绩': 'score',
    '考试日期': 'examDate',
    '备注': 'remark'
  };
}

/**
 * 处理Excel日期格式
 * @param {any} value - Excel中的日期值
 * @returns {string} 格式化后的日期字符串
 */
export function parseExcelDate(value) {
  if (!value) return '';
  
  // 如果是数字（Excel日期格式）
  if (typeof value === 'number') {
    // Excel日期是从1900年1月1日开始的天数
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (value - 1) * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // 如果是字符串，尝试解析
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  return String(value);
}

/**
 * 清理Excel数据
 * @param {object} rowData - 原始行数据
 * @param {object} fieldMapping - 字段映射
 * @returns {object} 清理后的数据
 */
export function cleanExcelData(rowData, fieldMapping) {
  const cleaned = {};
  
  Object.keys(fieldMapping).forEach(excelField => {
    const fieldKey = fieldMapping[excelField];
    let value = rowData[excelField];
    
    // 清理空白字符
    if (typeof value === 'string') {
      value = value.trim();
    }
    
    // 处理日期字段
    if (excelField === '考试日期') {
      value = parseExcelDate(value);
    }
    
    // 处理数字字段
    if (excelField === '成绩') {
      value = parseFloat(value) || 0;
    }
    
    cleaned[fieldKey] = value;
  });
  
  return cleaned;
} 