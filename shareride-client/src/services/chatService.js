import API from "../api/axiosInstance";

const chatService = {
  getConversations: () => API.get("/chat/conversations"),

  getChatHistory: (otherUserId) => API.get(`/chat/history/${otherUserId}`),

  sendMessage: (receiverId, content) =>
    API.post("/chat/send", { receiverId, content }),

  markAsRead: (otherUserId) => API.put(`/chat/mark-read/${otherUserId}`),
};

export default chatService;
