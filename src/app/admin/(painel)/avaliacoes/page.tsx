import { Screen } from "@/components/admin/admin-shell";
import { ReviewsListScreen } from "@/components/admin/screens/reviews";

export default function Page({ searchParams }: PageProps<"/admin/avaliacoes">) {
  return (
    <Screen>
      <ReviewsListScreen mode="live" searchParams={searchParams} />
    </Screen>
  );
}
