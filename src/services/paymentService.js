import { paymentAPI } from './api';
import { SUBSCRIPTION_PLANS, PAYMENT_TYPES } from '../utils/constants';

class PaymentService {
  // Subscription Management
  async createSubscription(planId, customerId, paymentMethodId) {
    try {
      const response = await paymentAPI.createSubscription({
        plan_id: planId,
        customer_id: customerId,
        payment_method_id: paymentMethodId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create subscription'
      };
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const response = await paymentAPI.cancelSubscription(subscriptionId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel subscription'
      };
    }
  }

  async updateSubscription(subscriptionId, updates) {
    try {
      const response = await paymentAPI.updateSubscription(subscriptionId, updates);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update subscription'
      };
    }
  }

  async getSubscription(subscriptionId) {
    try {
      const response = await paymentAPI.getSubscription(subscriptionId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription'
      };
    }
  }

  // Payment Processing
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await paymentAPI.createPaymentIntent({
        amount,
        currency,
        metadata
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create payment intent'
      };
    }
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const response = await paymentAPI.confirmPayment(paymentIntentId, {
        payment_method_id: paymentMethodId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to confirm payment'
      };
    }
  }

  // Event Management
  async createEventTicket(eventId, ticketType, quantity = 1) {
    try {
      const response = await paymentAPI.createEventTicket({
        event_id: eventId,
        ticket_type: ticketType,
        quantity
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating event ticket:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create event ticket'
      };
    }
  }

  async purchaseEventTicket(eventId, ticketType, quantity, paymentMethodId) {
    try {
      const response = await paymentAPI.purchaseEventTicket({
        event_id: eventId,
        ticket_type: ticketType,
        quantity,
        payment_method_id: paymentMethodId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error purchasing event ticket:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to purchase event ticket'
      };
    }
  }

  // Donations
  async createDonation(amount, cause, message = '') {
    try {
      const response = await paymentAPI.createDonation({
        amount,
        cause,
        message
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating donation:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create donation'
      };
    }
  }

  // Payment History
  async getPaymentHistory(filters = {}) {
    try {
      const response = await paymentAPI.getHistory(filters);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment history'
      };
    }
  }

  // Invoice Management
  async getInvoices(subscriptionId) {
    try {
      const response = await paymentAPI.getInvoices(subscriptionId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch invoices'
      };
    }
  }

  async downloadInvoice(invoiceId) {
    try {
      const response = await paymentAPI.downloadInvoice(invoiceId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error downloading invoice:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to download invoice'
      };
    }
  }

  // Refunds
  async createRefund(paymentId, amount, reason = '') {
    try {
      const response = await paymentAPI.createRefund({
        payment_id: paymentId,
        amount,
        reason
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create refund'
      };
    }
  }

  // Utility Methods
  formatAmount(amount, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  }

  getPlanDetails(planId) {
    const plans = {
      [SUBSCRIPTION_PLANS.BASIC]: {
        name: 'Basic Member',
        price: 999, // $9.99
        features: ['Access to community feed', 'Basic document library', 'Chat with members'],
        color: 'blue'
      },
      [SUBSCRIPTION_PLANS.PREMIUM]: {
        name: 'Premium Member',
        price: 1999, // $19.99
        features: ['All Basic features', 'Advanced document access', 'Priority support', 'Event discounts'],
        color: 'purple'
      },
      [SUBSCRIPTION_PLANS.LEADER]: {
        name: 'House Leader',
        price: 3999, // $39.99
        features: ['All Premium features', 'House management tools', 'Analytics dashboard', 'Event creation'],
        color: 'green'
      },
      [SUBSCRIPTION_PLANS.ADMIN]: {
        name: 'Admin',
        price: 7999, // $79.99
        features: ['All Leader features', 'Full platform access', 'Content moderation', 'User management'],
        color: 'red'
      }
    };
    return plans[planId] || null;
  }

  getEventTicketTypes(eventId) {
    // This would typically fetch from the backend
    return [
      {
        id: 'general',
        name: 'General Admission',
        price: 2500, // $25.00
        description: 'General admission to the event',
        available: true
      },
      {
        id: 'vip',
        name: 'VIP Access',
        price: 7500, // $75.00
        description: 'VIP access with premium seating and meet & greet',
        available: true
      },
      {
        id: 'backstage',
        name: 'Backstage Pass',
        price: 15000, // $150.00
        description: 'Backstage access with performer meet & greet',
        available: false
      }
    ];
  }

  validatePaymentMethod(paymentMethod) {
    const errors = [];
    
    if (!paymentMethod.card) {
      errors.push('Invalid payment method');
    }
    
    if (paymentMethod.card?.exp_month && paymentMethod.card?.exp_year) {
      const now = new Date();
      const expDate = new Date(paymentMethod.card.exp_year, paymentMethod.card.exp_month - 1);
      
      if (expDate < now) {
        errors.push('Card has expired');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Webhook Handling
  async handleWebhook(event) {
    try {
      const response = await paymentAPI.handleWebhook(event);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error handling webhook:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to handle webhook'
      };
    }
  }
}

export default new PaymentService();