'use client';

import React, { useState, useEffect } from 'react';
import { getDeviceStatus } from '@/lib/api';

interface StatusTrackerProps {
  deviceId: number;
}

export function StatusTracker({ deviceId }: StatusTrackerProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [deviceId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getDeviceStatus(deviceId);
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('Device not found');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'pending', label: 'Pending', icon: '📋', color: 'bg-yellow-500' },
    { key: 'collected', label: 'Collected', icon: '🚚', color: 'bg-blue-500' },
    { key: 'evaluated', label: 'Evaluated', icon: '🔍', color: 'bg-purple-500' },
    { key: 'dismantled', label: 'Dismantled', icon: '♻️', color: 'bg-emerald-500' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status?.status);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-500">Device not found. Please check the ID and try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <h3 className="text-white font-semibold">{status.device_name}</h3>
        <p className="text-emerald-100 text-sm">Tracking ID: #{deviceId}</p>
      </div>

      <div className="p-6">
        {/* Progress Steps */}
        <div className="relative mb-8">
          <div className="flex justify-between">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
              return (
                <div key={step.key} className="flex-1 text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all
                    ${isCompleted ? step.color + ' text-white' : 'bg-gray-200 text-gray-400'}
                    ${isCurrent ? 'ring-4 ring-emerald-200 scale-110' : ''}`}>
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div className="h-full bg-emerald-500 transition-all duration-500" 
                 style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} />
          </div>
        </div>

        {/* Device Details */}
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Device Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium">{status.device_type || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Brand:</span>
              <p className="font-medium">{status.brand || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Submitted:</span>
              <p className="font-medium">{new Date(status.submission_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-sm text-emerald-800">
            {status.status === 'pending' && '📋 Your device is pending collection. We will contact you within 24 hours.'}
            {status.status === 'collected' && '🚚 Your device has been collected and is being evaluated.'}
            {status.status === 'evaluated' && '✅ Evaluation complete! Your device is being dismantled for reusable components.'}
            {status.status === 'dismantled' && '♻️ Device successfully recycled! Thank you for your contribution.'}
          </p>
        </div>
      </div>
    </div>
  );
}