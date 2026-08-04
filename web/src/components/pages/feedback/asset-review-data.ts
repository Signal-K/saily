export type AssetReviewItem = {
  slug: string;
  kind: string;
  kindSub: string;
  tier: string;
  title: string;
  price: string;
  gate: string;
  file: string;
};

// Extracted from the KES-92 "Room Tier Art Review" pass — 20 tiered room
// dioramas across 4 room kinds, rendered through the Landnam Blender pipeline.
// Real, shipped-candidate art (not placeholders) pulled in for public review.
export const ASSET_REVIEW_ITEMS: AssetReviewItem[] = [
  { slug: "strap-booster-pair", kind: "Mining Laser", kindSub: "booster", tier: "T1", title: "Strap Booster Pair", price: "$3.8M", gate: "Available at start", file: "/feedback/room-tier-review/strap-booster-pair.png" },
  { slug: "focused-mining-laser-t2", kind: "Mining Laser", kindSub: "booster", tier: "T2", title: "Focused Mining Laser T2", price: "$7.5M", gate: "2 missions", file: "/feedback/room-tier-review/focused-mining-laser-t2.png" },
  { slug: "ringed-mining-laser-t3", kind: "Mining Laser", kindSub: "booster", tier: "T3", title: "Ringed Mining Laser T3", price: "$10.5M", gate: "4 missions", file: "/feedback/room-tier-review/ringed-mining-laser-t3.png" },
  { slug: "twin-emitter-mining-laser-t4", kind: "Mining Laser", kindSub: "booster", tier: "T4", title: "Twin-Emitter Mining Laser T4", price: "$14.0M", gate: "6 missions", file: "/feedback/room-tier-review/twin-emitter-mining-laser-t4.png" },
  { slug: "resonant-mining-laser-t5", kind: "Mining Laser", kindSub: "booster", tier: "T5", title: "Resonant Mining Laser T5", price: "$19.0M", gate: "8 missions", file: "/feedback/room-tier-review/resonant-mining-laser-t5.png" },

  { slug: "cargo-bay-t1", kind: "Storage Silos", kindSub: "payload (reskin)", tier: "T1", title: "Cargo Bay T1", price: "$4.2M", gate: "Available at start", file: "/feedback/room-tier-review/cargo-bay-t1.png" },
  { slug: "storage-silo-bank-t2", kind: "Storage Silos", kindSub: "payload (reskin)", tier: "T2", title: "Storage Silo Bank T2", price: "$8.0M", gate: "2 missions", file: "/feedback/room-tier-review/storage-silo-bank-t2.png" },
  { slug: "storage-silo-bank-t3", kind: "Storage Silos", kindSub: "payload (reskin)", tier: "T3", title: "Storage Silo Bank T3", price: "$11.0M", gate: "4 missions", file: "/feedback/room-tier-review/storage-silo-bank-t3.png" },
  { slug: "storage-silo-bank-t4", kind: "Storage Silos", kindSub: "payload (reskin)", tier: "T4", title: "Storage Silo Bank T4", price: "$15.0M", gate: "6 missions", file: "/feedback/room-tier-review/storage-silo-bank-t4.png" },
  { slug: "storage-silo-bank-t5", kind: "Storage Silos", kindSub: "payload (reskin)", tier: "T5", title: "Storage Silo Bank T5", price: "$20.0M", gate: "8 missions", file: "/feedback/room-tier-review/storage-silo-bank-t5.png" },

  { slug: "ion-thruster-t1", kind: "Engine", kindSub: "engine", tier: "T1", title: "Ion Thruster T1", price: "$6.4M", gate: "Available at start", file: "/feedback/room-tier-review/ion-thruster-t1.png" },
  { slug: "fusion-thruster-t2", kind: "Engine", kindSub: "engine", tier: "T2", title: "Fusion Thruster T2", price: "$10.5M", gate: "2 missions", file: "/feedback/room-tier-review/fusion-thruster-t2.png" },
  { slug: "plasma-thruster-t3", kind: "Engine", kindSub: "engine", tier: "T3", title: "Plasma Thruster T3", price: "$14.5M", gate: "4 missions", file: "/feedback/room-tier-review/plasma-thruster-t3.png" },
  { slug: "array-thruster-t4", kind: "Engine", kindSub: "engine", tier: "T4", title: "Array Thruster T4", price: "$19.5M", gate: "6 missions", file: "/feedback/room-tier-review/array-thruster-t4.png" },
  { slug: "antimatter-thruster-t5", kind: "Engine", kindSub: "engine", tier: "T5", title: "Antimatter Thruster T5", price: "$26.0M", gate: "8 missions", file: "/feedback/room-tier-review/antimatter-thruster-t5.png" },

  { slug: "crew-quarters-t1", kind: "Crew Transport", kindSub: "crew-module", tier: "T1", title: "Crew Quarters T1", price: "$5.5M", gate: "4 missions", file: "/feedback/room-tier-review/crew-quarters-t1.png" },
  { slug: "crew-transport-t2", kind: "Crew Transport", kindSub: "crew-module", tier: "T2", title: "Crew Transport T2", price: "$7.7M", gate: "5 missions", file: "/feedback/room-tier-review/crew-transport-t2.png" },
  { slug: "crew-transport-t3", kind: "Crew Transport", kindSub: "crew-module", tier: "T3", title: "Crew Transport T3", price: "$9.9M", gate: "6 missions", file: "/feedback/room-tier-review/crew-transport-t3.png" },
  { slug: "crew-transport-t4", kind: "Crew Transport", kindSub: "crew-module", tier: "T4", title: "Crew Transport T4", price: "$12.7M", gate: "7 missions", file: "/feedback/room-tier-review/crew-transport-t4.png" },
  { slug: "crew-transport-t5", kind: "Crew Transport", kindSub: "crew-module", tier: "T5", title: "Crew Transport T5", price: "$16.0M", gate: "8 missions", file: "/feedback/room-tier-review/crew-transport-t5.png" },
];

export const ASSET_REVIEW_KINDS: Array<{ kind: string; kindSub: string; blurb: string }> = [
  {
    kind: "Mining Laser",
    kindSub: "booster",
    blurb: "The extraction module — starts as a strap-on booster pair, escalates through ringed and twin-emitter rigs, and ends at a resonant array by T5.",
  },
  {
    kind: "Storage Silos",
    kindSub: "payload (reskin)",
    blurb: "Cargo capacity — a plain bay at T1 growing into a stacked silo bank. This kind is a reskin of the payload slot, so its job is to read as \"more storage\" at a glance.",
  },
  {
    kind: "Engine",
    kindSub: "engine",
    blurb: "Propulsion — ion, fusion, plasma, array, then antimatter thrusters. The tier ladder here has the widest visual jump of the four.",
  },
  {
    kind: "Crew Transport",
    kindSub: "crew-module",
    blurb: "Living quarters for crew, gated later than the others (first unlock needs 4 completed missions rather than being available at start).",
  },
];
