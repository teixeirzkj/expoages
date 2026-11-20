import { Screen } from "@/components/admin/admin-shell";
import { ReviewNewScreen } from "@/components/admin/screens/reviews";

export default function Page({ searchParams }: PageProps<"/admin/avaliacoes/nova">) {
  return (
    <Screen>
      <ReviewNewScreen mode="live" searchParams={searchParams} />
    </Screen>
  );
}
