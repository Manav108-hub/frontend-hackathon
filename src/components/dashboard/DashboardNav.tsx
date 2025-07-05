'use client';
import { Button } from '@/components/ui/button';
import { Package, Truck, BarChart3, ShoppingCart, Play, Database, Brain, TrendingUp } from 'lucide-react';

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStartSimulation: () => void;
  onSeedData: () => void;
}

export default function DashboardNav({ activeTab, onTabChange, onStartSimulation, onSeedData }: DashboardNavProps) {
  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'deliveries', label: 'Deliveries', icon: Truck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-analytics', label: 'AI Analytics', icon: Brain },
    // { id: 'forecast', label: 'Sales Forecast', icon: TrendingUp },
  ];

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <nav className="flex space-x-2 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'ghost'}
            onClick={() => onTabChange(id)}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </nav>
      <div className="flex space-x-2">
        <Button onClick={onSeedData} variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          Seed Data
        </Button>
        <Button onClick={onStartSimulation} variant="outline" size="sm">
          <Play className="h-4 w-4 mr-2" />
          Start Simulation
        </Button>
      </div>
    </div>
  );
}
