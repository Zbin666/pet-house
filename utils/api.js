// API 基础配置（真机调试使用本机 WLAN IP）
const BASE_URL = 'http://10.154.16.76:3000/api'

// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token')
    
    // 设置请求头
    const header = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// API 方法
export const api = {
  // 用户认证
  login: (data) => request({
    url: '/auth/login',
    method: 'POST',
    data
  }),
  
  getProfile: () => request({
    url: '/auth/profile',
    method: 'GET'
  }),
  
  // 用户管理
  updateProfile: (data) => request({
    url: '/users/profile',
    method: 'PUT',
    data
  }),
  
  getSettings: () => request({
    url: '/users/settings',
    method: 'GET'
  }),
  
  updateSettings: (data) => request({
    url: '/users/settings',
    method: 'PUT',
    data
  }),
  
  uploadAvatar: (data) => request({
    url: '/users/avatar',
    method: 'POST',
    data
  }),
  
  getUserStats: () => request({
    url: '/users/stats',
    method: 'GET'
  }),
  
  // 宠物管理
  getPets: () => request({
    url: '/pets',
    method: 'GET'
  }),
  
  getPet: (id) => request({
    url: `/pets/${id}`,
    method: 'GET'
  }),
  
  createPet: (data) => request({
    url: '/pets',
    method: 'POST',
    data
  }),
  
  updatePet: (id, data) => request({
    url: `/pets/${id}`,
    method: 'PUT',
    data
  }),
  
  deletePet: (id) => request({
    url: `/pets/${id}`,
    method: 'DELETE'
  }),
  
  // 记录管理
  getRecords: (params) => request({
    url: '/records',
    method: 'GET',
    data: params
  }),
  
  getCalendar: (params) => request({
    url: '/records/calendar',
    method: 'GET',
    data: params
  }),
  
  getStats: (params) => request({
    url: '/records/stats',
    method: 'GET',
    data: params
  }),
  
  createRecord: (data) => request({
    url: '/records',
    method: 'POST',
    data
  }),
  
  updateRecord: (id, data) => request({
    url: `/records/${id}`,
    method: 'PUT',
    data
  }),
  
  deleteRecord: (id) => request({
    url: `/records/${id}`,
    method: 'DELETE'
  }),
  
  // 提醒（订阅）管理
  getSubscriptions: (params) => request({
    url: '/subscriptions',
    method: 'GET',
    data: params
  }),

  createSubscription: (data) => request({
    url: '/subscriptions',
    method: 'POST',
    data
  }),

  deleteSubscription: (id) => request({
    url: `/subscriptions/${id}`,
    method: 'DELETE'
  }),

  // 媒体管理
  getUploadPolicy: (data) => request({
    url: '/media/policy',
    method: 'POST',
    data
  }),
  
  completeUpload: (data) => request({
    url: '/media/complete',
    method: 'POST',
    data
  }),
  
  // 社区功能
  getFeeds: (params) => request({
    url: '/feeds',
    method: 'GET',
    data: params
  }),
  
  getFeed: (id) => request({
    url: `/feeds/${id}`,
    method: 'GET'
  }),
  
  createFeed: (data) => request({
    url: '/feeds',
    method: 'POST',
    data
  }),
  
  likeFeed: (id) => request({
    url: `/feeds/${id}/like`,
    method: 'POST'
  }),
  
  deleteFeed: (id) => request({
    url: `/feeds/${id}`,
    method: 'DELETE'
  }),
  
  getComments: (id) => request({
    url: `/feeds/${id}/comments`,
    method: 'GET'
  }),
  
  createComment: (id, data) => request({
    url: `/feeds/${id}/comments`,
    method: 'POST',
    data
  }),

  deleteComment: (commentId) => request({
    url: `/feeds/comments/${commentId}`,
    method: 'DELETE'
  }),
  
  createCommentReply: (commentId, data) => request({
    url: `/feeds/comments/${commentId}/replies`,
    method: 'POST',
    data
  }),
  
  likeCommentReply: (replyId) => request({
    url: `/feeds/comment-replies/${replyId}/like`,
    method: 'POST'
  }),

  deleteCommentReply: (replyId) => request({
    url: `/feeds/comment-replies/${replyId}`,
    method: 'DELETE'
  }),
  
  // 问答功能
  getQuestions: (params) => request({
    url: '/questions',
    method: 'GET',
    data: params
  }),
  
  getQuestion: (id) => request({
    url: `/questions/${id}`,
    method: 'GET'
  }),
  
  createQuestion: (data) => request({
    url: '/questions',
    method: 'POST',
    data
  }),
  
  deleteQuestion: (id) => request({
    url: `/questions/${id}`,
    method: 'DELETE'
  }),
  
  createAnswer: (id, data) => request({
    url: `/questions/${id}/answers`,
    method: 'POST',
    data
  }),
  
  likeAnswer: (id) => request({
    url: `/questions/answers/${id}/like`,
    method: 'POST'
  }),

  deleteAnswer: (id) => request({
    url: `/questions/answers/${id}`,
    method: 'DELETE'
  }),
  
  // 科普文章
  getArticles: (params) => request({
    url: '/articles',
    method: 'GET',
    data: params
  }),
  
  getArticle: (id) => request({
    url: `/articles/${id}`,
    method: 'GET'
  }),
  
  // 媒体管理
  getUploadPolicy: (type) => request({
    url: '/media/policy',
    method: 'POST',
    data: { type }
  }),
  
  completeUpload: (data) => request({
    url: '/media/complete',
    method: 'POST',
    data
  }),
  
  createMedia: (data) => request({
    url: '/media',
    method: 'POST',
    data
  }),
  
  getMedia: (params) => request({
    url: '/media',
    method: 'GET',
    data: params
  }),
  
  deleteMedia: (id) => request({
    url: `/media/${id}`,
    method: 'DELETE'
  }),

  // 评论点赞
  likeComment: (id) => request({
    url: `/feeds/comments/${id}/like`,
    method: 'POST'
  }),

  // 关注/取消关注问题
  followQuestion: (id) => request({
    url: `/questions/${id}/follow`,
    method: 'POST'
  }),

  // 问答评论相关API
  getAnswerComments: (answerId) => request({
    url: `/questions/answers/${answerId}/comments`,
    method: 'GET'
  }),

  createAnswerComment: (answerId, data) => request({
    url: `/questions/answers/${answerId}/comments`,
    method: 'POST',
    data
  }),

  likeAnswerComment: (commentId) => request({
    url: `/questions/comments/${commentId}/like`,
    method: 'POST'
  }),

  deleteAnswerComment: (commentId) => request({
    url: `/questions/comments/${commentId}`,
    method: 'DELETE'
  })
}

export default api
