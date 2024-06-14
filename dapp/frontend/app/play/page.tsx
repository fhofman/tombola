"use client";
import { Play } from "@/components/play2";
import Moralis from "moralis";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [moralisReady, setMoralisReady] = useState(false);

  const initMoralis = async () => {
    await Moralis.start({
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQ3Mjk5ZWExLTczYmEtNDU2Ni1iYmRhLTUzMTQ5ZGEyZDFlOSIsIm9yZ0lkIjoiMjU4MTAwIiwidXNlcklkIjoiMjYyMDkxIiwidHlwZUlkIjoiNDRhMDFiYjMtYTUyOC00NDg0LWJkOWUtNWZhYjI2NDQxMzViIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODk5NjMzMzcsImV4cCI6NDg0NTcyMzMzN30.rHUuW5Au4kTXh_cesSqhoUgWwDdLjNiBZcLNezVPRdU",
    });
    setMoralisReady(true);
  };

  useEffect(() => {
    initMoralis();
  }, []);

  return <Play moralisReady={moralisReady} />;
}
