import axios from "axios";
 


export const  axiosInstance = axios.create({
    baseURL : import.meta.env.MODE === "develeopment" ? "http://localhost:3000/api" : "/api",
    withCredentials : true,
});