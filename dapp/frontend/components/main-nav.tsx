"use client";

import * as React from "react";
import Link from "next/link";

import { NavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
//import { Button } from "@/components/ui/button";
import { Button } from "./nav-button";

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          {items?.map((item, index) => {
            if (item.href) {
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              );
            } else if (item.action) {
              // reemplazar esto por un componente custom, que reciba como prop la item.action
              // y en base a eso interactue con el contrato con la accion correspondiente
              return (
                <Button key={index} title={item.title} action={item.action} />
              );
            }
          })}
        </nav>
      ) : null}
    </div>
  );
}
