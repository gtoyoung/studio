"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { ReportData } from "@/lib/types";
import { TrendingUp, Award, CalendarDays } from "lucide-react";

export function ReportsCard({ reports }: { reports: ReportData }) {
  const chartConfig = {
    joining: {
      label: "Joining",
      color: "hsl(var(--chart-1))",
    },
    notJoining: {
        label: "Not Joining",
        color: "hsl(var(--chart-2))",
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Participation Insights
        </CardTitle>
        <CardDescription>Based on historical data from the past week.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <Card className="p-4 bg-card-foreground/5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                Avg. Participation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-2xl font-bold">{reports.averageParticipation}%</p>
            </CardContent>
          </Card>
          <Card className="p-4 bg-card-foreground/5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                Popular Day
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-2xl font-bold">{reports.mostPopularDay.day}</p>
            </CardContent>
          </Card>
        </div>
        
        <div>
            <h4 className="text-sm font-medium mb-2">Weekly Breakdown</h4>
             <ChartContainer config={chartConfig} className="w-full" style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={reports.dailyBreakdown} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                        />
                         <YAxis 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                         />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="joining" fill="var(--color-joining)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
