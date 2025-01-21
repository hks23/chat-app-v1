import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    
    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check");
            set({ authUser: response.data});  
        } catch (error) {
            set({ authUser:null });
            console.log("Error checking auth", error);
        }finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const response = await axiosInstance.post("/auth/signup", data);
          set({ authUser: response.data });
          console.log("Signup successful:", response.data); // Debugging log
          toast.success("Account created successfully");
        } catch (error) {
          console.error("Error during signup:", error); // Debugging log
          toast.error(error?.response?.data?.message || "An error occurred during signup");
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const response = await axiosInstance.post("/auth/login", data);
          set({ authUser: response.data });
          console.log("Login successful:", response.data); // Debugging log
          toast.success("Logged in successfully");
        } catch (error) {
          console.error("Error during login:", error); // Debugging log
          toast.error(error?.response?.data?.message || "An error occurred during login");
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
        } catch (error) {
          console.error("Error during logout:", error); // Debugging log
          toast.error(error?.response?.data?.message || "An error occurred during logout");
        }
      },

      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const response = await axiosInstance.put("/auth/update-profile", data);
          set({ authUser: response.data });
          console.log("Profile updated successfully:", response.data); // Debugging log
          toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Error updating profile:", error); // Debugging log
          toast.error(error?.response?.data?.message || "An error occurred during profile update");
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
    
}));