import "@/styles/globals.css";
import { Metadata } from "next";
import React, { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Wagmi } from "@/components/wagmi";
import { Toaster } from "@/components/ui/toaster";
import { useSwitchNetwork } from "wagmi";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  //const { switchNetworkAsync } = useSwitchNetwork();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This will set `isClient` to true only when the component is mounted on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Ensure `useSwitchNetwork` is called only on the client side
      const { switchNetworkAsync } = useSwitchNetwork();

      const switchToPolygonMainnet = async () => {
        const chainId = 137; // Chain ID for Polygon Mainnet
        if (switchNetworkAsync) {
          await switchNetworkAsync(chainId);
        }
      };

      // Call your switch network function here or based on some other client-side interaction
      switchToPolygonMainnet();
    }
  }, [isClient]);
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system">
            <div className="relative flex min-h-screen flex-col">
              <Wagmi>
                <SiteHeader />
                <button onClick={switchToPolygonMainnet}>
                  Switch to Ethereum Mainnet
                </button>
                <div>{children}</div>
              </Wagmi>
            </div>
          </ThemeProvider>
          <Toaster />
          <h6 className="text-sl text-center pt-3">
            Randomness powered by{" "}
            <a href="https://docs.chain.link/vrf">VRF chainlink</a>
          </h6>
        </body>
      </html>
    </>
  );
}
