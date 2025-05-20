"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DonutCounterProps {
  count: number;
  label: string;
//   description?: string;
//   growth?: string;
}

export function DonutCounter({
  count,
  label,
//   description = "Showing data for the last 6 months",
//   growth = "Trending up by 5.2% this month",
}: DonutCounterProps) {
  return (
    <Card className="flex flex-col w-full max-w-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>{label}</CardTitle>
        <CardDescription>Total Active Visitors Schedule</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center flex-1 py-6">
        <div className="relative w-52 h-52">
          {/* Donut ring with conic gradient */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(
                hsl(var(--chart-1)) 0% 25%,
                hsl(var(--chart-2)) 25% 50%,
                hsl(var(--chart-3)) 50% 75%,
                hsl(var(--chart-4)) 75% 100%
              )`,
              mask: "radial-gradient(farthest-side, transparent 60%, black 61%)",
              WebkitMask: "radial-gradient(farthest-side, transparent 60%, black 61%)",
            }}
          />
          {/* Inner text circle */}
          <div className="absolute inset-6 bg-background rounded-full flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold text-foreground">
              {count.toLocaleString()}
            </span>
            <span className="text-muted-foreground">{label}</span>
          </div>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {growth} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">{description}</div>
      </CardFooter> */}
    </Card>
  );
}
