/**
 * 批量导入辅助函数
 * 用于处理学生和课程的匹配逻辑
 */

import { getWorksheetData, buildQueryParams } from './apiHelper.js';
import { getWorksheetConfig } from '../config/worksheetConfig.js';

/**
 * 获取学生和课程映射数据
 * @param {string} studentWorksheetId - 学生工作表ID
 * @param {string} courseWorksheetId - 课程工作表ID
 * @returns {Promise<object>} 映射数据
 */
export async function getMappingData(studentWorksheetId, courseWorksheetId) {
  const mapping = {
    students: {},
    courses: {},
    studentList: [],
    courseList: []
  };

  try {
    // 获取学生数据
    if (studentWorksheetId) {
      const studentParams = buildQueryParams({
        worksheetId: studentWorksheetId,
        pageSize: 1000,
        sort: [{ fieldId: 'studentName', isAsc: true }]
      });

      const studentResult = await getWorksheetData(studentParams);
      if (studentResult.success) {
        studentResult.data.forEach(student => {
          const studentName = student.studentName || '';
          if (studentName) {
            mapping.students[studentName] = {
              rowId: student.rowId,
              studentName: studentName,
              studentId: student.studentId || '',
              className: student.className || ''
            };
          }
        });
        mapping.studentList = Object.values(mapping.students);
      }
    }

    // 获取课程数据
    if (courseWorksheetId) {
      const courseParams = buildQueryParams({
        worksheetId: courseWorksheetId,
        pageSize: 1000,
        sort: [{ fieldId: 'courseName', isAsc: true }]
      });

      const courseResult = await getWorksheetData(courseParams);
      if (courseResult.success) {
        courseResult.data.forEach(course => {
          const courseName = course.courseName || '';
          if (courseName) {
            mapping.courses[courseName] = {
              rowId: course.rowId,
              courseName: courseName,
              courseCode: course.courseCode || '',
              teacherName: course.teacherName || ''
            };
          }
        });
        mapping.courseList = Object.values(mapping.courses);
      }
    }

    return {
      success: true,
      data: mapping
    };

  } catch (error) {
    console.error('获取映射数据失败:', error);
    return {
      success: false,
      error: error.message,
      data: mapping
    };
  }
}

/**
 * 匹配学生和课程数据
 * @param {array} excelData - Excel数据
 * @param {object} mapping - 映射数据
 * @returns {object} 匹配结果
 */
export function matchStudentAndCourse(excelData, mapping) {
  const results = {
    matched: [],
    unmatched: [],
    statistics: {
      total: excelData.length,
      matched: 0,
      unmatched: 0,
      studentNotFound: 0,
      courseNotFound: 0
    }
  };

  excelData.forEach(row => {
    const studentName = row.data['学生姓名'] || '';
    const courseName = row.data['课程名称'] || '';
    
    const student = mapping.students[studentName];
    const course = mapping.courses[courseName];
    
    const unmatchedReasons = [];
    
    if (!student) {
      unmatchedReasons.push(`学生"${studentName}"不存在`);
      results.statistics.studentNotFound++;
    }
    
    if (!course) {
      unmatchedReasons.push(`课程"${courseName}"不存在`);
      results.statistics.courseNotFound++;
    }
    
    if (unmatchedReasons.length > 0) {
      results.unmatched.push({
        rowNumber: row.rowNumber,
        data: row.data,
        reasons: unmatchedReasons
      });
      results.statistics.unmatched++;
    } else {
      results.matched.push({
        rowNumber: row.rowNumber,
        data: {
          ...row.data,
          studentId: student.rowId,
          courseId: course.rowId
        },
        student: student,
        course: course
      });
      results.statistics.matched++;
    }
  });

  return results;
}

/**
 * 生成匹配报告
 * @param {object} matchResult - 匹配结果
 * @returns {string} 报告内容
 */
export function generateMatchReport(matchResult) {
  const { statistics } = matchResult;
  
  let report = `数据匹配报告\n`;
  report += `总计: ${statistics.total} 条记录\n`;
  report += `匹配成功: ${statistics.matched} 条\n`;
  report += `匹配失败: ${statistics.unmatched} 条\n`;
  
  if (statistics.studentNotFound > 0) {
    report += `学生不存在: ${statistics.studentNotFound} 条\n`;
  }
  
  if (statistics.courseNotFound > 0) {
    report += `课程不存在: ${statistics.courseNotFound} 条\n`;
  }
  
  return report;
}

/**
 * 验证数据完整性
 * @param {array} data - 要验证的数据
 * @param {object} mapping - 映射数据
 * @returns {object} 验证结果
 */
export function validateDataIntegrity(data, mapping) {
  const errors = [];
  const warnings = [];
  
  // 检查学生数据
  if (mapping.studentList.length === 0) {
    errors.push('学生数据为空，请先添加学生信息');
  }
  
  // 检查课程数据
  if (mapping.courseList.length === 0) {
    errors.push('课程数据为空，请先添加课程信息');
  }
  
  // 检查重复数据
  const studentCoursePairs = new Set();
  data.forEach(row => {
    const studentName = row.data['学生姓名'] || '';
    const courseName = row.data['课程名称'] || '';
    const examDate = row.data['考试日期'] || '';
    
    const pair = `${studentName}-${courseName}-${examDate}`;
    if (studentCoursePairs.has(pair)) {
      warnings.push(`第${row.rowNumber}行: 学生"${studentName}"的"${courseName}"在"${examDate}"的成绩记录重复`);
    } else {
      studentCoursePairs.add(pair);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 生成导入建议
 * @param {object} matchResult - 匹配结果
 * @param {object} mapping - 映射数据
 * @returns {array} 建议列表
 */
export function generateImportSuggestions(matchResult, mapping) {
  const suggestions = [];
  
  // 检查学生匹配情况
  const unmatchedStudents = new Set();
  matchResult.unmatched.forEach(item => {
    const studentName = item.data['学生姓名'];
    if (studentName && !mapping.students[studentName]) {
      unmatchedStudents.add(studentName);
    }
  });
  
  if (unmatchedStudents.size > 0) {
    suggestions.push({
      type: 'warning',
      message: `发现 ${unmatchedStudents.size} 个未匹配的学生，建议先添加这些学生信息`,
      details: Array.from(unmatchedStudents).slice(0, 5).join('、') + (unmatchedStudents.size > 5 ? '...' : '')
    });
  }
  
  // 检查课程匹配情况
  const unmatchedCourses = new Set();
  matchResult.unmatched.forEach(item => {
    const courseName = item.data['课程名称'];
    if (courseName && !mapping.courses[courseName]) {
      unmatchedCourses.add(courseName);
    }
  });
  
  if (unmatchedCourses.size > 0) {
    suggestions.push({
      type: 'warning',
      message: `发现 ${unmatchedCourses.size} 个未匹配的课程，建议先添加这些课程信息`,
      details: Array.from(unmatchedCourses).slice(0, 5).join('、') + (unmatchedCourses.size > 5 ? '...' : '')
    });
  }
  
  // 检查数据量
  if (matchResult.statistics.total > 100) {
    suggestions.push({
      type: 'info',
      message: `数据量较大 (${matchResult.statistics.total} 条)，建议分批导入以提高成功率`,
      details: '建议每批不超过50条记录'
    });
  }
  
  return suggestions;
}

/**
 * 优化导入顺序
 * @param {array} data - 原始数据
 * @returns {array} 优化后的数据
 */
export function optimizeImportOrder(data) {
  // 按学生姓名和课程名称排序，提高缓存效率
  return [...data].sort((a, b) => {
    const studentA = a.data['学生姓名'] || '';
    const studentB = b.data['学生姓名'] || '';
    const courseA = a.data['课程名称'] || '';
    const courseB = b.data['课程名称'] || '';
    
    if (studentA !== studentB) {
      return studentA.localeCompare(studentB);
    }
    return courseA.localeCompare(courseB);
  });
}

/**
 * 检查导入限制
 * @param {array} data - 要导入的数据
 * @param {object} options - 选项
 * @returns {object} 检查结果
 */
export function checkImportLimits(data, options = {}) {
  const {
    maxRecords = 1000,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    fileSize = 0
  } = options;
  
  const results = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  // 检查记录数量
  if (data.length > maxRecords) {
    results.valid = false;
    results.errors.push(`记录数量超过限制 (${data.length} > ${maxRecords})`);
  }
  
  // 检查文件大小
  if (fileSize > maxFileSize) {
    results.valid = false;
    results.errors.push(`文件大小超过限制 (${(fileSize / 1024 / 1024).toFixed(2)}MB > ${maxFileSize / 1024 / 1024}MB)`);
  }
  
  // 检查数据量警告
  if (data.length > 500) {
    results.warnings.push(`数据量较大 (${data.length} 条)，导入时间可能较长`);
  }
  
  return results;
} 