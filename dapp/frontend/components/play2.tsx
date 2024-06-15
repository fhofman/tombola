"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { TOMBOLA_ABI } from "./abi.read";
import { format } from "date-fns";
import Moralis from "moralis";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useContractWrite,
  usePrepareContractWrite,
  useContractReads,
  useAccount,
} from "wagmi";
import { formatEther, parseEther } from "ethers";
import { parseAbiItem } from "viem";
import { publicClient } from "./client";
import { YourNumbers } from "./yourNumbers";

const min = 1,
  //TODO ver como hacer para que este dato venga del contrato
  max = 10; //dataS && dataS[NUMBER_RANGE]?.result;
const FormSchema = z.object({
  guessNumber: z.coerce
    .number()
    .gte(min, { message: `Must be greater than or equal to ${min}` })
    .lte(max, { message: `Must be less than or equal to ${max}` }),
});

export function Play(moralisReady: any) {
  const { address, connector, isConnected } = useAccount();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [guessNumber, setGuessNumber] = useState(0);
  const [guessNumberRange, setGuessNumberRange] = useState(0);
  const [logs, setLogs] = useState([]);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      //guessNumber: 0,
    },
  });
  const COMMISSION = 0;
  const PLAY_COST = 1;
  const NUMBER_RANGE = 2;
  const JACKPOT = 3;
  const CURRENT_DAY = 4;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  console.log("Contract ", contractAddress);
  const tombolaContract = {
    address: contractAddress,
    abi: TOMBOLA_ABI,
  };
  const { data: dataS, isLoading: isLoadingS } = useContractReads({
    contracts: [
      {
        ...tombolaContract,
        functionName: "commission",
      },
      {
        ...tombolaContract,
        functionName: "playCost",
      },
      {
        ...tombolaContract,
        functionName: "drawNumbersRange",
      },
      {
        ...tombolaContract,
        functionName: "accumBalance",
      },
      {
        ...tombolaContract,
        functionName: "getDayByBlockNumber",
      },
    ],
  });

  console.log("dataS ", dataS);
  const getLogs = async () => {
    try {
      const log = await Moralis.EvmApi.events.getContractLogs({
        chain: "0x89",
        topic0:
          "0xa5e4f5e57d0b9df074c905ee3fe7999e091da2f0953b3ee1ed0b47db16c20233",
        //topic2: "0x000000000000000000000000" + address.substr(2),
        //topic2: "0xf4f0bf9ec59f3d8e8bdcbc2fb3a8995fea6dab73",
        order: "DESC",
        address: contractAddress,
      });
      const filteredLogs = log.raw.result.filter(
        (item: any) =>
          "0x" + item.topic3.substr(26).toLowerCase() == address.toLowerCase()
      );

      setLogs(filteredLogs);
    } catch (e) {
      console.error(e);
    }
  };

  const { config } = usePrepareContractWrite({
    ...tombolaContract,
    functionName: "play",
    args: [form.getValues().guessNumber],
    value: dataS && BigInt(dataS[PLAY_COST]?.result?.toString()),
    enabled: Boolean(form.getValues().guessNumber) && dataS[PLAY_COST]?.result,
  });
  const { isLoading, isSuccess, write } = useContractWrite(config);
  console.log("dataS ", dataS);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    write?.();
    toast({
      title: "You submitted the following value:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{form.getValues("guessNumber")}</code>
        </pre>
      ),
    });
  }

  function Jackpot() {
    if (dataS && dataS[JACKPOT].status != "failure") {
      return (
        <h3
          className={
            dataS[JACKPOT]?.result > 5 * 1000000000000000000
              ? "text-3xl font-bold text-center pt-3"
              : "text-2l font-bold text-center pt-3"
          }
        >
          Jackpot : {formatEther(dataS[JACKPOT]?.result) ?? 0} matic
        </h3>
      );
    } else {
      return;
      <h2 className="text-3xl font-bold text-center pt-3">Not Jackpot yet!</h2>;
    }
  }

  useEffect(() => {
    if (moralisReady) getLogs();
  }, [moralisReady]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-center pt-3">Guess your number</h1>
      <Jackpot />
      <h4 className="text-2l text-center pt-3">
        Platform Commission: {dataS && dataS[COMMISSION]?.result?.toString()} %
      </h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="guessNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guess the number</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="choose a number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  <div>
                    <strong>
                      You have to chose a number from 1 to{" "}
                      {dataS && dataS[NUMBER_RANGE]?.result?.toString()} betting{" "}
                      {dataS && formatEther(dataS[PLAY_COST]?.result ?? 0)}{" "}
                      matic.
                    </strong>
                  </div>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {isLoading && <div>Loading...</div>}
          {isSuccess && <div>Success!</div>}
          <Button
            disabled={!write}
            // onClick={() => {
            //   write?.();
            // }}
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
      <h3 className="text-3xl font-bold text-center pt-3">Your numbers</h3>
      <YourNumbers logs={logs} />
    </div>
  );
}
