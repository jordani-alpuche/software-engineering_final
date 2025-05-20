import { getTotalUnActiveVisitors } from "@/lib/serverActions/charts/charts";

export async function GET() {
  try {
    const data = await getTotalUnActiveVisitors();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch data", { status: 500 });
  }
}