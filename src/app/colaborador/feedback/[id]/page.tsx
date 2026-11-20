import type { Metadata } from "next";
import { Suspense } from "react";
import { EmployeeReviewScreen } from "@/components/employee/screens";
import { EmployeeFallback } from "@/components/employee/screen-fallback";

export const metadata: Metadata = { title: "Meu feedback" };

export default function Page({ params, searchParams }: PageProps<"/colaborador/feedback/[id]">) {
  return (
    <Suspense fallback={<EmployeeFallback />}>
      <EmployeeReviewScreen mode="live" params={params} searchParams={searchParams} />
    </Suspense>
  );
}
