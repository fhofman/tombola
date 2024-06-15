"use client";
import { Play } from "@/components/play2";
import Moralis from "moralis";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [moralisReady, setMoralisReady] = useState(false);

  const initMoralis = async () => {
    await Moralis.start({
      apiKey: process.env.API_MORALIS,
    });
    setMoralisReady(true);
  };

  useEffect(() => {
    initMoralis();
  }, []);

  return <Play moralisReady={moralisReady} />;
}
