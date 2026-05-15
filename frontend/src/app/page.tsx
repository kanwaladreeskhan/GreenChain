'use client';

import { useState } from 'react';
import { DeviceForm } from '@/components/DeviceForm';
import { StatusTracker } from '@/components/StatusTracker';
import { MarketplaceGallery } from '@/components/MarketplaceGallery';
import { Leaf, Recycle, Shield, TrendingUp, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'household' | 'repair'>('household');
  const [deviceId, setDeviceId] = useState('');
  const [showTracker, setShowTracker] = useState(false);

  const stats = [
    { icon: Recycle, label: 'Devices Recycled', value: '2,345+', change: '+23%' },
    { icon: TrendingUp, label: 'Components Sold', value: '8,921+', change: '+45%' },
    { icon: Users, label: 'Repair Shops', value: '156+', change: '+12%' },
    { icon: Award, label: 'Carbon Saved', value: '12,345 kg', change: '+67%' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs mb-4">
            <Leaf className="h-3.5 w-3.5" />
            <span>Circular Economy Initiative</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Transform <span className="text-emerald-600">E-Waste</span> into<br />
            Sustainable Value
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto mb-5">
            Pakistan's first circular economy platform connecting households with certified repair shops.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => setActiveTab('household')} className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md flex items-center gap-2 justify-center text-sm">
              <Recycle className="h-4 w-4" /> Sell Your E-Waste
            </button>
            <button onClick={() => setActiveTab('repair')} className="px-5 py-2 border border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition flex items-center gap-2 justify-center text-sm">
              <Shield className="h-4 w-4" /> Browse Components
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex p-2 bg-emerald-50 rounded-xl mb-2">
                  <stat.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="text-xs text-emerald-600 font-medium">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab('household')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'household' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For Households
            </button>
            <button
              onClick={() => setActiveTab('repair')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'repair' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For Repair Shops
            </button>
          </div>

          {/* Household Tab */}
          {activeTab === 'household' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">Submit Your Device</h2>
                <p className="text-gray-600 text-sm">
                  List your dead or unused electronics for recycling.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-3">
                  {['Free pickup', 'Data destruction', 'Earn rewards'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <DeviceForm userId={1} />
            </div>
          )}

          {/* Repair Shop Tab - Marketplace */}
          {activeTab === 'repair' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">Certified Original Components</h2>
                <p className="text-gray-600 text-sm">
                  Browse tested, certified components at 40-60% below market price
                </p>
              </div>
              <MarketplaceGallery />
            </div>
          )}
        </div>
      </section>

      {/* Track Status Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4 max-w-md">
          <h2 className="text-xl font-bold text-center mb-4">Track Your Device Status</h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter Device ID"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            />
            <button
              onClick={() => setShowTracker(true)}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
            >
              Track
            </button>
          </div>
          {showTracker && deviceId && (
            <div className="mt-4">
              <StatusTracker deviceId={parseInt(deviceId)} />
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-700 to-teal-700 py-10">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Ready to Make a Difference?</h2>
          <p className="text-emerald-100 text-sm mb-4 max-w-lg mx-auto">
            Join the circular economy revolution. Every device recycled is a step towards a sustainable future.
          </p>
          <button className="px-5 py-2 bg-white text-emerald-700 rounded-lg font-medium hover:shadow-lg transition inline-flex items-center gap-2 text-sm">
            Get Started Today <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}