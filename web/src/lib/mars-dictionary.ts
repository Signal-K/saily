export type MarsTemplate = {
  id: string;
  label: string;
  description: string;
  imageUrl: string;
};

export const MARS_TEMPLATE_DICTIONARY: MarsTemplate[] = [
  {
    id: "crater",
    label: "Crater",
    description: "Circular depressions caused by impacts. Often have raised rims.",
    imageUrl: "https://images-assets.nasa.gov/image/PIA23240/PIA23240~thumb.jpg",
  },
  {
    id: "dunes",
    label: "Dunes",
    description: "Rippled or wave-like patterns formed by wind-blown sand.",
    imageUrl: "https://images-assets.nasa.gov/image/PIA16563/PIA16563~thumb.jpg",
  },
  {
    id: "rock-outcrop",
    label: "Rock Outcrop",
    description: "Exposed bedrock or large, sharp-edged rock clusters.",
    imageUrl: "https://images-assets.nasa.gov/image/PIA21261/PIA21261~thumb.jpg",
  },
  {
    id: "sand-dust",
    label: "Sand & Dust",
    description: "Fine-grained material covering the surface, often smooth or featureless.",
    imageUrl: "https://images-assets.nasa.gov/image/PIA21600/PIA21600~thumb.jpg",
  },
  {
    id: "deposit",
    label: "Deposit",
    description: "Layered or clustered material differing from the surrounding terrain.",
    imageUrl: "https://images-assets.nasa.gov/image/PIA21716/PIA21716~thumb.jpg",
  },
];
