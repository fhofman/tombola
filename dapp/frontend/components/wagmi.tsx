"use client";
import { polygonAmoy } from "../chain/polygonAmoy";

import {
  createWeb3Modal,
  defaultWagmiConfig,
  useWeb3ModalTheme,
} from "@web3modal/wagmi/react";

import { WagmiConfig, useContractEvent, useNetwork } from "wagmi";
import {
  mainnet,
  sepolia,
  optimism,
  optimismSepolia,
  polygon,
  holesky,
  arbitrumSepolia,
  polygonMumbai,
} from "wagmi/chains";
import { useTheme } from "next-themes";
import NetworkSwitcher from "./network-switcher";

// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

// 2. Create wagmiConfig
const metadata = {
  name: "Tombola",
  description: "Tombola - Play your luck",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// 2. Configure wagmi client
const chain = process.env.CHAIN;

const chains = [
  chain == "polygon"
    ? polygon
    : chain == "polygonAmoy"
    ? polygonAmoy
    : chain == "polygonMumbai"
    ? polygonMumbai
    : chain == "optimism"
    ? optimism
    : chain == "optimismSepolia"
    ? optimismSepolia
    : chain == "sepolia"
    ? sepolia
    : chain == "holesky"
    ? holesky
    : chain == "arbitrumSepolia"
    ? arbitrumSepolia
    : mainnet,
];

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export function Wagmi({ children }: RootLayoutProps) {
  const { theme } = useTheme();
  const color = theme === "dark" ? "dark" : "light";
  const { setThemeMode } = useWeb3ModalTheme();

  setThemeMode(color);

  return (
    <WagmiConfig config={wagmiConfig}>
      <div>{children}</div>
      <NetworkSwitcher />
    </WagmiConfig>
  );
}
