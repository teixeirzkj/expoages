import { Screen } from "@/components/admin/admin-shell";
import { ReviewEditScreen } from "@/components/admin/screens/reviews";

export default function Page({ params }: PageProps<"/demo/avaliacoes/[id]/editar">) {
  return (
    <Screen>
      <ReviewEditScreen mode="demo" params={params} />
    </Screen>
  );
}
