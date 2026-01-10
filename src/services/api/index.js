/**
 * API 服务统一导出入口
 * 
 * 作用：将 config、client、auth 和 user 等模块集中导出。
 * 外部引用时只需 import { ... } from '@/services/api'，无需关心内部文件结构。
 */
export * from './config.js';
export { default as apiClient } from './client.js';
export * from './auth.js';
export * from './user.js';
export * from './AIGenerateImage.js';
export * from './AIAnalyzeImage.js';