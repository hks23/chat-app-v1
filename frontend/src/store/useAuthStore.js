import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

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
    
}));