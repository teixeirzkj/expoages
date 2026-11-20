import { Screen } from "@/components/admin/admin-shell";
import { FeedbackListScreen } from "@/components/admin/screens/submissions";

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Screen>
      <FeedbackListScreen mode="demo" searchParams={searchParams} />
    </Screen>
  );
}
