import { Screen } from "@/components/admin/admin-shell";
import { ReviewsListScreen } from "@/components/admin/screens/reviews";

export default function Page({ searchParams }: PageProps<"/demo/avaliacoes">) {
  return (
    <Screen>
      <ReviewsListScreen mode="demo" searchParams={searchParams} />
    </Screen>
  );
}
