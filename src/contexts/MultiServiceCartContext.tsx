import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CartItem {
  id: string;
  service: 'moving' | 'disposal' | 'transport';
  serviceType: string | null;
  selectionType: 'quote' | 'supplier';
  payload: any;
  estimatedPrice?: number;
  createdAt: Date;
}

interface MultiServiceCartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'createdAt'> }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; updates: Partial<CartItem> } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean };

const initialState: MultiServiceCartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
};

function cartReducer(state: MultiServiceCartState, action: CartAction): MultiServiceCartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: CartItem = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      const newItems = [...state.items, newItem];
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
      };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.itemId);
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
      };
    }
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, ...action.payload.updates }
          : item
      );
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
      };
    }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
      };
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };
    default:
      return state;
  }
}

interface MultiServiceCartContextType {
  state: MultiServiceCartState;
  addItem: (service: CartItem['service'], serviceType: string | null, selectionType: CartItem['selectionType'], payload: any) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getItemsByService: (service: CartItem['service']) => CartItem[];
  getTotalEstimatedPrice: () => number;
}

const MultiServiceCartContext = createContext<MultiServiceCartContextType | undefined>(undefined);

export function MultiServiceCartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (service: CartItem['service'], serviceType: string | null, selectionType: CartItem['selectionType'], payload: any) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { service, serviceType, selectionType, payload },
    });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateItem = (itemId: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { itemId, updates } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'SET_CART_OPEN', payload: true });
  };

  const closeCart = () => {
    dispatch({ type: 'SET_CART_OPEN', payload: false });
  };

  const getItemsByService = (service: CartItem['service']) => {
    return state.items.filter(item => item.service === service);
  };

  const getTotalEstimatedPrice = () => {
    return state.items.reduce((total, item) => total + (item.estimatedPrice || 0), 0);
  };

  const value: MultiServiceCartContextType = {
    state,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    openCart,
    closeCart,
    getItemsByService,
    getTotalEstimatedPrice,
  };

  return (
    <MultiServiceCartContext.Provider value={value}>
      {children}
    </MultiServiceCartContext.Provider>
  );
}

export function useMultiServiceCart() {
  const context = useContext(MultiServiceCartContext);
  if (context === undefined) {
    throw new Error('useMultiServiceCart must be used within a MultiServiceCartProvider');
  }
  return context;
}
