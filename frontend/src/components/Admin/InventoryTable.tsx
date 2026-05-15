'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Search } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

interface Component {
  component_id: number;
  component_name: string;
  component_category: string;
  condition_score: number;
  condition_grade: string;
  calculated_price: number;
  quantity_available: number;
  manufacturer: string;
  is_certified: boolean;
}

export function InventoryTable() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/inventory?search=${search}`);
      const data = await response.json();
      setComponents(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this component?')) {
      try {
        await fetch(`${API_URL}/admin/inventory/${id}`, { method: 'DELETE' });
        fetchInventory();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleUpdate = async (component: Component) => {
    try {
      await fetch(`${API_URL}/admin/inventory/${component.component_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(component),
      });
      fetchInventory();
      setEditingComponent(null);
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const getConditionColor = (score: number, grade: string) => {
    if (grade === 'S-Grade') return 'bg-green-100 text-green-800';
    if (grade === 'A-Grade') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) return <div>Loading inventory...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Component Inventory</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button onClick={fetchInventory}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {components.map((comp) => (
              <TableRow key={comp.component_id}>
                <TableCell>{comp.component_id}</TableCell>
                <TableCell className="font-medium">{comp.component_name}</TableCell>
                <TableCell>{comp.component_category}</TableCell>
                <TableCell>{comp.condition_score}/10</TableCell>
                <TableCell>
                  <Badge className={getConditionColor(comp.condition_score, comp.condition_grade)}>
                    {comp.condition_grade}
                  </Badge>
                </TableCell>
                <TableCell>${comp.calculated_price}</TableCell>
                <TableCell>
                  {comp.quantity_available <= 5 ? (
                    <Badge variant="destructive">{comp.quantity_available} left</Badge>
                  ) : (
                    comp.quantity_available
                  )}
                </TableCell>
                <TableCell>{comp.manufacturer}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setEditingComponent(comp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Component</DialogTitle>
                        </DialogHeader>
                        {editingComponent && (
                          <div className="space-y-4">
                            <div>
                              <Label>Component Name</Label>
                              <Input
                                value={editingComponent.component_name}
                                onChange={(e) => setEditingComponent({...editingComponent, component_name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label>Price ($)</Label>
                              <Input
                                type="number"
                                value={editingComponent.calculated_price}
                                onChange={(e) => setEditingComponent({...editingComponent, calculated_price: parseFloat(e.target.value)})}
                              />
                            </div>
                            <div>
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                value={editingComponent.quantity_available}
                                onChange={(e) => setEditingComponent({...editingComponent, quantity_available: parseInt(e.target.value)})}
                              />
                            </div>
                            <div>
                              <Label>Condition Score (1-10)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={editingComponent.condition_score}
                                onChange={(e) => setEditingComponent({...editingComponent, condition_score: parseInt(e.target.value)})}
                              />
                            </div>
                            <Button onClick={() => handleUpdate(editingComponent)}>Save Changes</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(comp.component_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}