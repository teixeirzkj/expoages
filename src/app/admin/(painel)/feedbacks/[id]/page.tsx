import { Screen } from "@/components/admin/admin-shell";
import { SubmissionDetailScreen } from "@/components/admin/screens/submissions";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Screen>
      <SubmissionDetailScreen mode="live" kind="feedback" params={params} />
    </Screen>
  );
}
