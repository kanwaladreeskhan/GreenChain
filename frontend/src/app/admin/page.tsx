'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingCart,
  TrendingUp,
  Recycle,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { DashboardStats } from '@/components/Admin/DashboardStats';
import { ReceivedDevices } from '@/components/Admin/ReceivedDevices';
import { InventoryTable } from '@/components/Admin/InventoryTable';
import { PendingOrders } from '@/components/Admin/PendingOrders';

const tabs = [
  { id: 'dashboard', label: 'Analytics', icon: TrendingUp },
  { id: 'devices', label: 'Received Devices', icon: Recycle },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'orders', label: 'Pending Orders', icon: ShoppingCart },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Manage e-waste transformation & inventory</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-700 font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Tabs */}
          <div className="flex gap-1 border-b border-gray-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <DashboardStats />}
        {activeTab === 'devices' && <ReceivedDevices />}
        {activeTab === 'inventory' && <InventoryTable />}
        {activeTab === 'orders' && <PendingOrders />}
      </div>
    </div>
  );
}