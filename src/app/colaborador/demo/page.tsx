import type { Metadata } from "next";
import { Suspense } from "react";
import { EmployeeHomeScreen } from "@/components/employee/screens";
import { EmployeeFallback } from "@/components/employee/screen-fallback";

export const metadata: Metadata = { title: "Meu Feedback" };

export default function Page({ searchParams }: PageProps<"/colaborador/demo">) {
  return (
    <Suspense fallback={<EmployeeFallback />}>
      <EmployeeHomeScreen mode="demo" searchParams={searchParams} />
    </Suspense>
  );
}
