//
import { create } from "zustand";
import * as signalr from "@microsoft/signalr";
import axios from "axios";

const API_URL = "https://localhost:7021/api/notifications";
const HUB_URL = "https://localhost:7021/notificationHub";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  connection: null,
  unreadCount: 0,

  fetchNotifications: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      const notes = response.data;
      set({
        notifications: notes,
        unreadCount: notes.filter((n) => !n.isRead).length,
      });
    } catch (error) {
      console.error("Greška pri dohvatanju obaveštenja:", error);
    }
  },

  startConnection: async (token, userId) => {
    if (get().connection) return;

    const newConnection = new signalr.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    newConnection.off("ReceiveNotification");

    newConnection.on("ReceiveNotification", (notification) => {
      set((state) => {
        const exists = state.notifications.some(
          (n) => n.id === notification.id,
        );
        if (exists) return state;
        const updatedNotes = [notification, ...state.notifications];
        return {
          notifications: updatedNotes,
          unreadCount: updatedNotes.filter((n) => !n.isRead).length,
        };
      });
    });

    try {
      await newConnection.start();
      console.log("SignalR povezan sa autentifikacijom!");
      set({ connection: newConnection });

      get().fetchNotifications(userId);
    } catch (err) {
      console.error("SignalR greška pri povezivanju:", err);
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await axios.patch(`${API_URL}/${notificationId}/mark-as-read`);

      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch (error) {
      console.error("Greška pri markiranju obaveštenja:", error);
    }
  },

  stopConnection: async () => {
    const conn = get().connection;
    if (conn) {
      try {
        await conn.stop();
        console.log("SignalR veza uspešno prekinuta.");
      } catch (err) {
        console.error("Greška pri prekidu SignalR veze:", err);
      }
    }

    set({
      connection: null,
      notifications: [],
      unreadCount: 0,
    });
  },
}));

export default useNotificationStore;
