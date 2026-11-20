import { Screen } from "@/components/admin/admin-shell";
import { ReviewDetailScreen } from "@/components/admin/screens/reviews";

export default function Page({ params }: PageProps<"/demo/avaliacoes/[id]">) {
  return (
    <Screen>
      <ReviewDetailScreen mode="demo" params={params} />
    </Screen>
  );
}
