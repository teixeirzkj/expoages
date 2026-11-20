import { Screen } from "@/components/admin/admin-shell";
import { OuvidoriaListScreen } from "@/components/admin/screens/submissions";

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Screen>
      <OuvidoriaListScreen mode="live" searchParams={searchParams} />
    </Screen>
  );
}
