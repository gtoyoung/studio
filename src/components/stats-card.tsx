"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Poll } from "@/lib/types";
import { Users, CheckCircle, XCircle } from "lucide-react";

export function StatsCard({ poll }: { poll: Poll }) {
  const chartData = [
    { name: "Joining", value: poll.joining, fill: "hsl(var(--chart-1))" },
    { name: "Not Joining", value: poll.notJoining, fill: "hsl(var(--chart-2))" },
  ];

  const chartConfig = {
    joining: {
      label: "Joining",
      color: "hsl(var(--chart-1))",
    },
    notJoining: {
      label: "Not Joining",
      color: "hsl(var(--chart-2))",
    },
  };

  const totalVotes = poll.joining + poll.notJoining;

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          Today's Turnout
        </CardTitle>
        <CardDescription>
          {totalVotes} people have responded so far.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center gap-6">
        {totalVotes > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="min-h-[150px] w-full aspect-square max-w-[250px]"
          >
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel indicator="dot" />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                strokeWidth={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <Users className="w-12 h-12 mb-2" />
            <p>No votes yet!</p>
          </div>
        )}

        <div className="w-full flex justify-around text-center">
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-2xl font-bold">{poll.joining}</span>
            <span className="text-sm text-muted-foreground">Joining</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <XCircle className="w-6 h-6 text-red-500" />
            <span className="text-2xl font-bold">{poll.notJoining}</span>
            <span className="text-sm text-muted-foreground">Not Joining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
