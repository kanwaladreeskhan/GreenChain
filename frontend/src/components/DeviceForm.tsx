'use client';

import React, { useState } from 'react';
import { submitDevice } from '@/lib/api';

export function DeviceForm({ userId = 1 }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: '',
    brand: '',
    model: '',
    description: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      await submitDevice({
        ...formData,
        user_id: userId,
        image_url: imageUrl,
      });
      
      alert('✅ Device submitted successfully!');
      setFormData({ device_name: '', device_type: '', brand: '', model: '', description: '' });
      setImagePreview(null);
      setImageFile(null);
    } catch (error) {
      alert('❌ Failed to submit device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert('Image must be less than 500KB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const deviceTypes = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Monitor', 'Printer', 'Other'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Form Header */}
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Submit E-Waste Device</h3>
        <p className="text-sm text-gray-500 mt-0.5">Fill details of your electronic device</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Row 1: Device Name - Full width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Device Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.device_name}
            onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none text-sm"
            placeholder="e.g., iPhone 12, Dell XPS 13"
          />
        </div>

        {/* Row 2: Device Type + Brand - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
            <select
              value={formData.device_type}
              onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none bg-white text-sm"
            >
              <option value="">Select type</option>
              {deviceTypes.map(type => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none text-sm"
              placeholder="Apple, Samsung, Dell"
            />
          </div>
        </div>

        {/* Row 3: Model + (empty/placeholder for alignment) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none text-sm"
              placeholder="Model number"
            />
          </div>
          <div>
            {/* Empty div for alignment */}
          </div>
        </div>

        {/* Row 4: Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition Details</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none resize-none text-sm"
            placeholder="Describe the device condition, what's working, what's not..."
          />
        </div>

        {/* Row 5: Image Upload - Compact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Device Image <span className="text-gray-400 text-xs">(Optional)</span></label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-emerald-400 transition cursor-pointer bg-gray-50"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="flex items-center justify-center gap-3">
                <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                <span className="text-sm text-gray-600">Image uploaded</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">Click to upload image</span>
                <span className="text-xs text-gray-400">(max 500KB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 6: Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Device'
          )}
        </button>
      </form>
    </div>
  );
}