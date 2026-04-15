import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useNotificationStore from "../store/useNotificationStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatDistanceToNow, parseISO } from "date-fns";
import { srLatn } from "date-fns/locale";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead } =
    useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id, fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const formatLocalDistance = (utcString) => {
    if (!utcString) return "";

    const formattedString = utcString.endsWith("Z")
      ? utcString
      : `${utcString}Z`;

    return formatDistanceToNow(parseISO(formattedString), {
      addSuffix: true,
      locale: srLatn,
    });
  };

  return (
    <div className="notifications-wrapper">
      <h2 className="notifications-title">Obaveštenja</h2>

      {notifications.length === 0 ? (
        <p className="no-notifications">Nemate novih obaveštenja.</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-item ${n.isRead ? "read" : "unread"}`}
            onClick={() => handleNotificationClick(n)}
          >
            <div className="notification-left">
              {!n.isRead && <div className="blue-dot" />}
            </div>

            <div className="notification-right">
              <div className="notification-message">{n.message}</div>
              <div className="notification-time">
                {formatLocalDistance(n.createdAt)}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationsPage;
