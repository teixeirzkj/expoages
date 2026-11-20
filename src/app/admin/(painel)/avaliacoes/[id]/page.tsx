import { Screen } from "@/components/admin/admin-shell";
import { ReviewDetailScreen } from "@/components/admin/screens/reviews";

export default function Page({ params }: PageProps<"/admin/avaliacoes/[id]">) {
  return (
    <Screen>
      <ReviewDetailScreen mode="live" params={params} />
    </Screen>
  );
}
