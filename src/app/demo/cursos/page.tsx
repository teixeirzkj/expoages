import { Screen } from "@/components/admin/admin-shell";
import { CoursesScreen } from "@/components/admin/screens/courses";

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Screen>
      <CoursesScreen mode="demo" searchParams={searchParams} />
    </Screen>
  );
}
