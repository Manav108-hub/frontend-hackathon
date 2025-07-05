'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from
'@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from
'@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
BarChart, Bar } from 'recharts';
import { apiService } from '@/services/api';
import { SalesData } from '@/types';

export default function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    loadSalesData();
  }, [days]);

  const loadSalesData = async () => {
    try {
      const response = await apiService.getSalesAnalytics(days);
      if (response.success && response.data) {
        setSalesData(response.data);
      }
    } catch (error) {
      console.error('Failed to load sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = () => {
    const grouped = salesData.reduce((acc, item) => {
      const date = item.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, quantity: 0 };
      }
      acc[date].revenue += item.price * item.quantity;
      acc[date].quantity += item.quantity;
      return acc;
    }, {} as Record<string, { date: string; revenue: number; quantity: number }>);

    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new
Date(b.date).getTime());
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading sales data...</div>;
  }

  const chartData = processChartData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Analytics</CardTitle>
        <CardDescription>Revenue and quantity trends over time</CardDescription>
        <div className="flex space-x-4">
          <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8"
name="Revenue ($)" />
                <Line yAxisId="right" type="monotone" dataKey="quantity" stroke="#82ca9d"
name="Quantity" />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="quantity" fill="#82ca9d" name="Quantity" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
