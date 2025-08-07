import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Crown, 
  Star, 
  Check, 
  X, 
  Calendar,
  DollarSign,
  Shield,
  Zap,
  Users,
  MessageSquare,
  FileText,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const BillingPage = () => {
  const { userProfile, supabase } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/stripe/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Set default plans if Stripe is not configured
      setPlans([
        {
          id: 'basic',
          name: 'Basic Membership',
          description: 'Essential features for community members',
          amount: 999, // $9.99
          currency: 'usd',
          interval: 'month',
          features: [
            'Access to community feed',
            'Real-time messaging',
            'Document library access',
            'Basic profile features',
            'House participation'
          ]
        },
        {
          id: 'premium',
          name: 'Premium Membership',
          description: 'Advanced features for dedicated members',
          amount: 1999, // $19.99
          currency: 'usd',
          interval: 'month',
          popular: true,
          features: [
            'All Basic features',
            'AI-powered post captions',
            'Priority support',
            'Advanced analytics',
            'Custom profile themes',
            'Event priority access'
          ]
        },
        {
          id: 'vip',
          name: 'VIP Membership',
          description: 'Exclusive access and premium benefits',
          amount: 4999, // $49.99
          currency: 'usd',
          interval: 'month',
          features: [
            'All Premium features',
            'Direct mentor access',
            'Exclusive events',
            'Custom house features',
            'Advanced AI tools',
            'Personal brand support'
          ]
        }
      ]);
    }
  };

  // Fetch current subscription
  const fetchSubscription = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/stripe/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setCurrentSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  // Handle subscription
  const handleSubscribe = async (plan) => {
    if (!paymentMethod.cardNumber || !paymentMethod.expiryDate || !paymentMethod.cvv || !paymentMethod.name) {
      toast.error('Please fill in all payment details');
      return;
    }

    setSubscribing(true);
    try {
      // In a real implementation, you would integrate with Stripe Elements
      // For now, we'll simulate the subscription process
      toast.success(`Successfully subscribed to ${plan.name}!`);
      
      // Simulate subscription creation
      const mockSubscription = {
        id: `sub_${Date.now()}`,
        status: 'active',
        price_id: plan.id,
        product: { name: plan.name },
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      setCurrentSubscription(mockSubscription);
      setShowPaymentForm(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription');
    } finally {
      setSubscribing(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const data = await response.json();
      toast.success(data.message);
      await fetchSubscription();
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  // Handle subscription resumption
  const handleResumeSubscription = async () => {
    if (!currentSubscription) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/stripe/resume-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to resume subscription');
      }

      const data = await response.json();
      toast.success(data.message);
      await fetchSubscription();
    } catch (error) {
      console.error('Resume error:', error);
      toast.error('Failed to resume subscription');
    }
  };

  // Format price
  const formatPrice = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  // Get plan icon
  const getPlanIcon = (planName) => {
    if (planName.toLowerCase().includes('vip')) return Crown;
    if (planName.toLowerCase().includes('premium')) return Star;
    return Shield;
  };

  // Get subscription status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'cancel_at_period_end': return 'text-yellow-600 bg-yellow-100';
      case 'past_due': return 'text-red-600 bg-red-100';
      case 'canceled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchSubscription()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading billing information..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Membership & Billing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the perfect membership tier to unlock exclusive features and support the Haus of Basquiat community.
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Current Subscription</h2>
              <div className="flex items-center space-x-4">
                <span className="text-lg">{currentSubscription.product?.name || 'Active Plan'}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.status)}`}>
                  {currentSubscription.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {currentSubscription.current_period_end && (
                <p className="text-purple-200 mt-2">
                  {currentSubscription.status === 'cancel_at_period_end' ? 'Expires' : 'Renews'} on{' '}
                  {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {currentSubscription.status === 'cancel_at_period_end' ? (
                <button
                  onClick={handleResumeSubscription}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={handleCancelSubscription}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.name);
          const isCurrentPlan = currentSubscription?.price_id === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-purple-500 transform scale-105' 
                  : 'border-gray-200 hover:border-purple-300'
              } ${isCurrentPlan ? 'ring-4 ring-green-200' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex p-4 rounded-2xl mb-4 ${
                    plan.popular ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">
                      {formatPrice(plan.amount, plan.currency)}
                    </span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => {
                    if (isCurrentPlan) return;
                    setSelectedPlan(plan);
                    setShowPaymentForm(true);
                  }}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          What's Included
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-xl mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Chat</h3>
            <p className="text-gray-600 text-sm">Connect with community members instantly</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex p-3 bg-purple-100 text-purple-600 rounded-xl mb-4">
              <FileText size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Document Library</h3>
            <p className="text-gray-600 text-sm">Access exclusive resources and materials</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-xl mb-4">
              <Users size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">House Participation</h3>
            <p className="text-gray-600 text-sm">Join ballroom houses and communities</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex p-3 bg-yellow-100 text-yellow-600 rounded-xl mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Features</h3>
            <p className="text-gray-600 text-sm">Smart captions and content enhancement</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentForm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Subscribe to {selectedPlan.name}
              </h2>
              <p className="text-gray-600">
                {formatPrice(selectedPlan.amount, selectedPlan.currency)}/{selectedPlan.interval}
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubscribe(selectedPlan);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={paymentMethod.name}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={paymentMethod.cardNumber}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentMethod.expiryDate}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentMethod.cvv}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedPlan(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subscribing}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {subscribing ? 'Processing...' : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;