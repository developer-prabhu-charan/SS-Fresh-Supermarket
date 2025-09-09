import { useAuth } from '@/context/AuthContext';

interface TrackOutOfStockOptions {
  searchTerm: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const trackOutOfStockSearch = async ({ 
  searchTerm, 
  onSuccess, 
  onError 
}: TrackOutOfStockOptions) => {
  try {
    // Get auth token if user is logged in
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('http://localhost:5000/api/out-of-stock', {
      method: 'POST',
      headers,
      body: JSON.stringify({ searchTerm: searchTerm.trim() })
    });

    if (response.ok) {
      console.log(`Out-of-stock search tracked: "${searchTerm}"`);
      onSuccess?.();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to track search');
    }
  } catch (error) {
    console.error('Failed to track out-of-stock search:', error);
    onError?.(error instanceof Error ? error.message : 'Unknown error');
  }
};

// Hook for easier usage in components
export const useTrackOutOfStock = () => {
  const { token } = useAuth();

  const trackSearch = async (searchTerm: string) => {
    await trackOutOfStockSearch({
      searchTerm,
      onSuccess: () => {
        console.log(`Successfully tracked search: "${searchTerm}"`);
      },
      onError: (error) => {
        console.warn(`Failed to track search "${searchTerm}":`, error);
      }
    });
  };

  return { trackSearch };
};
