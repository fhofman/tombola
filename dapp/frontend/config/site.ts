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
      tombola: "0x445e2bf606dc4408a8ecf57e9409610528dfdde2",
      token: "0x0",
    },

  }
}
