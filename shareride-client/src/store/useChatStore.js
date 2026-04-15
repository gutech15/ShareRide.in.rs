import { create } from "zustand";
import * as signalr from "@microsoft/signalr";
import chatService from "../services/chatService";
import { useAuthStore } from "./useAuthStore";

const HUB_URL = "https://localhost:7021/chatHub";

const useChatStore = create((set, get) => ({
  conversations: [],
  currentMessages: [],
  connection: null,
  activeChatId: null,

  startChatConnection: async () => {
    if (get().connection) return;

    const user = useAuthStore.getState().user;
    if (!user || !user.token) return;

    const newConnection = new signalr.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => user.token })
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveMessage", async (message) => {
      const { activeChatId, markChatAsRead } = get();
      const isForCurrentChat = message.senderId === activeChatId;

      set((state) => {
        if (isForCurrentChat) {
          const exists = state.currentMessages.some((m) => m.id === message.id);
          if (!exists) {
            return {
              currentMessages: [
                ...state.currentMessages,
                { ...message, isRead: true },
              ],
            };
          }
        }
        return state;
      });

      if (isForCurrentChat) {
        try {
          await markChatAsRead(activeChatId);
        } catch (err) {
          console.error("Greska pri markiranju", err);
        }
      }

      get().loadConversations();
    });

    newConnection.off("MessagesSeen");
    newConnection.on("MessagesSeen", (readerId) => {
      set((state) => ({
        currentMessages: state.currentMessages.map((m) => ({
          ...m,
          isRead: true,
        })),
      }));

      get().loadConversations();
    });

    try {
      await newConnection.start();
      set({ connection: newConnection });
    } catch (err) {
      console.error(err);
    }
  },

  setActiveChat: (id) => set({ activeChatId: id }),

  markChatAsRead: async (otherUserId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.otherUserId === otherUserId ? { ...c, unreadCount: 0 } : c,
      ),
    }));

    try {
      await chatService.markAsRead(otherUserId);
      await get().loadConversations();
    } catch (err) {
      console.error("Greška pri markiranju:", err);
    }
  },

  loadHistory: async (otherUserId) => {
    set({ currentMessages: [] });
    const res = await chatService.getChatHistory(otherUserId);
    set({ currentMessages: res.data });
  },

  loadConversations: async () => {
    const res = await chatService.getConversations();
    const serverConversations = res.data;

    const totalUnread = serverConversations.reduce(
      (sum, conv) => sum + conv.unreadCount,
      0,
    );

    set((state) => ({
      conversations: serverConversations.map((serverConv) => {
        if (serverConv.otherUserId === state.activeChatId) {
          return { ...serverConv, unreadCount: 0 };
        }
        return serverConv;
      }),
      totalChatUnreadCount: totalUnread,
    }));
  },

  sendChatMessage: async (receiverId, content) => {
    const res = await chatService.sendMessage(receiverId, content);
    const newMessage = res.data;

    set((state) => {
      if (state.currentMessages.some((m) => m.id === newMessage.id))
        return state;
      return { currentMessages: [...state.currentMessages, newMessage] };
    });

    get().loadConversations();
  },
}));

export default useChatStore;
