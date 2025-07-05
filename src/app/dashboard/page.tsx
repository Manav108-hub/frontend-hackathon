'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Header from '@/components/layout/Header';
import DashboardNav from '@/components/dashboard/DashboardNav';
import InventoryTable from '@/components/dashboard/InventoryTable';
import OrdersTable from '@/components/dashboard/OrdersTable';
import DeliveryMap from '@/components/dashboard/DeliveryMap';
import SalesChart from '@/components/dashboard/SalesChart';
import AIAnalyticsDashboard from '@/components/dashboard/AIAnalyticsDashboard';
import SalesForecastChart from '@/components/dashboard/SalesChart';
import { apiService } from '@/services/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [message, setMessage] = useState('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Fetch dashboard stats
    fetchDashboardStats();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await apiService.getDashboardStats();
      if (response.success && response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = async () => {
    try {
      const response = await apiService.startSimulation();
      if (response.success) {
        setMessage('Simulation started successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to start simulation:', error);
      setMessage('Failed to start simulation');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSeedData = async () => {
    try {
      const response = await apiService.seedData();
      if (response.success) {
        setMessage('Sample data generated successfully!');
        setTimeout(() => setMessage(''), 3000);
        // Refresh dashboard stats after seeding
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Failed to seed data:', error);
      setMessage('Failed to seed data');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryTable />;
      case 'orders':
        return <OrdersTable />;
      case 'deliveries':
        return <DeliveryMap />;
      case 'analytics':
        return <SalesChart />;
      case 'ai-analytics':
        return <AIAnalyticsDashboard />;
      case 'forecast':
        return <SalesForecastChart />;
      default:
        return <InventoryTable />;
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStartSimulation={handleStartSimulation}
        onSeedData={handleSeedData}
      />

      {message && (
        <div className="p-4">
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardStats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="p-4">
        {renderContent()}
      </main>
    </div>
  );
}
