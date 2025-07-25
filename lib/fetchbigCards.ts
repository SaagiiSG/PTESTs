
export interface BigCard {
  hr: string;
  shortDes: string;
  slug: string;
   thumbnailUrl?: string;
  variant?: "big" | "small";
}

export async function fetchBigCards(): Promise<BigCard[]> {
  // Simulate DB or API
  return [
   {
      hr: "Hello Big",
      shortDes: "This is a big card.",
      slug: "16p",
      thumbnailUrl: "images/big-thumbnail.jpg",
      
    },
    {
      hr: "Hello BIG 2",
      shortDes: "This is a small card.",
      slug: "hello",
      thumbnailUrl: "/images/small-thumbnail.jpg",
    },
    {
      hr: "Hello BIG 3",
      shortDes: "This  is a small card.",
      slug: "iq",
      thumbnailUrl: "/images/small-thumbnail.jpg",
    },
  ];
}