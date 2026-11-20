import { Screen } from "@/components/admin/admin-shell";
import { SettingsScreen } from "@/components/admin/screens/settings";

export default function Page() {
  return (
    <Screen>
      <SettingsScreen mode="live" />
    </Screen>
  );
}
