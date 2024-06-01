"use client";
import { TOMBOLA_ABI } from "./abi.read";
import { Button as But } from "@/components/ui/button";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { any } from "zod";

export function Button(title: any, action: any) {
  const [connected, setConnected] = useState(false);
  console.log(action);
  const { address, status } = useAccount();
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const tombolaContract = {
    address: contractAddress,
    abi: TOMBOLA_ABI,
  };
  const { data: toClaim, isLoading: isLoadingDay } = useContractRead({
    ...tombolaContract,
    functionName: "userClaim",
    args: [address],
  });
  console.log("claimValue ", toClaim);

  useEffect(() => {
    if (status === "connected") setConnected(true);
  }, [status]);
  const { write: claim } = useContractWrite({
    ...tombolaContract,
    functionName: "claim",
  });

  const claimInContract = () => {
    //   // TODO: TODA LA LOGICA DE LLAMAR AL CONTRATO
    claim?.();
  };
  // // TODO: logica para obtener la cantidad que puede claimear.. guardad en variable "toClaim"\

  return (
    toClaim && (
      <But onClick={claimInContract}>{`Claim: ${formatEther(
        toClaim
      )} eth`}</But>
    )
  );
}
