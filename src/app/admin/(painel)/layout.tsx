import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: "Painel da gestão" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminShell mode="live">{children}</AdminShell>;
}
