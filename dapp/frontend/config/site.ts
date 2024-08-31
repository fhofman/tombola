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
      tombola: "0xB5ee380aaE087F5f3B489E7244337247701Cc2F9",
      token: "0x0",
    },
    polygonAmoy: {
      tombola: "0x4e33b5e3b94c6f95CCf2cfE543865a6e906bEE3A",
      token: "0x0",
    },
    polygon: {
      tombola: "0xA2C9dFE9dAc10131cA5573a8d2E33b0Ba74c96CC",
      token: "0x0",
    },

  }
}
