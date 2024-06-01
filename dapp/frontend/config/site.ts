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
      tombola: "0x950738c82B70614DEf3e8EC31066a405E9468f0c",
      token: "0x0",
    },
    polygonAmoy: {
      tombola: "0xba35c7b4ec26cb47b0f586017a92a700b00d8283",
      token: "0x0",
    },
    mainnet: {
      tombola: "0x0",
      token: "0x0",
    },

  }
}
