'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL = 'http://localhost:8000/api';

interface Order {
  order_id: number;
  component_name?: string;
  quantity: number;
  total_price: number;
  order_status: string;
  order_date: string;
  repair_shop_id: number;
}

export function PendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/orders/pending`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (orderId: number) => {
    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/ship`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: 'shipped',
          tracking_number: trackingNumber || `TRK${Date.now()}`
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Order shipped! Invoice: ${result.invoice_number}`);
        fetchOrders();
        setSelectedOrder(null);
        setTrackingNumber('');
      }
    } catch (error) {
      console.error('Error shipping order:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Orders from Repair Shops</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Shop ID</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell>{order.order_id}</TableCell>
                <TableCell>{order.repair_shop_id}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>${order.total_price}</TableCell>
                <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setSelectedOrder(order)}>Process Order</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ship Order #{order.order_id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Tracking Number</Label>
                          <Input
                            placeholder="Enter tracking number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                          <p><strong>Quantity:</strong> {order.quantity}</p>
                          <p><strong>Total:</strong> ${order.total_price}</p>
                          <p><strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
                        </div>
                        <Button onClick={() => handleShipOrder(order.order_id)} className="w-full">
                          Generate Invoice & Mark as Shipped
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">No pending orders!</div>
        )}
      </CardContent>
    </Card>
  );
}