import { Screen } from "@/components/admin/admin-shell";
import { ReportsScreen } from "@/components/admin/screens/reports";

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Screen>
      <ReportsScreen mode="demo" searchParams={searchParams} />
    </Screen>
  );
}
