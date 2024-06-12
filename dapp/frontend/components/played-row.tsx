"use client";
import { TOMBOLA_ABI } from "./abi.read";
import { useContractRead, useAccount } from "wagmi";
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";

const DAY = 86400;

export function PlayedRow(day: any, num: any) {
  const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;
  const { address } = useAccount();
  const tombolaContract = {
    address: contractAddress,
    abi: TOMBOLA_ABI,
  };
  const { data: users, isLoading: isLoadingUsers } = useContractRead({
    ...tombolaContract,
    functionName: "getUsers",
    args: [parseInt(day.day) * 86400, num],
  });
  let found = false;
  useEffect(() => {
    console.log(day, users);
    found = users && users.includes(address);
  }, [users, day]);

  return (
    found && (
      <TableRow>
        <TableCell>{num}</TableCell>
      </TableRow>
    )
  );
}
