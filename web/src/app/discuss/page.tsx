import { DiscussForum } from "@/components/discuss-forum";
import { getTodayAestDateKey } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  e2eAuth?: string;
};

export default async function DiscussPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const initialDate = getTodayAestDateKey();
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const e2eBypass = process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS === "true" && params.e2eAuth === "1";

  return <DiscussForum initialDate={initialDate} isAuthenticated={Boolean(user) || e2eBypass} />;
}
