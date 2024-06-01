"use client";
import { TOMBOLA_ABI } from "./abi.read";
import { useContractRead } from "wagmi";
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";

const DAY = 86400;

export function HistoryRow(day: any) {
  const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

  const [winner, setWinner] = useState({
    date: "",
    number: "",
    users: "",
  });

  const { data: draws, isLoading: isLoadingDraws } = useContractRead({
    address: contractAddress,
    abi: TOMBOLA_ABI,
    functionName: "draws",
    args: [day.day],
  });
  const { data: users, isLoading: isLoadingUsers } = useContractRead({
    address: contractAddress,
    abi: TOMBOLA_ABI,
    functionName: "getUsers",
    args: [parseInt(day.day) * 86400, draws],
  });

  useEffect(() => {
    console.log(day, draws, users);
    if (draws && users) {
      setWinner({
        date: format(
          new Date(parseInt(day.day) * DAY * 1000),
          "dd-MM-yyyy"
        ).toString(),
        number: draws.toString(),
        users: users.toString(),
      });
    }
  }, [draws, users, day]);

  return (
    winner.date && (
      <TableRow>
        <TableCell>{winner.date}</TableCell>
        <TableCell>{winner.number}</TableCell>
        <TableCell>{winner.users}</TableCell>
      </TableRow>
    )
  );
}
