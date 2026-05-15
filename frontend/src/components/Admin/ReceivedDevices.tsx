'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_URL = 'http://localhost:8000/api';

interface Device {
  device_id: number;
  device_name: string;
  device_type: string;
  brand: string;
  model: string;
  status: string;
  submission_date: string;
}

interface Component {
  component_name: string;
  component_category: string;
  condition_score: number;
  condition_grade: string;
  market_price: number;
  calculated_price: number;
  quantity_available: number;
  manufacturer: string;
  specifications: string;
}

export function ReceivedDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [components, setComponents] = useState<Component[]>([{
    component_name: '', component_category: '', condition_score: 5, condition_grade: 'A-Grade',
    market_price: 0, calculated_price: 0, quantity_available: 1, manufacturer: '', specifications: ''
  }]);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/received-devices`);
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDismantled = async (deviceId: number) => {
    try {
      const response = await fetch(`${API_URL}/admin/mark-dismantled/${deviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(components),
      });
      
      if (response.ok) {
        alert('Device marked as dismantled!');
        fetchDevices();
        setSelectedDevice(null);
        setComponents([{
          component_name: '', component_category: '', condition_score: 5, condition_grade: 'A-Grade',
          market_price: 0, calculated_price: 0, quantity_available: 1, manufacturer: '', specifications: ''
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to dismantle device');
    }
  };

  const addComponentField = () => {
    setComponents([...components, {
      component_name: '', component_category: '', condition_score: 5, condition_grade: 'A-Grade',
      market_price: 0, calculated_price: 0, quantity_available: 1, manufacturer: '', specifications: ''
    }]);
  };

  const updateComponent = (index: number, field: string, value: any) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate price (60% of market price)
    if (field === 'market_price') {
      updated[index].calculated_price = value * 0.6;
    }
    
    setComponents(updated);
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      collected: 'bg-blue-100 text-blue-800',
      evaluated: 'bg-purple-100 text-purple-800',
      dismantled: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  if (loading) return <div>Loading devices...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Received Devices from Households</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Device Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.device_id}>
                <TableCell>{device.device_id}</TableCell>
                <TableCell>{device.device_name}</TableCell>
                <TableCell>{device.brand || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(device.status)}</TableCell>
                <TableCell>{new Date(device.submission_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedDevice(device)}
                        disabled={device.status === 'dismantled'}
                      >
                        Mark as Dismantled
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Dismantle Device: {selectedDevice?.device_name}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded">
                          <h4 className="font-semibold">Device Info</h4>
                          <p>Brand: {selectedDevice?.brand} | Model: {selectedDevice?.model}</p>
                          <p>Type: {selectedDevice?.device_type}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Components Extracted</h4>
                            <Button type="button" size="sm" onClick={addComponentField}>+ Add Component</Button>
                          </div>
                          
                          {components.map((comp, idx) => (
                            <div key={idx} className="border p-4 rounded space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Component Name</Label>
                                  <Input 
                                    value={comp.component_name}
                                    onChange={(e) => updateComponent(idx, 'component_name', e.target.value)}
                                    placeholder="e.g., iPhone Screen"
                                  />
                                </div>
                                <div>
                                  <Label>Category</Label>
                                  <Select value={comp.component_category} onValueChange={(v) => updateComponent(idx, 'component_category', v)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Display">Display</SelectItem>
                                      <SelectItem value="Battery">Battery</SelectItem>
                                      <SelectItem value="Camera">Camera</SelectItem>
                                      <SelectItem value="Motherboard">Motherboard</SelectItem>
                                      <SelectItem value="Memory">Memory</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <Label>Condition Score (1-10)</Label>
                                  <Input 
                                    type="number" min="1" max="10"
                                    value={comp.condition_score}
                                    onChange={(e) => updateComponent(idx, 'condition_score', parseInt(e.target.value))}
                                  />
                                </div>
                                <div>
                                  <Label>Grade</Label>
                                  <Select value={comp.condition_grade} onValueChange={(v) => updateComponent(idx, 'condition_grade', v)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="S-Grade">S-Grade (Like New)</SelectItem>
                                      <SelectItem value="A-Grade">A-Grade (Good)</SelectItem>
                                      <SelectItem value="B-Grade">B-Grade (Fair)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Manufacturer</Label>
                                  <Input 
                                    value={comp.manufacturer}
                                    onChange={(e) => updateComponent(idx, 'manufacturer', e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Market Price ($)</Label>
                                  <Input 
                                    type="number"
                                    value={comp.market_price}
                                    onChange={(e) => updateComponent(idx, 'market_price', parseFloat(e.target.value))}
                                  />
                                </div>
                                <div>
                                  <Label>Resale Price ($) - Auto: 60%</Label>
                                  <Input 
                                    type="number"
                                    value={comp.calculated_price}
                                    onChange={(e) => updateComponent(idx, 'calculated_price', parseFloat(e.target.value))}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Quantity</Label>
                                  <Input 
                                    type="number"
                                    value={comp.quantity_available}
                                    onChange={(e) => updateComponent(idx, 'quantity_available', parseInt(e.target.value))}
                                  />
                                </div>
                                <div>
                                  <Label>Specifications</Label>
                                  <Textarea 
                                    value={comp.specifications}
                                    onChange={(e) => updateComponent(idx, 'specifications', e.target.value)}
                                    placeholder="Details, compatibility, etc."
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button onClick={() => handleMarkDismantled(selectedDevice!.device_id)}>
                          Confirm Dismantle & Add to Inventory
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}