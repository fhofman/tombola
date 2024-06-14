"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { parseEther, zeroAddress } from "viem";

import { useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import { siteConfig } from "@/config/site";

import {
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import contract from "../abi/tombola.abi.json";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
//import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/components/ui/use-toast";

export function Play(moralisReady: boolean) {
  const { toast } = useToast();

  const { chain } = useNetwork();
  const { status } = useAccount();
  const [connected, setConnected] = useState(false);
  const [args, setArgs] = useState();

  const name = chain?.name.toLowerCase();
  const address = siteConfig.contracts[name]?.tombola;
  const tombolaContract = {
    address: address,
    abi: contract,
  };
  const { data: dataNumTo } = useContractRead({
    address: tombolaContract.address,
    abi: tombolaContract.abi,
    functionName: "drawNumbersRange",
  });

  const {
    config,
    isSuccess,
    isLoading: isLoadingPrepare,
    isError: isErrorPrepare,
  } = usePrepareContractWrite({
    address,
    abi: [tombolaContract.abi],
    functionName: "play",
    args,
    enabled: Boolean(args) && Boolean(address),
    value: parseEther("0.1"),
  });
  const {
    data,
    isLoading,
    isSuccess: isSuccessWrite,
    write,
  } = useContractWrite(config);

  useEffect(() => {
    console.log(isSuccess);
    if (isSuccess) write?.();
  }, [isSuccess, write]);

  const stringToNumber = z.string().refine((value) => !isNaN(value), {
    message: "Must be a valid number",
    path: ["number"], // field path
  });

  const FormSchema = z.object({
    number: z.coerce.number().gte(dataNumTo, "Must be above 10"),
    number: stringToNumber
      .transform(Number)
      .refine((value) => value >= 1 && value <= 10, {
        message: "Must be between 1 and 10",
      }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      number: "",
    },
  });

  function setNumber() {
    toast({
      title: "You submitted the following value:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{form.getValues("number")}</code>
        </pre>
      ),
    });

    return [form.getValues("number")];
  }

  useEffect(() => {
    if (status === "connected") setConnected(true);
  }, [status]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 w-full px-20 text-center">
          <h1 className="text-6xl font-bold">Access denied</h1>
          <p className="mt-3 text-2xl">Please log in first</p>
        </main>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Tombola, play your luck</CardTitle>
            <CardDescription>
              You have to chose a number from 1 to 10 betting 0.01 eth.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await form.trigger();
                if (result) setArgs(setNumber());
              }}
              className="w-2/3 space-y-6"
            >
              <CardContent>
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="guess the number"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                {isLoading && <div>loading...</div>}
                {isLoadingPrepare && <div>loadingPreparing...</div>}
                {isSuccess && <div>success</div>}
                <Button type="submit" disabled={isLoading && !data}>
                  {isLoading && <div>loading...</div>}
                  {!isLoading && <div>Submit</div>}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    );
  }
}
