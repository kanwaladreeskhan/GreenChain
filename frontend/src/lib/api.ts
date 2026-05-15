const API_URL = 'http://localhost:8000/api';

export async function submitDevice(deviceData: any) {
  try {
    console.log('Submitting device:', deviceData);
    const response = await fetch(`${API_URL}/devices/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: deviceData.user_id || 1,
        device_name: deviceData.device_name,
        device_type: deviceData.device_type,
        brand: deviceData.brand,
        model: deviceData.model,
        description: deviceData.description,
        image_url: deviceData.image_url || ''
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Submission failed');
    }
    
    const data = await response.json();
    console.log('Submit success:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getDeviceStatus(deviceId: number) {
  const response = await fetch(`${API_URL}/devices/status/${deviceId}`);
  return response.json();
}

export async function getAvailableComponents() {
  const response = await fetch(`${API_URL}/components/available`);
  return response.json();
}

export async function createOrder(orderData: any) {
  const response = await fetch(`${API_URL}/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return response.json();
}