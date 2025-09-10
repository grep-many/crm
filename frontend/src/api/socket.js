// src/api/socket.js
import { io } from "socket.io-client";

let socketInstance = null;

function resolveSocketUrl(providedBaseUrl) {
  // Priority: explicit provided, VITE_SOCKET_URL, VITE_API_URL (stripping trailing /api), window.origin
  let url = providedBaseUrl || import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
  if (url) {
    // strip trailing slash
    url = url.replace(/\/$/, "");
    // strip trailing /api if present
    url = url.replace(/\/api$/, "");
    return url;
  }
  return window.location.origin;
}

export function connectSocket({ baseUrl, token, userId } = {}) {
  if (socketInstance) return socketInstance;

  const url = resolveSocketUrl(baseUrl);

  socketInstance = io(url, {
    // Allow polling fallback and upgrade to websocket
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
    auth: token ? { token } : undefined,
    withCredentials: true,
  });

  socketInstance.on("connect", () => {
    // console.info("[socket] connected", { id: socketInstance.id, url });
    if (userId) {
      socketInstance.emit("joinRoom", userId);
    }
  });

  socketInstance.on("connect_error", (err) => {
    console.error("[socket] connect_error", err?.message || err);
  });

  socketInstance.on("error", (err) => {
    console.error("[socket] error", err);
  });

  socketInstance.on("disconnect", (reason) => {
    // console.warn("[socket] disconnected", reason);
  });

  // Expose for quick debugging in DevTools
   
  if (typeof window !== "undefined") {
     
    window.__SOCKET__ = socketInstance;
  }

  return socketInstance;
}

export function getSocket() {
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
