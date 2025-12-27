import apiClient from './client';

/**
 * 用户相关 API
 * 
 * 包含获取/更新个人资料、修改密码、上传头像等接口。
 */
export const userApi = {
    /**
     * 获取当前登录用户的个人资料
     * @returns {Promise} - 返回用户信息对象
     */
    getProfile: () => {
        return apiClient.get('/user/profile');
    },

    /**
     * 更新用户个人资料
     * @param {Object} data - 需要更新的用户字段（如昵称、性别等）
     * @returns {Promise} - 返回更新后的用户信息
     */
    updateProfile: (data) => {
        return apiClient.put('/user/profile', data);
    },

    /**
     * 修改用户密码
     * @param {string} oldPassword - 旧密码
     * @param {string} newPassword - 新密码
     * @returns {Promise} - 返回修改结果
     */
    changePassword: (oldPassword, newPassword) => {
        return apiClient.post('/user/change-password', { oldPassword, newPassword });
    },

    /**
     * 上传用户头像
     * @param {Object} formData - 包含头像文件的 FormData 对象
     * @returns {Promise} - 返回上传结果（通常包含新头像的 URL）
     */
    uploadAvatar: (formData) => {
        return apiClient.post('/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};