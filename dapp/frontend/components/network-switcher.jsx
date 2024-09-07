import React from 'react';
import { useEffect, useState } from "react";
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function NetworkSwitcher() {
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useEffect(() => {
    // Abre el diálogo automáticamente cuando el componente se monte
    setIsDialogOpen(true);
  }, []);
  return (
    <div>
      <div>
        {chains.map((x) =>
          x.id === chain?.id ? (
            <button key={x.id} disabled>
              Connected to {x.name}
            </button>
           ) : (
            
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Change Network</AlertDialogTitle>
                <AlertDialogDescription>                 
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Button variant="outline">
                    <button key={x.id} onClick={() => switchNetwork?.(x.id)}>
                        Switch to {x.name}
                        {isLoading && pendingChainId === x.id && ' (switching)'}
                    </button>
                    </Button>
                </div>
              </div>
            </AlertDialogContent>
          </AlertDialog>
      
          )
        )}
      </div>
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
    </div>
  );
}

export default NetworkSwitcher;