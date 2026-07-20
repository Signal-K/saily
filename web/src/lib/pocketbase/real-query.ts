/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSailyPocketBaseUrl } from "@/lib/pocketbase/config";
import { getSailyPocketBaseSuperuserToken } from "@/lib/pocketbase/admin";

// Real replacement for the old no-op stub query builder. Translates the
// Supabase-shaped `.from(...).select(...).eq(...)` call pattern the rest of
// the app already speaks into real requests against Saily's PocketBase REST
// API, authenticated as the PocketBase superuser (see admin.ts) — these
// collections have no PocketBase access rules of their own (nil rule =
// superuser-only over REST; see backend/migrations/2_supabase_replacement_collections.go),
// so per-user authorization is enforced by the calling route (via the
// already-shared-auth-verified `user.id`), not by PocketBase's rule engine.
//
// This intentionally does NOT try to support every Supabase/PostgREST
// feature. It supports what the ported routes actually use. Anything beyond
// that throws loudly instead of silently no-opping — the entire point of
// this rewrite is to stop pretending things work when they don't.

type PocketBaseQueryResult = { data: any[]; error: { message: string } | null; count: number };

type JoinConfig = { localField: string; targetCollection: string; targetField: string };

// Extend this when a route needs additional embedded select support.
// Key is `${collection}.${embedName}` from a select string like
// "id,body,profiles(username)" -> "comments.profiles".
const JOIN_CONFIG: Record<string, JoinConfig> = {
  "comments.profiles": { localField: "user_id", targetCollection: "profiles", targetField: "shared_user_id" },
  "user_stats.profiles": { localField: "user_id", targetCollection: "profiles", targetField: "shared_user_id" },
  // user_badges' relation field is named "badge" (singular); the embed name
  // used in select strings ("badges(...)") matches the target collection
  // name instead, per this app's existing convention (see comments.profiles
  // above, which does the same for "user_id" -> profiles).
  "user_badges.badges": { localField: "badge", targetCollection: "badges", targetField: "id" },
};

function pbError(message: string) {
  return { message };
}

function quoteValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return `'${String(value).replace(/'/g, "\\'")}'`;
}

async function pbFetch(path: string, init?: RequestInit) {
  const token = await getSailyPocketBaseSuperuserToken();
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  return response;
}

// PocketBase's filter parser doesn't treat `+` as an encoded space (unlike
// application/x-www-form-urlencoded), so URLSearchParams' default encoding
// silently breaks any filter containing spaces (e.g. `field = "value"`) —
// PocketBase returns 200 with zero matches instead of an error, which made
// every .eq()/.filter()-based read here silently return no rows once the
// filter expression contained a space (i.e. always, since filters are built
// as `col = "value"`). Percent-encode manually instead of relying on
// URLSearchParams' toString().
function buildQueryString(params: URLSearchParams) {
  return Array.from(params.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

async function pbList(collection: string, params: URLSearchParams) {
  const response = await pbFetch(`/api/collections/${collection}/records?${buildQueryString(params)}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PocketBase list failed for ${collection} (${response.status}): ${text}`);
  }
  return (await response.json()) as { items: Record<string, any>[]; totalItems: number };
}

async function pbCreate(collection: string, data: Record<string, any>) {
  const response = await pbFetch(`/api/collections/${collection}/records`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PocketBase create failed for ${collection} (${response.status}): ${text}`);
  }
  return (await response.json()) as Record<string, any>;
}

async function pbUpdate(collection: string, id: string, data: Record<string, any>) {
  const response = await pbFetch(`/api/collections/${collection}/records/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PocketBase update failed for ${collection} (${response.status}): ${text}`);
  }
  return (await response.json()) as Record<string, any>;
}

async function pbDelete(collection: string, id: string) {
  const response = await pbFetch(`/api/collections/${collection}/records/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    const text = await response.text().catch(() => "");
    throw new Error(`PocketBase delete failed for ${collection} (${response.status}): ${text}`);
  }
}

function parseSelect(collection: string, fields: string) {
  const embeds: { key: string; join: JoinConfig }[] = [];
  // Split on top-level commas only (embedded subfields have their own commas
  // inside parens, e.g. "id,body,profiles(username)").
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of fields) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);

  for (const part of parts) {
    const match = part.trim().match(/^([a-zA-Z0-9_]+)(!\w+)?\(/);
    if (!match) continue;
    const embedName = match[1];
    const join = JOIN_CONFIG[`${collection}.${embedName}`];
    if (!join) {
      throw new Error(
        `Unsupported embedded select "${embedName}" on "${collection}" — not yet configured in JOIN_CONFIG (real-query.ts). Add the relation mapping before using this embedded select.`,
      );
    }
    embeds.push({ key: embedName, join });
  }

  return embeds;
}

async function resolveEmbeds(rows: Record<string, any>[], embeds: { key: string; join: JoinConfig }[]) {
  if (embeds.length === 0 || rows.length === 0) return rows;

  for (const { key, join } of embeds) {
    const values = Array.from(new Set(rows.map((row) => row[join.localField]).filter((v) => v != null && v !== "")));
    if (values.length === 0) continue;

    const filter = values.map((v) => `${join.targetField} = ${quoteValue(v)}`).join(" || ");
    const params = new URLSearchParams({ filter, perPage: "500" });
    const { items } = await pbList(join.targetCollection, params);
    const byKey = new Map(items.map((item) => [item[join.targetField], item]));

    for (const row of rows) {
      row[key] = byKey.get(row[join.localField]) ?? null;
    }
  }

  return rows;
}

type Op = "select" | "insert" | "upsert" | "update" | "delete";

export class RealPocketBaseQuery {
  private collection: string;
  private op: Op = "select";
  private filters: string[] = [];
  private orderStr = "";
  private limitVal: number | null = null;
  private rangeVal: { from: number; to: number } | null = null;
  private singleMode: "single" | "maybeSingle" | null = null;
  private selectFields: string | null = null;
  private selectOptions: { count?: string; head?: boolean } | undefined;
  private writeRows: Record<string, any>[] = [];
  private upsertOnConflict: string[] | null = null;

  constructor(collection: string) {
    this.collection = collection;
  }

  select(fields?: string, options?: { count?: string; head?: boolean }) {
    this.selectFields = fields ?? null;
    this.selectOptions = options;
    return this;
  }

  insert(rows: Record<string, any> | Record<string, any>[]) {
    this.op = "insert";
    this.writeRows = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  upsert(rows: Record<string, any> | Record<string, any>[], options?: { onConflict?: string }) {
    this.op = "upsert";
    this.writeRows = Array.isArray(rows) ? rows : [rows];
    this.upsertOnConflict = options?.onConflict ? options.onConflict.split(",").map((s) => s.trim()) : null;
    return this;
  }

  update(data: Record<string, any>) {
    this.op = "update";
    this.writeRows = [data];
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  eq(col: string, value: unknown) {
    this.filters.push(`${col} = ${quoteValue(value)}`);
    return this;
  }

  neq(col: string, value: unknown) {
    this.filters.push(`${col} != ${quoteValue(value)}`);
    return this;
  }

  gt(col: string, value: unknown) {
    this.filters.push(`${col} > ${quoteValue(value)}`);
    return this;
  }

  gte(col: string, value: unknown) {
    this.filters.push(`${col} >= ${quoteValue(value)}`);
    return this;
  }

  lt(col: string, value: unknown) {
    this.filters.push(`${col} < ${quoteValue(value)}`);
    return this;
  }

  lte(col: string, value: unknown) {
    this.filters.push(`${col} <= ${quoteValue(value)}`);
    return this;
  }

  is(col: string, value: unknown) {
    this.filters.push(`${col} = ${value === null ? "null" : quoteValue(value)}`);
    return this;
  }

  not(col: string, _op: string, value: unknown) {
    this.filters.push(`${col} != ${quoteValue(value)}`);
    return this;
  }

  contains(col: string, value: unknown) {
    this.filters.push(`${col} ~ ${quoteValue(`%${value}%`)}`);
    return this;
  }

  ilike(col: string, pattern: string) {
    this.filters.push(`${col} ~ ${quoteValue(pattern.replace(/%/g, ""))}`);
    return this;
  }

  // Accepts a PostgREST-style OR string: "col.op.value,col2.op2.value2".
  // Only "ilike" is used anywhere in this codebase (case-insensitive
  // contains, matching PocketBase's `~` operator — same translation as
  // this class's own .ilike() method), so that's the only op supported here.
  or(raw: string): this {
    const conditions = raw.split(",").map((part) => {
      const [col, op, ...valueParts] = part.split(".");
      const value = valueParts.join(".");
      if (op !== "ilike") {
        throw new Error(`RealPocketBaseQuery.or() only supports "ilike" conditions, got "${op}" (collection: ${this.collection}).`);
      }
      return `${col} ~ ${quoteValue(value.replace(/%/g, ""))}`;
    });
    this.filters.push(`(${conditions.join(" || ")})`);
    return this;
  }

  in(col: string, values: unknown[]) {
    if (values.length === 0) {
      // No possible match — short-circuit with a filter that's always false.
      this.filters.push(`${col} = ${quoteValue("__no_match__")} && ${col} != ${quoteValue("__no_match__")}`);
      return this;
    }
    this.filters.push(`(${values.map((v) => `${col} = ${quoteValue(v)}`).join(" || ")})`);
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderStr = options?.ascending === false ? `-${col}` : `+${col}`;
    return this;
  }

  limit(n: number) {
    this.limitVal = n;
    return this;
  }

  // PocketBase's REST list API has no arbitrary row-offset support (only
  // page/perPage), so an arbitrary 0-indexed [from, to] range is emulated by
  // fetching every row from the start through `to` (page 1, perPage = to+1)
  // and slicing to [from, to] client-side in executeSelect(). Correct for
  // any range, at the cost of over-fetching the leading rows — acceptable
  // for this codebase's only caller, which ranges over a small, bounded
  // sample window.
  range(from: number, to: number): this {
    if (to < from) {
      throw new Error(`RealPocketBaseQuery.range(${from}, ${to}) is invalid (collection: ${this.collection}).`);
    }
    this.rangeVal = { from, to };
    return this;
  }

  private filterExpr() {
    return this.filters.length > 0 ? this.filters.join(" && ") : "";
  }

  async single(): Promise<{ data: any; error: any }> {
    this.singleMode = "single";
    const result = await this.execute();
    if (result.error) return { data: null, error: result.error };
    const row = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!row) return { data: null, error: pbError("No rows found") };
    return { data: row, error: null };
  }

  async maybeSingle(): Promise<{ data: any; error: any }> {
    this.singleMode = "maybeSingle";
    const result = await this.execute();
    if (result.error) return { data: null, error: result.error };
    const row = Array.isArray(result.data) ? result.data[0] : result.data;
    return { data: row ?? null, error: null };
  }

  then<TResult1 = PocketBaseQueryResult, TResult2 = never>(
    onfulfilled?: ((value: PocketBaseQueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<PocketBaseQueryResult> {
    try {
      if (this.op === "select") return await this.executeSelect();
      if (this.op === "insert") return await this.executeInsert();
      if (this.op === "upsert") return await this.executeUpsert();
      if (this.op === "update") return await this.executeUpdate();
      if (this.op === "delete") return await this.executeDelete();
      throw new Error(`Unknown op: ${this.op}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // This is the only place a failed PocketBase call is observable —
      // callers get { data: null, error } back instead of a thrown
      // exception (by design, so a missing row isn't treated as a crash),
      // but that also means a genuine failure (bad auth, missing
      // collection, network error) silently vanishes unless it's logged
      // here. Found via a real production bug where superuser auth was
      // failing for every call and nothing ever surfaced it.
      console.error(`[RealPocketBaseQuery] ${this.op} on "${this.collection}" failed: ${message}`);
      return { data: null as any, error: pbError(message), count: 0 };
    }
  }

  private async executeSelect(): Promise<PocketBaseQueryResult> {
    const embeds = this.selectFields ? parseSelect(this.collection, this.selectFields) : [];
    const params = new URLSearchParams();
    const filter = this.filterExpr();
    if (filter) params.set("filter", filter);
    if (this.orderStr) params.set("sort", this.orderStr);

    const perPage = this.selectOptions?.head ? 1 : this.rangeVal ? this.rangeVal.to + 1 : (this.limitVal ?? 200);
    params.set("perPage", String(perPage));

    const { items, totalItems } = await pbList(this.collection, params);

    if (this.selectOptions?.head) {
      return { data: [], error: null, count: totalItems };
    }

    const sliced = this.rangeVal ? items.slice(this.rangeVal.from, this.rangeVal.to + 1) : items;
    const resolved = await resolveEmbeds(sliced, embeds);
    return { data: resolved, error: null, count: totalItems };
  }

  private async executeInsert(): Promise<PocketBaseQueryResult> {
    const created: Record<string, any>[] = [];
    for (const row of this.writeRows) {
      created.push(await pbCreate(this.collection, row));
    }

    if (this.selectFields) {
      const embeds = parseSelect(this.collection, this.selectFields);
      await resolveEmbeds(created, embeds);
    }

    return { data: created, error: null, count: created.length };
  }

  private async executeUpsert(): Promise<PocketBaseQueryResult> {
    if (!this.upsertOnConflict) {
      throw new Error(`upsert() requires onConflict (collection: ${this.collection})`);
    }

    const results: Record<string, any>[] = [];
    for (const row of this.writeRows) {
      const filter = this.upsertOnConflict.map((col) => `${col} = ${quoteValue(row[col])}`).join(" && ");
      const params = new URLSearchParams({ filter, perPage: "1" });
      const { items } = await pbList(this.collection, params);
      const existing = items[0];
      if (existing) {
        results.push(await pbUpdate(this.collection, existing.id, row));
      } else {
        results.push(await pbCreate(this.collection, row));
      }
    }

    return { data: results, error: null, count: results.length };
  }

  private async executeUpdate(): Promise<PocketBaseQueryResult> {
    const filter = this.filterExpr();
    if (!filter) throw new Error(`update() without any filter would touch every row in "${this.collection}" — refusing.`);
    const params = new URLSearchParams({ filter, perPage: "500" });
    const { items } = await pbList(this.collection, params);
    const updated: Record<string, any>[] = [];
    for (const item of items) {
      updated.push(await pbUpdate(this.collection, item.id, this.writeRows[0]));
    }
    return { data: updated, error: null, count: updated.length };
  }

  private async executeDelete(): Promise<PocketBaseQueryResult> {
    const filter = this.filterExpr();
    if (!filter) throw new Error(`delete() without any filter would delete every row in "${this.collection}" — refusing.`);
    const params = new URLSearchParams({ filter, perPage: "500" });
    const { items } = await pbList(this.collection, params);
    for (const item of items) {
      await pbDelete(this.collection, item.id);
    }
    return { data: [], error: null, count: items.length };
  }
}
