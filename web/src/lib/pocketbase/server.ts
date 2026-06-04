/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { cookies } from "next/headers";
import { POCKETBASE_COOKIE_NAME, type PocketBaseSession } from "./config";

type PocketBaseQueryResult = { data: any[]; error: any; count: number };

function emptyQueryResult(): PocketBaseQueryResult {
  return { data: [], error: null, count: 0 };
}

class PocketBaseQuery {
  select(..._args: any[]) { return this; }
  insert(..._args: any[]) { return this; }
  upsert(..._args: any[]) { return this; }
  update(..._args: any[]) { return this; }
  delete(..._args: any[]) { return this; }
  eq(..._args: any[]) { return this; }
  neq(..._args: any[]) { return this; }
  gt(..._args: any[]) { return this; }
  gte(..._args: any[]) { return this; }
  lt(..._args: any[]) { return this; }
  lte(..._args: any[]) { return this; }
  is(..._args: any[]) { return this; }
  not(..._args: any[]) { return this; }
  contains(..._args: any[]) { return this; }
  ilike(..._args: any[]) { return this; }
  or(..._args: any[]) { return this; }
  in(..._args: any[]) { return this; }
  order(..._args: any[]) { return this; }
  limit(..._args: any[]) { return this; }
  range(..._args: any[]) { return this; }
  maybeSingle(..._args: any[]): Promise<any> { return Promise.resolve({ data: null, error: null }); }
  single(..._args: any[]): Promise<any> { return Promise.resolve({ data: null, error: null }); }
  then<TResult1 = PocketBaseQueryResult, TResult2 = never>(
    onfulfilled?: ((value: PocketBaseQueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(emptyQueryResult()).then(onfulfilled, onrejected);
  }
}

async function readSession(): Promise<PocketBaseSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(POCKETBASE_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as PocketBaseSession;
  } catch {
    return null;
  }
}

export async function createClient() {
  return {
    auth: {
      async getUser() {
        const session = await readSession();
        return { data: { user: session?.user ?? null }, error: null };
      },
      async signOut() {
        const cookieStore = await cookies();
        cookieStore.delete(POCKETBASE_COOKIE_NAME);
        return { error: null };
      },
    },
    from(..._args: any[]) {
      return new PocketBaseQuery();
    },
    rpc(..._args: any[]): Promise<any> {
      return Promise.resolve({ data: null, error: null });
    },
  };
}
