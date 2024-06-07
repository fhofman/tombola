export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Tombola",
  description:
    "Try your lack with TomBoLa.",
  mainNav: [
    {
      title: "Play",
      href: "/play",
    },
    {
      title: "Draws",
      href: "/history",
    },
    {
      title: "Claim",
      type: "button",
      action: "claim",
    },
  ],
  contracts: {
    sepolia: {
      tombola: "0xc6487525441034C9faA88e85D01853F4D64673Ea",
      token: "0x0",
    },
    polygonAmoy: {
      tombola: "0x4e33b5e3b94c6f95CCf2cfE543865a6e906bEE3A",
      token: "0x0",
    },
    mainnet: {
      tombola: "0x0",
      token: "0x0",
    },

  }
}
