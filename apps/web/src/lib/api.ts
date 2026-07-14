import axios from "axios";
import { toast } from "sonner";
import { env } from "../config/env";

export const api = axios.create({
    baseURL: `${env.API_URL}/api/v1`,
    withCredentials: true
});

const SILENT_401 = ["/auth/me", "/auth/login", "/auth/register"];

api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error.response?.status;
        const url: string = error.config?.url ?? "";
        const silent = SILENT_401.some((p) => url.includes(p));

        if (status === 401 && !silent && window.location.pathname !== "/login") {
            toast.error("Sesi berakhir. Silakan masuk kembali.");
            window.location.assign("/login");
        }
        return Promise.reject(error);
    }
);
