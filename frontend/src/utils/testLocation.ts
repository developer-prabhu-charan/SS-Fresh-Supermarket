// Test script to verify location functionality
// This can be run in the browser console to test the location capture

export const testLocationCapture = async () => {
  console.log('Testing location capture...');
  
  try {
    // Test geolocation API
    if (navigator.geolocation) {
      console.log('Geolocation API is available');
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      console.log('Geolocation success:', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    } else {
      console.log('Geolocation API is not available');
    }
  } catch (error) {
    console.log('Geolocation failed:', error);
  }
  
  try {
    // Test IP-based location
    console.log('Testing IP-based location...');
    
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    console.log('IP location success:', {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      region: data.region,
      country: data.country_name
    });
  } catch (error) {
    console.log('IP location failed:', error);
    
    // Try fallback
    try {
      const fallbackResponse = await fetch('https://ipinfo.io/json');
      const fallbackData = await fallbackResponse.json();
      
      console.log('Fallback IP location success:', fallbackData);
    } catch (fallbackError) {
      console.log('Fallback IP location also failed:', fallbackError);
    }
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testLocationCapture = testLocationCapture;
}
