import React from 'react';
import { ShoppingCart, X, Trash2, Package, Truck, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMultiServiceCart } from '@/contexts/MultiServiceCartContext';
import { useNavigate } from 'react-router-dom';
import { ServiceSelectionModal } from './ServiceSelectionModal';

export function MultiServiceCart() {
  const { state, removeItem, clearCart, closeCart } = useMultiServiceCart();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const [showServiceModal, setShowServiceModal] = React.useState(false);

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const handleCheckout = () => {
    navigate('/bookings');
    closeCart();
  };

  const handleContinueShopping = () => {
    closeCart();
    setShowServiceModal(true);
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'moving':
        return <Home className="w-4 h-4" />;
      case 'disposal':
        return <Package className="w-4 h-4" />;
      case 'transport':
        return <Truck className="w-4 h-4" />;
      default:
        return <ShoppingCart className="w-4 h-4" />;
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'moving':
        return 'bg-blue-100 text-blue-800';
      case 'disposal':
        return 'bg-green-100 text-green-800';
      case 'transport':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCartItemTitle = (item: any) => {
    const serviceNames = {
      moving: 'Moving Service',
      disposal: 'Disposal Service',
      transport: 'Transport Service',
    };
    
    if (item.serviceType) {
      return `${serviceNames[item.service]} - ${item.serviceType}`;
    }
    return serviceNames[item.service];
  };

  const formatCartItemDescription = (item: any) => {
    const payload = item.payload;
    
    switch (item.service) {
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

  const renderCartItem = (item: any) => (
    <Card key={item.id} className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getServiceIcon(item.service)}
            <div>
              <CardTitle className="text-sm font-medium">
                {formatCartItemTitle(item)}
              </CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className={getServiceColor(item.service)}>
                  {item.service.charAt(0).toUpperCase() + item.service.slice(1)}
                </Badge>
                <Badge variant="secondary">
                  {item.selectionType === 'quote' ? 'Quote' : 'Company'}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-2">
          {formatCartItemDescription(item)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Added {item.createdAt.toLocaleDateString()}
          </span>
          <span className="text-sm font-medium">
            {item.estimatedPrice ? `$${item.estimatedPrice}` : 'Price TBD'}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">
        Start adding services to your cart to get started
      </p>
      <Button onClick={() => setShowServiceModal(true)}>
        Browse Services
      </Button>
    </div>
  );

  return (
    <>
      <Sheet open={state.isOpen} onOpenChange={closeCart}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle>
                Service Cart ({state.totalItems} {state.totalItems === 1 ? 'item' : 'items'})
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-red-500 hover:text-red-700"
                disabled={state.totalItems === 0}
              >
                Clear All
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {state.totalItems === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-3">
                {state.items.map(renderCartItem)}
              </div>
            )}
          </div>

          {state.totalItems > 0 && (
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-lg font-bold">
                  {state.items.some(item => item.estimatedPrice) 
                    ? `$${state.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)}`
                    : 'Price on Request'
                  }
                </span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout} 
                  className="w-full"
                  disabled={!state.items.some(item => item.estimatedPrice)}
                >
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleContinueShopping}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Clear Cart Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-80 mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Clear Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClearCart}>
                  Clear Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Selection Modal */}
      {showServiceModal && (
        <ServiceSelectionModal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
        />
      )}
    </>
  );
}
