'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from
'@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from
'@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import { InventoryUpdate } from '@/types';

export default function InventoryTable() {
  const [inventory, setInventory] = useState<InventoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await apiService.getInventory();
      if (response.success && response.data) {
        setInventory(response.data);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (level: number) => {
    if (level < 10) return { label: 'Low', variant: 'destructive' as const };
    if (level < 50) return { label: 'Medium', variant: 'default' as const };
    return { label: 'High', variant: 'secondary' as const };
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading inventory...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Updates</CardTitle>
        <CardDescription>Real-time inventory levels and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const status = getStockStatus(item.stock_level);
              return (
                <TableRow key={item.id || item.product_id}>
                  <TableCell className="font-medium">{item.product_id}</TableCell>
                  <TableCell>{item.stock_level}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{item.location || 'N/A'}</TableCell>
                  <TableCell>{item.temperature ? `${item.temperature}°C` : 'N/A'}</TableCell>
                  <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
