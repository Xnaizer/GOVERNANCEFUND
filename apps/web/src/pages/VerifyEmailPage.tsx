import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { AuthLayout } from "../components/AuthLayout";
import { verifyEmail } from "../api/authApi";
import { getErrorMessage } from "../utils/error";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<{ status: "loading" | "ok" | "error"; message: string }>({ status: "loading", message: "" });
  const ran = useRef(false); 

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setState({ status: "error", message: "Token verifikasi tidak ada." });
      return;
    }
    verifyEmail(token)
      .then((msg) => setState({ status: "ok", message: msg }))
      .catch((e) => setState({ status: "error", message: getErrorMessage(e) }));
  }, [token]);

  return (
    <AuthLayout title="Verifikasi Email" footer={<Link to="/login" className="text-brand-blue">Ke halaman masuk</Link>}>
      {state.status === "loading" && <Spinner label="Memverifikasi…" />}
      {state.status === "ok" && <p className="text-success">{state.message}</p>}
      {state.status === "error" && <p className="text-danger">{state.message}</p>}
    </AuthLayout>
  );
}
