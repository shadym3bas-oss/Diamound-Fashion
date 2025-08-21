
"use client"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type ChartData = {
  month: string;
  total: number;
}

export function MonthlyRevenueChart({ data }: { data: ChartData[] }) {
  // Format the month to a more readable format e.g. "Jan", "Feb"
  const formattedData = data.map(item => ({
    ...item,
    // The RPC returns a string like "2023-10". We need to make it a valid date string
    // for the Date constructor by appending a day, e.g., "2023-10-01".
    month: new Date(item.month + '-01').toLocaleString('ar-EG', { month: 'short' })
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formattedData}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dx={0}
          dy={10}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `ج.م ${value / 1000} ألف`}
          dx={-10}
        />
        <Tooltip 
            cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                direction: 'rtl',
            }}
             formatter={(value: number) => [new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(value), 'الإيرادات']}
             labelStyle={{ fontWeight: 'bold' }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
