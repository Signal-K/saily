import { createClient } from "@/lib/pocketbase/client";

/**
 * Unlocks a historical puzzle for play (no score) using a Data Chip.
 * Calls the `unlock_archive` RPC function.
 */
export async function unlockArchive(date: string): Promise<boolean> {
  const pocketbase = createClient();
  const { error } = await pocketbase.rpc("unlock_archive", { target_date: date });

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

/**
 * Fetches the current Data Chip balance for a user.
 */
export async function getDataChipsBalance(userId: string): Promise<number> {
  const pocketbase = createClient();
  const { data, error } = await pocketbase
    .from("profiles")
    .select("data_chips")
    .eq("id", userId)
    .single();
    
  if (error) {
    return 0;
  }
  
  return data?.data_chips ?? 0;
}
