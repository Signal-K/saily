import { createClient } from "@/lib/supabase/client";

/**
 * Repairs a broken streak for a specific date using a Data Chip.
 * Calls the `repair_streak` RPC function.
 */
export async function repairStreak(date: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.rpc("repair_streak", { target_date: date });
  
  if (error) {
    throw new Error(error.message);
  }
  return true;
}

/**
 * Unlocks a historical puzzle for play (no score) using a Data Chip.
 * Calls the `unlock_archive` RPC function.
 */
export async function unlockArchive(date: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.rpc("unlock_archive", { target_date: date });

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

/**
 * Fetches the current Data Chip balance for a user.
 */
export async function getDataChipsBalance(userId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("data_chips")
    .eq("id", userId)
    .single();
    
  if (error) {
    return 0;
  }
  
  return data?.data_chips ?? 0;
}
