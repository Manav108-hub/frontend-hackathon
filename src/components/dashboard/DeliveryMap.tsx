'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from
'@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import { DeliveryStatus } from '@/types';

export default function DeliveryMap() {
  const [deliveries, setDeliveries] = useState<DeliveryStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const response = await apiService.getDeliveries();
      if (response.success && response.data) {
        setDeliveries(response.data);
      }
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'picked_up': return 'default';
      case 'on_the_way': return 'default';
      case 'delivered': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading deliveries...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Tracking</CardTitle>
        <CardDescription>Real-time delivery status and locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id || delivery.order_id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Order: {delivery.order_id}</h3>
                <Badge variant={getStatusVariant(delivery.status)}>{delivery.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Location:</strong> {delivery.vehicle_lat.toFixed(4)},
{delivery.vehicle_lng.toFixed(4)}
                </div>
                <div>
                  <strong>Driver:</strong> {delivery.driver_id || 'N/A'}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(delivery.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong>ETA:</strong> {delivery.estimated_arrival || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
