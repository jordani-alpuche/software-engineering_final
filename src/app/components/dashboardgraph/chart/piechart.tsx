"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Import your server action to fetch data
import { getVisitorCountByYear } from "@/lib/serverActions/charts/charts";

// Define the structure for your chart data based on the server action's return
interface VisitorChartData {
  name: string; // Will be the year (e.g., "2023", "2024")
  value: number; // Will be the count of visitors for that year
  fill: string; // Color for the pie slice
}

// Define your chart configuration.
// We'll use 'year' as the key for the data, so the labels will be dynamic.
// Colors will be assigned based on index for now, but you can define specific colors per year if needed.
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  // We don't define specific years here as they are dynamic.
  // Colors will be applied dynamically using an array of predefined colors.
} satisfies ChartConfig;

// Define an array of colors to cycle through for your pie chart segments
const CHART_COLORS = [
  "hsl(var(--chart-1))", // Example from shadcn/ui chart colors
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  // Add more colors if you expect many years of data
];

export function VisitorCountPieChart() {
  const [chartData, setChartData] = React.useState<VisitorChartData[]>([]);
  const [totalVisitors, setTotalVisitors] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const result = await getVisitorCountByYear(); // Call your server action

      if (result.success && result.data) {
        // Map the fetched data to the format required by your chart component
        const formattedData: VisitorChartData[] = result.data.map((item, index) => ({
          name: String(item.year), // Year becomes the name/label
          value: item.count, // Count becomes the value
          fill: CHART_COLORS[index % CHART_COLORS.length], // Assign a color
        }));
        setChartData(formattedData);

        // Calculate the total visitors for the center label
        const sum = formattedData.reduce((acc, curr) => acc + curr.value, 0);
        setTotalVisitors(sum);
      } else {
        setError(result.message || "Failed to load visitor data.");
      }
      setLoading(false);
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on component mount

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Visitors by Year</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex justify-center items-center h-[250px]">
          <p>Loading visitor data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Visitors by Year</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex justify-center items-center h-[250px]">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Visitors by Year</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex justify-center items-center h-[250px]">
          <p className="text-gray-500">No visitor data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  // Determine the relevant date range for the card description
  const years = chartData.map(d => parseInt(d.name)).sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const cardDescriptionText = years.length > 1 ? `${minYear} - ${maxYear}` : `${minYear}`;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Visitors by Year</CardTitle>
        <CardDescription>{cardDescriptionText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value" // Use 'value' for the pie slice size
              nameKey="name" // Use 'name' (the year) for labels in tooltip/legend
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

    </Card>
  );
}