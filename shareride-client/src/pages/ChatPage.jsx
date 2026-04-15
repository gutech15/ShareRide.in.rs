import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useChatStore from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import "./ChatPage.css";

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const location = useLocation();

  const {
    conversations,
    currentMessages,
    loadConversations,
    loadHistory,
    sendChatMessage,
    startChatConnection,
    setActiveChat,
    markChatAsRead,
  } = useChatStore();

  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    startChatConnection();
    loadConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      setActiveChat(userId);
      loadHistory(userId);
      markChatAsRead(userId);
      loadConversations();
    }

    return () => setActiveChat(null);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !userId || isSending) return;

    setIsSending(true);
    try {
      await sendChatMessage(userId, messageText);
      setMessageText("");
      loadConversations();
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeZ = (dateString) => {
    return new Date(dateString + "Z").toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeConversation = conversations.find(
    (conv) => conv.otherUserId === userId,
  );
  const chatPartnerName = activeConversation
    ? activeConversation.otherUserName
    : location.state?.fullName || "";

  return (
    <div className="bg-gray-100 min-h-screen pt-4">
      <div className="container mx-auto px-4 chat-page-wrapper">
        <div className="chat-layout">
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">Poruke</div>
            <div className="chat-conversation-list">
              {conversations.map((conv) => {
                return (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/chat/${conv.otherUserId}`)}
                    className={`chat-conversation-item ${
                      userId === conv.otherUserId ? "active" : ""
                    }`}
                  >
                    <img
                      src={
                        conv.otherUserPictureUrl
                          ? `https://localhost:7021${conv.otherUserPictureUrl}`
                          : "/default-avatar.svg"
                      }
                      alt="avatar"
                      className="chat-conversation-item-avatar"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="chat-user-name">
                          {conv.otherUserName}
                        </span>
                        <span className="chat-last-msg-time">
                          {formatTimeZ(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="chat-last-msg-snippet">
                        {conv.lastMessageSnippet}
                        {conv.unreadCount > 0 && (
                          <span className="unread-messages-per-conversation">
                            {conv.unreadCount}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chat-main">
            {userId ? (
              <>
                <div className="chat-main-header">
                  <span className="chat-info-header font-semibold">
                    {chatPartnerName}
                  </span>
                </div>

                <div className="chat-messages-area">
                  {currentMessages.map((msg) => {
                    const isSentByMe = msg.senderId === currentUser.id;
                    console.log(msg);
                    return (
                      <div
                        key={msg.id}
                        className={`message-row ${isSentByMe ? "sent" : "received"}`}
                      >
                        <div className="message-bubble">
                          <div className="text-sm md:text-base">
                            {msg.content}
                          </div>
                          <div className="message-time">
                            {formatTime(msg.sentAt)}
                            {isSentByMe && (
                              <span className="ml-1 font-bold">
                                {msg.isRead ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-container">
                  <form
                    onSubmit={handleSendMessage}
                    className="chat-input-form"
                  >
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Napiši poruku..."
                      className="chat-input-field"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      className={`chat-send-btn ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
                      title="Pošalji"
                      disabled={isSending}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="chat-empty-state">
                <div className="text-center">
                  <p>Izaberite konverzaciju da biste započeli dopisivanje.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
