import { Screen } from "@/components/admin/admin-shell";
import { ActionsScreen } from "@/components/admin/screens/actions";

export default function Page() {
  return (
    <Screen>
      <ActionsScreen mode="demo" />
    </Screen>
  );
}
