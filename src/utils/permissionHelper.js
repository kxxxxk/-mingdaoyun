/**
 * 权限控制工具函数
 * 用于管理用户权限和数据操作权限
 */

import { config, env } from 'mdye';

/**
 * 权限类型枚举
 */
export const PermissionType = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin'
};

/**
 * 操作类型枚举
 */
export const OperationType = {
  VIEW_GRADE: 'view_grade',
  ADD_GRADE: 'add_grade',
  EDIT_GRADE: 'edit_grade',
  DELETE_GRADE: 'delete_grade',
  BATCH_IMPORT: 'batch_import',
  EXPORT_DATA: 'export_data',
  VIEW_STATISTICS: 'view_statistics',
  MANAGE_USERS: 'manage_users'
};

/**
 * 获取当前用户信息
 * @returns {object} 用户信息
 */
export function getCurrentUser() {
  try {
    // 从明道云环境获取当前用户信息
    const userInfo = {
      userId: env.userId || '',
      userName: env.userName || '',
      userEmail: env.userEmail || '',
      userAvatar: env.userAvatar || '',
      userRole: env.userRole || 'user',
      permissions: env.permissions || []
    };
    
    return userInfo;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {
      userId: '',
      userName: '未知用户',
      userEmail: '',
      userAvatar: '',
      userRole: 'user',
      permissions: []
    };
  }
}

/**
 * 检查用户权限
 * @param {string} permission - 权限类型
 * @param {string} operation - 操作类型
 * @returns {boolean} 是否有权限
 */
export function hasPermission(permission, operation) {
  try {
    const user = getCurrentUser();
    
    // 管理员拥有所有权限
    if (user.userRole === 'admin') {
      return true;
    }
    
    // 检查具体权限
    switch (permission) {
      case PermissionType.READ:
        return checkReadPermission(operation, user);
      case PermissionType.WRITE:
        return checkWritePermission(operation, user);
      case PermissionType.DELETE:
        return checkDeletePermission(operation, user);
      case PermissionType.ADMIN:
        return user.userRole === 'admin';
      default:
        return false;
    }
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}

/**
 * 检查读取权限
 * @param {string} operation - 操作类型
 * @param {object} user - 用户信息
 * @returns {boolean} 是否有读取权限
 */
function checkReadPermission(operation, user) {
  const readPermissions = [
    OperationType.VIEW_GRADE,
    OperationType.VIEW_STATISTICS
  ];
  
  return readPermissions.includes(operation) || 
         user.permissions.includes(operation) ||
         user.userRole === 'teacher' ||
         user.userRole === 'admin';
}

/**
 * 检查写入权限
 * @param {string} operation - 操作类型
 * @param {object} user - 用户信息
 * @returns {boolean} 是否有写入权限
 */
function checkWritePermission(operation, user) {
  const writePermissions = [
    OperationType.ADD_GRADE,
    OperationType.EDIT_GRADE,
    OperationType.BATCH_IMPORT
  ];
  
  return writePermissions.includes(operation) || 
         user.permissions.includes(operation) ||
         user.userRole === 'teacher' ||
         user.userRole === 'admin';
}

/**
 * 检查删除权限
 * @param {string} operation - 操作类型
 * @param {object} user - 用户信息
 * @returns {boolean} 是否有删除权限
 */
function checkDeletePermission(operation, user) {
  const deletePermissions = [
    OperationType.DELETE_GRADE
  ];
  
  return deletePermissions.includes(operation) || 
         user.permissions.includes(operation) ||
         user.userRole === 'admin';
}

/**
 * 检查数据所有权
 * @param {object} data - 数据对象
 * @param {string} userId - 用户ID
 * @returns {boolean} 是否拥有数据所有权
 */
export function hasDataOwnership(data, userId) {
  try {
    // 检查数据是否属于当前用户
    if (data.createdBy === userId) {
      return true;
    }
    
    // 检查用户角色
    const user = getCurrentUser();
    if (user.userRole === 'admin') {
      return true;
    }
    
    // 教师可以管理所有成绩数据
    if (user.userRole === 'teacher') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('数据所有权检查失败:', error);
    return false;
  }
}

/**
 * 检查操作权限（包含数据所有权检查）
 * @param {string} operation - 操作类型
 * @param {object} data - 数据对象（可选）
 * @returns {boolean} 是否有操作权限
 */
export function canOperate(operation, data = null) {
  try {
    const user = getCurrentUser();
    
    // 基本权限检查
    let hasBasicPermission = false;
    
    switch (operation) {
      case OperationType.VIEW_GRADE:
      case OperationType.VIEW_STATISTICS:
        hasBasicPermission = hasPermission(PermissionType.READ, operation);
        break;
      case OperationType.ADD_GRADE:
      case OperationType.BATCH_IMPORT:
        hasBasicPermission = hasPermission(PermissionType.WRITE, operation);
        break;
      case OperationType.EDIT_GRADE:
        hasBasicPermission = hasPermission(PermissionType.WRITE, operation);
        // 编辑需要检查数据所有权
        if (data && hasBasicPermission) {
          hasBasicPermission = hasDataOwnership(data, user.userId);
        }
        break;
      case OperationType.DELETE_GRADE:
        hasBasicPermission = hasPermission(PermissionType.DELETE, operation);
        // 删除需要检查数据所有权
        if (data && hasBasicPermission) {
          hasBasicPermission = hasDataOwnership(data, user.userId);
        }
        break;
      case OperationType.EXPORT_DATA:
        hasBasicPermission = hasPermission(PermissionType.READ, operation);
        break;
      case OperationType.MANAGE_USERS:
        hasBasicPermission = hasPermission(PermissionType.ADMIN, operation);
        break;
      default:
        hasBasicPermission = false;
    }
    
    return hasBasicPermission;
  } catch (error) {
    console.error('操作权限检查失败:', error);
    return false;
  }
}

/**
 * 获取用户可访问的工作表
 * @param {string} userId - 用户ID
 * @returns {array} 可访问的工作表列表
 */
export function getAccessibleWorksheets(userId) {
  try {
    const user = getCurrentUser();
    const worksheets = [];
    
    // 根据用户角色返回可访问的工作表
    switch (user.userRole) {
      case 'admin':
        // 管理员可以访问所有工作表
        worksheets.push(
          'student_worksheet',
          'course_worksheet', 
          'grade_worksheet',
          'user_worksheet'
        );
        break;
      case 'teacher':
        // 教师可以访问学生、课程、成绩工作表
        worksheets.push(
          'student_worksheet',
          'course_worksheet',
          'grade_worksheet'
        );
        break;
      case 'student':
        // 学生只能查看自己的成绩
        worksheets.push('grade_worksheet');
        break;
      default:
        // 默认用户只能查看成绩
        worksheets.push('grade_worksheet');
    }
    
    return worksheets;
  } catch (error) {
    console.error('获取可访问工作表失败:', error);
    return [];
  }
}

/**
 * 检查工作表访问权限
 * @param {string} worksheetId - 工作表ID
 * @returns {boolean} 是否有访问权限
 */
export function canAccessWorksheet(worksheetId) {
  try {
    const user = getCurrentUser();
    const accessibleWorksheets = getAccessibleWorksheets(user.userId);
    
    // 检查工作表ID是否在可访问列表中
    const worksheetMap = {
      [env.STUDENT_WORKSHEET_ID]: 'student_worksheet',
      [env.COURSE_WORKSHEET_ID]: 'course_worksheet',
      [env.GRADE_WORKSHEET_ID]: 'grade_worksheet'
    };
    
    const worksheetType = worksheetMap[worksheetId];
    return accessibleWorksheets.includes(worksheetType);
  } catch (error) {
    console.error('工作表访问权限检查失败:', error);
    return false;
  }
}

/**
 * 获取权限描述
 * @param {string} operation - 操作类型
 * @returns {string} 权限描述
 */
export function getPermissionDescription(operation) {
  const descriptions = {
    [OperationType.VIEW_GRADE]: '查看成绩记录',
    [OperationType.ADD_GRADE]: '添加成绩记录',
    [OperationType.EDIT_GRADE]: '编辑成绩记录',
    [OperationType.DELETE_GRADE]: '删除成绩记录',
    [OperationType.BATCH_IMPORT]: '批量导入成绩',
    [OperationType.EXPORT_DATA]: '导出数据',
    [OperationType.VIEW_STATISTICS]: '查看统计数据',
    [OperationType.MANAGE_USERS]: '管理用户'
  };
  
  return descriptions[operation] || '未知操作';
}

/**
 * 获取用户角色描述
 * @param {string} role - 用户角色
 * @returns {string} 角色描述
 */
export function getRoleDescription(role) {
  const roleDescriptions = {
    'admin': '管理员',
    'teacher': '教师',
    'student': '学生',
    'user': '普通用户'
  };
  
  return roleDescriptions[role] || '未知角色';
}

/**
 * 检查是否需要权限提升
 * @param {string} operation - 操作类型
 * @returns {boolean} 是否需要权限提升
 */
export function needsPermissionElevation(operation) {
  const elevatedOperations = [
    OperationType.DELETE_GRADE,
    OperationType.MANAGE_USERS,
    OperationType.EXPORT_DATA
  ];
  
  return elevatedOperations.includes(operation);
}

/**
 * 记录权限检查日志
 * @param {string} operation - 操作类型
 * @param {boolean} granted - 是否授权
 * @param {object} context - 上下文信息
 */
export function logPermissionCheck(operation, granted, context = {}) {
  try {
    const user = getCurrentUser();
    const logData = {
      timestamp: new Date().toISOString(),
      userId: user.userId,
      userName: user.userName,
      operation: operation,
      granted: granted,
      userRole: user.userRole,
      context: context
    };
    
    console.log('权限检查日志:', logData);
    
    // 这里可以添加日志记录到明道云的逻辑
    // 例如保存到日志工作表
    
  } catch (error) {
    console.error('记录权限检查日志失败:', error);
  }
}

/**
 * 权限装饰器（用于函数包装）
 * @param {string} operation - 操作类型
 * @param {function} callback - 回调函数
 * @returns {function} 包装后的函数
 */
export function requirePermission(operation, callback) {
  return async function(...args) {
    if (!canOperate(operation)) {
      const description = getPermissionDescription(operation);
      throw new Error(`权限不足: ${description}`);
    }
    
    logPermissionCheck(operation, true);
    return await callback.apply(this, args);
  };
}

/**
 * 批量权限检查
 * @param {array} operations - 操作类型数组
 * @returns {object} 权限检查结果
 */
export function checkBatchPermissions(operations) {
  const results = {};
  
  operations.forEach(operation => {
    results[operation] = {
      granted: canOperate(operation),
      description: getPermissionDescription(operation),
      needsElevation: needsPermissionElevation(operation)
    };
  });
  
  return results;
} 