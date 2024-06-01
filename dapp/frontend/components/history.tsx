"use client";
import { TOMBOLA_ABI } from "./abi.read";
import { useContractRead } from "wagmi";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HistoryRow } from "@/components/history-row";

export function HistoryList() {
  const pastDays = 5;
  const [days, setDays] = useState([]);
  const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

  const { data: day, isLoading: isLoadingDay } = useContractRead({
    address: contractAddress,
    abi: TOMBOLA_ABI,
    functionName: "getDayByBlockNumber",
  });

  useEffect(() => {
    const days = Array.from({ length: pastDays }, (_, i) => day - BigInt(i));
    setDays(days);
  }, [day]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-center pt-3">Draws</h1>
      <Table>
        <TableCaption>Keep the numbers in last {pastDays} draws</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">Date</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Users</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((row, idx) => (
            <HistoryRow key={idx} day={row} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
