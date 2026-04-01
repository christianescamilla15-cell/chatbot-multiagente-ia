// Real-time WebSocket notifications hook
import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://multiagente-api.onrender.com";
const WS_URL = API_URL.replace("https://", "wss://").replace("http://", "ws://");

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const pingRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${WS_URL}/ws/notifications`);

      ws.onopen = () => {
        setConnected(true);
        // Ping every 30s to keep alive
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") return;
          if (data.type === "notification") {
            setNotifications(prev => [data, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);
          }
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        clearInterval(pingRef.current);
        // Auto-reconnect in 5 seconds
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {}
  }, []);

  // Load initial notifications via REST
  const loadNotifications = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/notifications?limit=20`);
      if (resp.ok) {
        const data = await resp.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {}
  }, []);

  // Mark notification as read
  const markRead = useCallback(async (id) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: "POST" });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  }, []);

  // Mark all as read
  const markAllRead = useCallback(() => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    loadNotifications();
    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      clearInterval(pingRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect, loadNotifications]);

  return { notifications, unreadCount, connected, markRead, markAllRead };
}
