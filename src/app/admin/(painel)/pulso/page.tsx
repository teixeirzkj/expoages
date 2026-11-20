import { Screen } from "@/components/admin/admin-shell";
import { PulseScreen } from "@/components/admin/screens/pulse";

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Screen>
      <PulseScreen mode="live" searchParams={searchParams} />
    </Screen>
  );
}
