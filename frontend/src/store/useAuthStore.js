import { create } from "zustand";

export const useAuthStore = create((set) => ({
    authUser : { name : "ashish" , _id : 123 , age :20},
    isLoggedIn : false ,
    isLoading : false,


    login: () => {
       console.log("we just logged in ");
       set ({isLoggedIn : true , isLoading : true});
    },
}));