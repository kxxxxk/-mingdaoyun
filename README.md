# 学生成绩管理系统综合插件

## 项目概述

这是一个基于明道云的学生成绩管理系统综合插件，提供完整的成绩管理解决方案，包括成绩录入、批量导入、统计分析、成绩单生成等功能。

## 功能特性

### 迭代1：成绩录入控件插件 - 基础功能 ✅
- ✅ 单条成绩录入功能
- ✅ 学生信息下拉选择
- ✅ 课程信息下拉选择
- ✅ 成绩输入和校验
- ✅ 日期选择器
- ✅ 数据保存功能
- ✅ 操作反馈机制
- ✅ 基础权限控制

### 迭代2：成绩录入控件插件 - 批量导入 ✅
- ✅ Excel批量导入功能
- ✅ 数据校验机制
- ✅ 错误详情展示
- ✅ 导入进度显示

### 迭代3：成绩录入控件插件 - 管理功能 🚧
- 🔄 成绩记录管理功能
- 🔄 成绩记录搜索和筛选
- 🔄 成绩记录编辑功能
- 🔄 成绩记录删除功能

### 迭代4-10：其他功能 🚧
- 🔄 成绩统计视图插件
- 🔄 成绩单生成插件
- 🔄 系统集成与优化

## 技术架构

- **前端框架**: Vue.js 3.x
- **构建工具**: mdye
- **样式预处理器**: Less
- **UI组件**: Element Plus
- **明道云API**: 严格按照规范调用

## 安装和配置

### 1. 环境要求

- Node.js 16+
- npm 或 yarn
- 明道云账号和权限

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在明道云插件配置中设置以下环境变量：

#### 必需配置
```bash
# 工作表ID配置
STUDENT_WORKSHEET_ID=your_student_worksheet_id
COURSE_WORKSHEET_ID=your_course_worksheet_id
GRADE_WORKSHEET_ID=your_grade_worksheet_id

# 视图ID配置（可选）
STUDENT_VIEW_ID=your_student_view_id
COURSE_VIEW_ID=your_course_view_id
GRADE_VIEW_ID=your_grade_view_id
```

#### 可选配置（字段ID映射）
```bash
# 学生表字段ID
STUDENT_NAME_FIELD_ID=field_id_for_student_name
STUDENT_ID_FIELD_ID=field_id_for_student_id
STUDENT_CLASS_FIELD_ID=field_id_for_class_name

# 课程表字段ID
COURSE_NAME_FIELD_ID=field_id_for_course_name
COURSE_CODE_FIELD_ID=field_id_for_course_code
COURSE_TEACHER_FIELD_ID=field_id_for_teacher_name

# 成绩表字段ID
GRADE_STUDENT_FIELD_ID=field_id_for_student_reference
GRADE_COURSE_FIELD_ID=field_id_for_course_reference
GRADE_SCORE_FIELD_ID=field_id_for_score
GRADE_EXAM_DATE_FIELD_ID=field_id_for_exam_date
GRADE_REMARK_FIELD_ID=field_id_for_remark
```

### 4. 数据表结构要求

#### 学生信息表
| 字段名 | 字段类型 | 说明 |
|--------|----------|------|
| studentName | 文本 | 学生姓名 |
| studentId | 文本 | 学号 |
| className | 文本 | 班级名称 |
| grade | 文本 | 年级 |

#### 课程信息表
| 字段名 | 字段类型 | 说明 |
|--------|----------|------|
| courseName | 文本 | 课程名称 |
| courseCode | 文本 | 课程代码 |
| teacherName | 文本 | 授课教师 |
| credit | 数字 | 学分 |

#### 成绩记录表
| 字段名 | 字段类型 | 说明 |
|--------|----------|------|
| studentId | 关联记录 | 关联学生表 |
| courseId | 关联记录 | 关联课程表 |
| score | 数字 | 成绩分数 |
| examDate | 日期 | 考试日期 |
| remark | 多行文本 | 备注 |
| createTime | 日期时间 | 创建时间 |

## 使用方法

### 1. 启动开发环境

```bash
npm run dev
```

### 2. 配置工作表

1. 在明道云中创建学生信息表、课程信息表、成绩记录表
2. 按照上述数据表结构要求设置字段
3. 获取各工作表的ID和视图ID
4. 在插件配置中设置环境变量

### 3. 使用成绩录入功能

#### 单条成绩录入
1. 打开插件界面
2. 在"成绩录入"区域填写成绩信息：
   - 选择学生
   - 选择课程
   - 输入成绩分数（0-100分，支持一位小数）
   - 选择考试日期
   - 填写备注（可选）
3. 点击"保存成绩"按钮
4. 确认保存信息

#### 批量成绩导入
1. 点击"批量导入"按钮
2. 下载Excel模板并填写数据
3. 拖拽或选择Excel文件上传
4. 查看数据预览和验证结果
5. 确认导入并查看进度
6. 处理错误数据（如有）

#### 成绩记录管理
1. 点击"成绩管理"按钮
2. 查看成绩记录列表和统计信息
3. 使用搜索和筛选功能查找记录
4. 编辑或删除成绩记录
5. 批量操作多条记录
6. 导出成绩数据

### 4. 查看操作日志

在"操作日志"区域可以查看所有操作记录，包括：
- 系统初始化信息
- 配置检查结果
- 数据操作记录
- 错误信息

## 开发规范

### 明道云API使用规范

#### 导入规范
```javascript
// 推荐的导入方式
import { api, config, env, utils, md_emitter } from "mdye";

// 或者按需导入
import { api } from "mdye";
import { config } from "mdye";
import { env } from "mdye";
import { utils } from "mdye";
import { md_emitter } from "mdye";
```

#### 数据操作API
- `getFilterRows`: 获取工作表数据
- `addWorksheetRow`: 添加记录
- `updateWorksheetRow`: 更新记录
- `deleteWorksheetRow`: 删除记录
- `getRowDetail`: 获取记录详情

#### 字段值解析规范
- 严格按照字段类型对照表处理
- 使用工具函数库解析不同字段类型
- 处理单选、多选、成员、部门等特殊字段类型

### 代码规范
- 使用ESLint + Prettier进行代码格式化
- 遵循Vue.js官方风格指南
- 编写详细的代码注释

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── GradeInput/     # 成绩录入组件
│   │   └── GradeInputForm.vue
│   └── common/         # 通用组件
├── utils/              # 工具函数
│   ├── fieldParser.js  # 字段值解析工具函数库
│   ├── apiHelper.js    # API调用辅助函数
│   └── validators.js   # 数据验证工具
├── config/             # 配置文件
│   └── worksheetConfig.js
├── App.vue             # 主应用组件
├── index.js            # 入口文件
└── style.less          # 全局样式
```

## 开发计划

### 当前进度：迭代3完成 ✅

- ✅ 项目初始化和环境配置
- ✅ 安装和配置必要依赖
- ✅ 创建基础项目结构
- ✅ 创建字段值解析工具函数库
- ✅ 创建API调用辅助函数
- ✅ 创建数据验证工具
- ✅ 实现成绩录入表单组件
- ✅ 实现学生信息下拉选择
- ✅ 实现课程信息下拉选择
- ✅ 实现成绩输入和校验
- ✅ 实现日期选择器
- ✅ 创建数据保存功能
- ✅ 实现操作反馈机制
- ✅ 添加基础权限控制

### 迭代2完成 ✅

- ✅ 集成xlsx库处理Excel文件
- ✅ 实现文件上传组件
- ✅ 创建Excel模板下载功能
- ✅ 实现批量数据解析
- ✅ 完善数据校验规则
- ✅ 创建错误详情展示
- ✅ 实现批量保存功能
- ✅ 添加导入进度显示

### 迭代3完成 ✅

- ✅ 创建成绩记录列表组件
- ✅ 实现成绩记录搜索和筛选
- ✅ 实现成绩记录编辑功能
- ✅ 实现成绩记录删除功能
- ✅ 完善权限控制逻辑
- ✅ 优化数据展示界面
- ✅ 添加操作确认机制
- ✅ 实现数据导出功能

### 下一步：迭代4 - 成绩统计功能 🚧

- 🔄 集成ECharts图表库
- 🔄 创建数据统计计算函数
- 🔄 实现班级平均分统计
- 🔄 实现课程成绩分布统计
- 🔄 创建柱状图组件
- 🔄 创建饼图组件
- 🔄 实现基础数据筛选
- 🔄 创建统计结果展示

## 常见问题

### Q: 如何获取工作表ID？
A: 在明道云中打开工作表，URL中的worksheetId参数即为工作表ID。

### Q: 如何获取字段ID？
A: 在明道云中编辑工作表，查看字段设置，每个字段都有唯一的ID。

### Q: 成绩录入失败怎么办？
A: 检查以下几点：
1. 工作表ID配置是否正确
2. 字段ID映射是否正确
3. 数据格式是否符合要求
4. 查看操作日志中的错误信息

### Q: 如何自定义字段映射？
A: 在环境变量中设置对应的字段ID，例如：
```bash
STUDENT_NAME_FIELD_ID=your_custom_field_id
```

## 技术支持

如有问题，请查看：
1. 操作日志中的错误信息
2. 浏览器控制台的错误信息
3. 明道云API文档
4. 项目开发文档

## 版本信息

- **当前版本**: v3.0.0
- **开发框架**: Vue.js 3.x + mdye
- **最后更新**: 2024年12月
- **开发状态**: 迭代3完成，迭代4开发中

---

**注意**: 这是一个开发中的项目，部分功能仍在开发中。请关注开发计划了解最新进度。 