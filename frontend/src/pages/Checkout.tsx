import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, MapPin, User, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/hooks/useLocation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Free shipping threshold constant
const FREE_SHIPPING_THRESHOLD = 99;

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { location, isLoading: isLocationLoading, error: locationError, getCurrentLocation } = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    paymentMethod: 'cod',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    phone: ''
  });

  const [lookupLoading, setLookupLoading] = useState(false);
  const lookupTimer = useRef<NodeJS.Timeout | null>(null);
  const [isListening, setIsListening] = useState<{ name: boolean; address: boolean }>({ name: false, address: false });
  const recognitionRef = useRef<any>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD  ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  // Capture location when component mounts
  useEffect(() => {
    (async () => {
      try {
        await getCurrentLocation();
      } catch (error) {
        console.warn('Failed to capture location:', error);
      }
    })();
  }, [getCurrentLocation]);

  // Autofill if logged-in user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Guest phone lookup
  useEffect(() => {
    const phone = formData.phone?.trim();
    if (user || !phone) return;

    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(async () => {
      try {
        setLookupLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/customers/lookup?phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) setFormData(prev => ({ ...prev, name: data.name }));
          if (data.phone) setFormData(prev => ({ ...prev, phone: data.phone }));
          if (data.address) {
            setFormData(prev => ({ ...prev, address: data.address }));
          }
        }
      } catch {
        // ignore
      } finally {
        setLookupLoading(false);
      }
    }, 700);

    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, [formData.phone, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Speech recognition
  const SpeechRecognitionAPI =
    typeof window !== 'undefined' ? (window.SpeechRecognition || (window as any).webkitSpeechRecognition) : undefined;

  const startListening = (field: 'name' | 'address') => {
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(prev => ({ ...prev, [field]: true }));
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange(field, transcript);
    };
    recognition.onerror = () => setIsListening(prev => ({ ...prev, [field]: false }));
    recognition.onend = () => setIsListening(prev => ({ ...prev, [field]: false }));
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const orderData = {
        customer: user?.id || formData.name,
        customer_name: user?.name || formData.name,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        products: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        total: getTotal(),
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              city: location.city,
              region: location.region,
              country: location.country
            }
          : null
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setOrderPlaced(true);
        setTimeout(() => {
          clearCart();
          navigate('/');
        }, 3000);
      } else {
        alert('Order failed. Please try again.');
      }
    } catch {
      alert('Order failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Please add items to your cart before checkout.</p>
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
          <p className="text-muted-foreground mb-8">Thank you for your order. You will receive a confirmation email shortly.</p>
          <div className="text-sm text-muted-foreground">Redirecting to home page...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/cart" className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Checkout</h1>
          <p className="text-muted-foreground">Complete your order and secure checkout</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Navigation className="w-5 h-5 mr-2" />
                      Location Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLocationLoading ? (
                      <div className="flex items-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Capturing your location...
                      </div>
                    ) : location ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Location captured: {location.city}, {location.region}, {location.country}
                      </div>
                    ) : locationError ? (
                      <div className="flex items-center text-orange-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        Location unavailable - order will proceed without location data
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          Location not available
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await getCurrentLocation();
                            } catch (err) {
                              console.warn('Manual location capture failed:', err);
                            }
                          }}
                          disabled={isLocationLoading}
                        >
                          {isLocationLoading ? 'Capturing...' : 'Retry Location'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Personal Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        required
                        readOnly={!!user}
                        className={!!user ? 'bg-muted cursor-not-allowed' : ''}
                      />
                      {!user && (
                        <Button type="button" size="sm" onClick={() => startListening('name')}>
                          🎤
                        </Button>
                      )}
                      {isListening.name && <span className="text-xs text-primary">Listening...</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={e => handleInputChange('phone', e.target.value)}
                          required
                          readOnly={!!user}
                          className={!!user ? 'bg-muted cursor-not-allowed' : ''}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={e => handleInputChange('address', e.target.value)}
                        required
                        rows={3}
                      />
                      <Button type="button" size="sm" onClick={() => startListening('address')}>
                        🎤
                      </Button>
                      {isListening.address && <span className="text-xs text-primary">Listening...</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input id="zipCode" value={formData.zipCode} onChange={e => handleInputChange('zipCode', e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={formData.paymentMethod} onValueChange={val => handleInputChange('paymentMethod', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="qr">Pay via QR Code</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.paymentMethod === 'qr' && (
                      <div className="mt-4 flex flex-col items-center">
                        <img src="https://res.cloudinary.com/dcsnthbsa/image/upload/v1757452270/lshwngycld6rchwnil1g.jpg" alt="QR Code" className="w-32 h-32" />
                        <span className="text-sm mt-2">Scan to pay</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Place Order */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing Order...' : `Place Order - ₹${total.toLocaleString()}`}
                </Button>
              </form>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-secondary/30 rounded-lg overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18%)</span>
                      <span>₹{tax.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {shipping === 0 && (
    <div className="bg-success/10 text-success p-3 rounded-lg text-sm">
        🎉 Free shipping on orders over ₹99!
    </div>
    )}
    </CardContent>
    </Card>
    </motion.div> {/* ✅ closes motion.div for the summary card */}
    </div>        {/* ✅ closes right column */}
    </div>        {/* ✅ closes main grid */}
    </div>        {/* ✅ closes container */}
    </div> 
  );
};

export default Checkout;
