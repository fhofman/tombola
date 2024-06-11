"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { TOMBOLA_ABI } from "./abi.read";

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
} from "wagmi";
import { formatEther, parseEther } from "ethers";
const min = 1,
  //TODO ver como hacer para que este dato venga del contrato
  max = 10; //dataS && dataS[NUMBER_RANGE]?.result;
const FormSchema = z.object({
  guessNumber: z.coerce
    .number()
    .gte(min, { message: `Must be greater than or equal to ${min}` })
    .lte(max, { message: `Must be less than or equal to ${max}` }),
});

export function Play() {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [guessNumber, setGuessNumber] = useState(0);
  const [guessNumberRange, setGuessNumberRange] = useState(0);
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
    ],
  });
  console.log("dataS ", dataS);

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
    </div>
  );
}
