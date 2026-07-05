import axios from "axios";
import { env } from "../config/env";

export const api = axios.create({
    baseURL: `${env.API_URL}/api/v1`,
    withCredentials: true
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if(error.response?.status === 401) {

        }
        return Promise.reject(error)
    }
);