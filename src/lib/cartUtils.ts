import { CartItem } from '@/contexts/MultiServiceCartContext';

// Service Summary Functions
export const getMovingSummary = (movingData: any) => {
  if (!movingData) return 'No data available';
  
  const roomCount = movingData.rooms?.length || 0;
  const itemCount = Object.values(movingData.items || {}).reduce((sum: number, count: any) => sum + (count || 0), 0);
  const fromAddress = movingData.addresses?.from || 'Address not specified';
  const toAddress = movingData.addresses?.to || 'Address not specified';
  
  return {
    roomCount,
    itemCount,
    fromAddress,
    toAddress,
    summary: `${roomCount} rooms, ${itemCount} items`
  };
};

export const getDisposalSummary = (disposalData: any) => {
  if (!disposalData) return 'No data available';
  
  const serviceType = disposalData.serviceType || 'General';
  const itemCount = disposalData.items?.length || 0;
  const pickupAddress = disposalData.pickupAddress?.fullAddress || 'Address not specified';
  
  return {
    serviceType,
    itemCount,
    pickupAddress,
    summary: `${serviceType} disposal, ${itemCount} items`
  };
};

export const getTransportSummary = (transportData: any) => {
  if (!transportData) return 'No data available';
  
  const serviceType = transportData.serviceType || 'General';
  const itemCount = transportData.items?.length || 0;
  const pickupLocation = transportData.pickupLocation?.fullAddress || 'Location not specified';
  const dropoffLocation = transportData.dropoffLocation?.fullAddress || 'Location not specified';
  
  return {
    serviceType,
    itemCount,
    pickupLocation,
    dropoffLocation,
    summary: `${serviceType} transport, ${itemCount} items`
  };
};

// Cart Item Formatting
export const formatCartItemTitle = (cartItem: CartItem) => {
  const serviceNames = {
    moving: 'Moving Service',
    disposal: 'Disposal Service',
    transport: 'Transport Service',
  };
  
  if (cartItem.serviceType) {
    return `${serviceNames[cartItem.service]} - ${cartItem.serviceType}`;
  }
  return serviceNames[cartItem.service];
};

export const formatCartItemDescription = (cartItem: CartItem) => {
  const payload = cartItem.payload;
  
  switch (cartItem.service) {
    case 'moving':
      if (payload.rooms && payload.rooms.length > 0) {
        return `${payload.rooms.length} rooms selected`;
      }
      return 'Moving service configured';
    case 'disposal':
      if (payload.serviceType) {
        return `${payload.serviceType} disposal`;
      }
      return 'Disposal service configured';
    case 'transport':
      if (payload.serviceType) {
        return `${payload.serviceType} transport`;
      }
      return 'Transport service configured';
    default:
      return 'Service configured';
  }
};

export const getServiceIcon = (service: string) => {
  const icons = {
    moving: '🏠',
    disposal: '📦',
    transport: '🚚',
  };
  return icons[service as keyof typeof icons] || '🛒';
};

export const getServiceColor = (service: string) => {
  const colors = {
    moving: 'bg-blue-100 text-blue-800',
    disposal: 'bg-green-100 text-green-800',
    transport: 'bg-purple-100 text-purple-800',
  };
  return colors[service as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// Price Calculation Helpers (Placeholder functions for future pricing)
export const calculateMovingEstimate = (movingData: any): number => {
  // TODO: Implement actual pricing logic
  return 0;
};

export const calculateDisposalEstimate = (disposalData: any): number => {
  // TODO: Implement actual pricing logic
  return 0;
};

export const calculateTransportEstimate = (transportData: any): number => {
  // TODO: Implement actual pricing logic
  return 0;
};

export const getTotalCartValue = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + (item.estimatedPrice || 0), 0);
};

// Validation Functions
export const validateCartItem = (cartItem: CartItem): boolean => {
  return !!(
    cartItem.id &&
    cartItem.service &&
    cartItem.selectionType &&
    cartItem.payload &&
    cartItem.createdAt
  );
};

export const isDuplicateService = (cartItems: CartItem[], newItem: Omit<CartItem, 'id' | 'createdAt'>): boolean => {
  return cartItems.some(item => 
    item.service === newItem.service &&
    item.serviceType === newItem.serviceType &&
    item.selectionType === newItem.selectionType
  );
};

export const canAddToCart = (service: string, payload: any): boolean => {
  if (!service || !payload) return false;
  
  switch (service) {
    case 'moving':
      return !!(payload.rooms && payload.rooms.length > 0);
    case 'disposal':
      return !!(payload.serviceType && payload.items && payload.items.length > 0);
    case 'transport':
      return !!(payload.serviceType && payload.items && payload.items.length > 0);
    default:
      return false;
  }
};

// Data Transformation
export const serializeCartForStorage = (cartItems: CartItem[]): string => {
  return JSON.stringify(cartItems.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString()
  })));
};

export const deserializeCartFromStorage = (data: string): CartItem[] => {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  } catch (error) {
    console.error('Failed to deserialize cart data:', error);
    return [];
  }
};

export const sanitizeServiceData = (payload: any): any => {
  // Remove sensitive data before cart storage
  const { password, token, apiKey, ...sanitized } = payload;
  return sanitized;
};

// Cart Analytics
export const getCartStats = (cartItems: CartItem[]) => {
  const serviceCounts = cartItems.reduce((acc, item) => {
    acc[item.service] = (acc[item.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const selectionTypeCounts = cartItems.reduce((acc, item) => {
    acc[item.selectionType] = (acc[item.selectionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalItems: cartItems.length,
    serviceCounts,
    selectionTypeCounts,
    totalValue: getTotalCartValue(cartItems),
    hasPricing: cartItems.some(item => item.estimatedPrice && item.estimatedPrice > 0)
  };
};
