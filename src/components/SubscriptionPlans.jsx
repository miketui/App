import React, { useState } from 'react';
import { Check, Star, Crown, Zap, Shield, Users, FileText, MessageCircle, Calendar, Settings } from 'lucide-react';
import paymentService from '../services/paymentService';
import { SUBSCRIPTION_PLANS } from '../utils/constants';
import toast from 'react-hot-toast';

function SubscriptionPlans({ currentPlan, onPlanChange }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = [
    {
      id: SUBSCRIPTION_PLANS.BASIC,
      name: 'Basic Member',
      price: 999, // $9.99
      interval: 'month',
      description: 'Perfect for new members getting started',
      features: [
        'Access to community feed',
        'Basic document library',
        'Chat with members',
        'Event notifications',
        'Profile customization'
      ],
      icon: Users,
      color: 'blue',
      popular: false
    },
    {
      id: SUBSCRIPTION_PLANS.PREMIUM,
      name: 'Premium Member',
      price: 1999, // $19.99
      interval: 'month',
      description: 'Enhanced features for active community members',
      features: [
        'All Basic features',
        'Advanced document access',
        'Priority support',
        'Event discounts',
        'Exclusive content',
        'Advanced analytics',
        'Custom themes'
      ],
      icon: Star,
      color: 'purple',
      popular: true
    },
    {
      id: SUBSCRIPTION_PLANS.LEADER,
      name: 'House Leader',
      price: 3999, // $39.99
      interval: 'month',
      description: 'Complete tools for house management',
      features: [
        'All Premium features',
        'House management tools',
        'Analytics dashboard',
        'Event creation',
        'Member management',
        'Content moderation',
        'Advanced reporting'
      ],
      icon: Crown,
      color: 'green',
      popular: false
    },
    {
      id: SUBSCRIPTION_PLANS.ADMIN,
      name: 'Admin',
      price: 7999, // $79.99
      interval: 'month',
      description: 'Full platform access and control',
      features: [
        'All Leader features',
        'Full platform access',
        'Content moderation',
        'User management',
        'System settings',
        'API access',
        'Priority support'
      ],
      icon: Shield,
      color: 'red',
      popular: false
    }
  ];

  const getIcon = (IconComponent) => {
    return <IconComponent className="w-6 h-6" />;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-white border-blue-500',
      purple: 'bg-purple-500 text-white border-purple-500',
      green: 'bg-green-500 text-white border-green-500',
      red: 'bg-red-500 text-white border-red-500'
    };
    return colors[color] || colors.blue;
  };

  const getColorClassesLight = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[color] || colors.blue;
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleSubscribe = async (paymentMethodId) => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const response = await paymentService.createSubscription(
        selectedPlan.id,
        'current-user-id', // This would come from auth context
        paymentMethodId
      );

      if (response.success) {
        toast.success(`Successfully subscribed to ${selectedPlan.name}!`);
        if (onPlanChange) {
          onPlanChange(selectedPlan.id);
        }
        setShowPaymentModal(false);
      } else {
        toast.error(response.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your ballroom community experience. 
          All plans include access to our vibrant community and basic features.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-lg ${
              currentPlan === plan.id
                ? 'border-purple-500 shadow-purple-100'
                : 'border-gray-200 hover:border-gray-300'
            } ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            {/* Current Plan Badge */}
            {currentPlan === plan.id && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="p-6">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getColorClassesLight(plan.color)} mb-4`}>
                  {getIcon(plan.icon)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                    <span className="text-gray-500 ml-1">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Billed monthly</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePlanSelect(plan)}
                disabled={currentPlan === plan.id || loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : `${getColorClasses(plan.color)} hover:opacity-90`
                }`}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Choose Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Can I change my plan anytime?</h4>
            <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Is there a free trial?</h4>
            <p className="text-sm text-gray-600">We offer a 7-day free trial for all plans. No credit card required to start.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-600">We accept all major credit cards, debit cards, and digital wallets through Stripe.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">Absolutely. You can cancel your subscription at any time with no cancellation fees.</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subscribe to {selectedPlan.name}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Plan Details:</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedPlan.name}</span>
                  <span className="font-bold">{formatPrice(selectedPlan.price)}/month</span>
                </div>
              </div>
            </div>

            {/* Payment Form Placeholder */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                <p className="text-sm text-gray-600">Payment form would be integrated here</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubscribe('payment-method-id')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : `${getColorClasses(selectedPlan.color)} hover:opacity-90`
                }`}
              >
                {loading ? 'Processing...' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPlans;