import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/react";

export function AuthLayout({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <Link to="/" className="mb-6 bg-linear-to-br from-brand-mint to-brand-blue bg-clip-text text-2xl font-bold text-transparent">
        GovernanceFund
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-xl font-semibold">{title}</CardHeader>
        <CardBody className="gap-4">{children}</CardBody>
      </Card>
      {footer && <div className="mt-4 text-sm text-default-500">{footer}</div>}
    </div>
  );
}
