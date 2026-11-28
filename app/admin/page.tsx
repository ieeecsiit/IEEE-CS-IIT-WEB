import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminApp } from "./admin-app";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * The forms admin panel. In production, Cloudflare Access protects /admin and /api/admin; the API
 * also verifies the Access token itself (functions/_lib/access.ts).
 */
export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>
  );
}
