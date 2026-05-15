import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { getAvailableComponents } from '@/lib/api';

interface Component {
  component_id: number;
  component_name: string;
  component_category: string;
  condition_score: number;
  calculated_price: number;
  quantity_available: number;
  manufacturer: string;
  is_certified: boolean;
}

export function ComponentsTable() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const data = await getAvailableComponents();
      setComponents(data);
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter(comp =>
    comp.component_name.toLowerCase().includes(search.toLowerCase()) ||
    comp.manufacturer?.toLowerCase().includes(search.toLowerCase())
  );

  const getConditionColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return <div className="text-center">Loading components...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Management - Dismantled Components</CardTitle>
        <div className="mt-4">
          <Input
            placeholder="Search by component name or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComponents.map((component) => (
              <TableRow key={component.component_id}>
                <TableCell className="font-medium">{component.component_name}</TableCell>
                <TableCell>{component.component_category || 'N/A'}</TableCell>
                <TableCell>{component.manufacturer || 'Generic'}</TableCell>
                <TableCell>
                  <Badge className={getConditionColor(component.condition_score)}>
                    Score: {component.condition_score}/10
                  </Badge>
                </TableCell>
                <TableCell>${component.calculated_price.toFixed(2)}</TableCell>
                <TableCell>{component.quantity_available}</TableCell>
                <TableCell>
                  {component.is_certified ? (
                    <Badge className="bg-green-100 text-green-800">Certified</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}