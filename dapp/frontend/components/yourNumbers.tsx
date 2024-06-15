"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export function YourNumbers(logs: any) {
  console.log("logs %o", logs.logs);
  return (
    <div>
      <h3 className="text-3xl font-bold text-center pt-3">Your numbers</h3>
      <Table>
        <TableCaption>The numbers you choose</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[5%]">Number</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((row, idx) => (
            <TableRow>
              <TableCell className="text-center">
                {parseInt(row.topic2)}
              </TableCell>
              <TableCell>
                {format(
                  new Date(parseInt(row.topic1) * 86400 * 1000),
                  "dd-MM-yyyy"
                ).toString()}
              </TableCell>
              <TableCell>{"0x" + row.topic3.substr(26)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
