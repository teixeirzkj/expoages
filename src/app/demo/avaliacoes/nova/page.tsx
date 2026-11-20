import { Screen } from "@/components/admin/admin-shell";
import { ReviewNewScreen } from "@/components/admin/screens/reviews";

export default function Page({ searchParams }: PageProps<"/demo/avaliacoes/nova">) {
  return (
    <Screen>
      <ReviewNewScreen mode="demo" searchParams={searchParams} />
    </Screen>
  );
}
