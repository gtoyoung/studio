"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Poll } from "@/lib/types";
import { Users, CheckCircle, XCircle, CalendarX } from "lucide-react";

export function StatsCard({ poll }: { poll: Poll }) {
  const chartData = [
    { name: "참석", value: poll.joining, fill: "hsl(var(--chart-1))" },
    { name: "불참", value: poll.notJoining, fill: "hsl(var(--chart-2))" },
  ];

  const chartConfig = {
    joining: {
      label: "참석",
      color: "hsl(var(--chart-1))",
    },
    notJoining: {
      label: "불참",
      color: "hsl(var(--chart-2))",
    },
  };

  const totalVotes = poll.joining + poll.notJoining;
  const today = new Date(poll.date);
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const description = isWeekend 
    ? "주말에는 투표 데이터가 없습니다."
    : `현재까지 ${totalVotes}명이 응답했습니다.`;

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          오늘의 참여율
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center gap-6">
        {isWeekend ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <CalendarX className="w-12 h-12 mb-2" />
            <p>주말은 쉽니다!</p>
          </div>
        ) : totalVotes > 0 ? (
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
            <p>아직 투표가 없습니다!</p>
          </div>
        )}

        {!isWeekend && (
            <div className="w-full flex justify-around text-center">
            <div className="flex flex-col items-center gap-1">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-2xl font-bold">{poll.joining}</span>
                <span className="text-sm text-muted-foreground">참석</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <XCircle className="w-6 h-6 text-red-500" />
                <span className="text-2xl font-bold">{poll.notJoining}</span>
                <span className="text-sm text-muted-foreground">불참</span>
            </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
