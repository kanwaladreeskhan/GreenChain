'use client';

import React, { useEffect, useState } from 'react';
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

export function MarketplaceGallery() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const data = await getAvailableComponents();
      setComponents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching components:', error);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter(comp => {
    if (search && !comp.component_name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (category && comp.component_category !== category) {
      return false;
    }
    return true;
  });

  const categories = ['all', 'Display', 'Battery', 'Camera', 'Motherboard', 'Memory', 'CPU'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={fetchComponents}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Components Grid */}
      {filteredComponents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500">No components available</p>
          <p className="text-sm text-gray-400 mt-1">Check back later for new inventory</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComponents.map((component) => (
            <div key={component.component_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">{component.component_name}</h3>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">{component.component_category || 'General'}</span>
                  {component.is_certified && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Certified</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Manufacturer:</span>
                  <span className="font-medium text-gray-900">{component.manufacturer || 'Generic'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Condition:</span>
                  <span className="font-medium text-emerald-600">{component.condition_score}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity:</span>
                  <span className={`font-medium ${component.quantity_available <= 3 ? 'text-red-500' : 'text-gray-900'}`}>
                    {component.quantity_available} units
                  </span>
                </div>
                <div className="border-t border-gray-100 my-2"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">${component.calculated_price}</div>
                  <div className="text-xs text-gray-400 line-through">${(component.calculated_price * 2).toFixed(2)} MRP</div>
                  <div className="text-xs text-green-600 mt-1">50% off</div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => alert(`Added ${component.component_name} to cart!`)}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="text-center text-sm text-gray-500 mt-6">
        Showing {filteredComponents.length} of {components.length} components
      </div>
    </div>
  );
}