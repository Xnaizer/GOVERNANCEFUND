import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { beginRouteLoad, useRouteLoading } from "../lib/routeProgress";

/**
 * Bar gradien (mint→biru) di paling atas layar yang tampil SETIAP pindah rute.
 * Digerakkan oleh status loading nyata:
 *  - setiap perubahan rute menahan bar minimal ~500ms (agar tetap terlihat
 *    walau chunk halaman sudah ter-cache / transisinya instan),
 *  - selama chunk lazy dimuat (Suspense fallback aktif) bar terus "mengisi".
 * Lebar bar di-trickle via JS lalu ditutup ke 100% + fade. Murni CSS (tanpa framer),
 * z paling atas supaya menutupi navbar/sidebar/modal di semua halaman.
 */
export function RouteProgress() {
    const { pathname } = useLocation();
    const loading = useRouteLoading();
    const first = useRef(true);
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(0);

    // Tiap pindah rute → tahan bar minimal 500ms.
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return; // jangan tampil saat load pertama aplikasi
        }
        const release = beginRouteLoad();
        const t = setTimeout(release, 500);
        return () => {
            clearTimeout(t);
            release();
        };
    }, [pathname]);

    // Refleksikan status loading → animasi lebar.
    useEffect(() => {
        if (loading) {
            setVisible(true);
            setWidth(8);
            const id = setInterval(() => {
                // Trickle: cepat di awal, merayap mendekati 90%.
                setWidth((w) => (w >= 90 ? w : Math.min(90, w + (90 - w) * 0.12 + 1)));
            }, 180);
            return () => clearInterval(id);
        }
        // Selesai: isi ke 100% lalu sembunyikan setelah fade.
        setWidth((w) => (w > 0 ? 100 : 0));
        const t = setTimeout(() => {
            setVisible(false);
            setWidth(0);
        }, 320);
        return () => clearTimeout(t);
    }, [loading]);

    if (!visible) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-0.75">
            <div
                className="route-progress-bar h-full"
                style={{ width: `${width}%`, opacity: width >= 100 ? 0 : 1 }}
            />
        </div>
    );
}
