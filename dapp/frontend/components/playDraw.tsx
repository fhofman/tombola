import * as React from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export function PlayDraw() {
  const [number, setNumber] = React.useState("");
  const { config } = usePrepareContractWrite({
    address: "0xDE9f5d1a2792F803F9Ac1e5b4e88D1f2144d2621",
    abi: [
      {
        name: "play",
        type: "function",
        stateMutability: "payable",
        inputs: [{ internalType: "uint256", name: "number", type: "uint256" }],
        outputs: [],
      },
    ],
    functionName: "play",
    args: [parseInt(number)],
    enabled: Boolean(number),
  });
  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  return (
    <div>
      <button disabled={!write}>Play</button>
    </div>
  );
}
