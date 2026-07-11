import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Peta segmen path → label ramah. Segmen tak dikenal (mis. angka id) di-title-case apa adanya.
const LABELS: Record<string, string> = {
  dashboard: "Ringkasan",
  programs: "Program",
  new: "Baru",
  manage: "Kelola",
  proposals: "Voting Proposal",
  appeals: "Banding",
  audit: "Audit",
  governance: "Tata Kelola",
  sign: "Tanda Tangan",
  profile: "Profil",
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  let acc = "";
  const crumbs = segments.map((seg) => {
    acc += `/${seg}`;
    return { href: acc, label: LABELS[seg] ?? decodeURIComponent(seg) };
  });

  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={c.href}>
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
