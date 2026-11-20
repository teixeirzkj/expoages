import { Screen } from "@/components/admin/admin-shell";
import { OverviewScreen } from "@/components/admin/screens/overview";

export default function Page() {
  return (
    <Screen>
      <OverviewScreen mode="live" />
    </Screen>
  );
}
