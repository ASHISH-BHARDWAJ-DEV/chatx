import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
    
   
  const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

  export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
      try {
        const res = await axiosInstance.get("/auth/check");
        if (res.data) {
          set({ authUser: res.data });
          // Connect socket after auth check succeeds
          setTimeout(() => {
            get().connectSocket();
          }, 200);
        } else {
          set({ authUser: null });
        }
      } catch (error) {
        console.log("Error in authCheck:", error);
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },
  

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({ authUser: res.data });

        toast.success("Account created successfully!");
        // Wait a bit for cookies to be set before connecting socket
        setTimeout(() => {
          get().connectSocket();
        }, 300);
        } catch (error) {
        toast.error(error.response.data.message);
        } finally {
        set({ isSigningUp: false });
        }
    },

    login: async (data) => {
      set({ isLoggingIn: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
  
        toast.success("Logged in successfully");
        // Wait a bit for cookies to be set before connecting socket
        setTimeout(() => {
          get().connectSocket();
        }, 300);
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isLoggingIn: false });
      }
    },
  
    logout: async () => {
      try {
        await axiosInstance.post("/auth/logout");
        set({ authUser: null });
        toast.success("Logged out successfully");
        get().disconnectSocket();
      } catch (error) {
        toast.error("Error logging out");
        console.log("Logout error:", error);
      }
    },

    updateProfile: async (data) => {
      try {
        const res = await axiosInstance.put("/auth/update-profile", data);
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } catch (error) {
        console.log("Error in update profile:", error);
        toast.error(error.response.data.message);
      }
    },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) {
      console.log("Cannot connect socket: No auth user");
      return;
    }
    
    // If socket already exists and is connected, don't create a new one
    if (get().socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    // Disconnect existing socket if it exists but not connected
    if (get().socket && !get().socket.connected) {
      get().socket.disconnect();
      get().socket.removeAllListeners();
    }

    // Small delay to ensure cookies are set after login/signup
    setTimeout(() => {
      // Double check authUser still exists
      if (!get().authUser) {
        console.log("Auth user no longer exists, aborting socket connection");
        return;
      }

      const socket = io(BASE_URL, {
        withCredentials: true, // this ensures cookies are sent with the connection
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      let retryCount = 0;
      const maxRetries = 3;
      
      socket.on("connect", () => {
        console.log("✅ Socket connected successfully");
        retryCount = 0; // Reset retry count on successful connection
        // Request online users list when connected
        socket.emit("requestOnlineUsers");
      });

      socket.on("connect_error", (error) => {
        // Only log if user is actually logged in (auth error shouldn't happen then)
        if (get().authUser) {
          retryCount++;
          console.error(`❌ Socket connection error (attempt ${retryCount}/${maxRetries}):`, error.message);
          
          // If auth error but user is logged in, try reconnecting a few times
          if (error.message.includes("Unauthorized") && retryCount < maxRetries) {
            console.log(`Socket auth failed, retrying in 2 seconds... (${retryCount}/${maxRetries})`);
            setTimeout(() => {
              if (get().authUser && !socket.connected && retryCount < maxRetries) {
                socket.connect();
              } else if (retryCount >= maxRetries) {
                console.error("Max retries reached. Please refresh the page or log in again.");
              }
            }, 2000);
          } else if (retryCount >= maxRetries) {
            console.error("Max retries reached. Socket connection failed. Please check your authentication.");
            // Stop retrying
            socket.disconnect();
          }
        } else {
          // User not logged in, this is expected - don't log as error
          console.log("Socket connection skipped - user not authenticated");
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        // Try to reconnect if disconnected unexpectedly (but not if it's auth error)
        if (reason === "io server disconnect" && get().authUser) {
          console.log("Attempting to reconnect socket...");
          setTimeout(() => {
            if (get().authUser && !socket.connected) {
              socket.connect();
            }
          }, 1000);
        }
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      set({ socket });

      // listen for online users event
      socket.on("getOnlineUsers", (userIds) => {
        // Ensure all userIds are strings
        const onlineUserIds = Array.isArray(userIds) ? userIds.map(id => String(id)) : [];
        console.log("Online users received:", onlineUserIds);
        set({ onlineUsers: onlineUserIds });
      });
    }, 100); // Small delay to ensure cookies are set
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

    
  }));