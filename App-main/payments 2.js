module.exports = {
  subscriptions: {
    id: 'uuid primary key',
    user_id: 'uuid references users(id)',
    stripe_subscription_id: 'text',
    plan: 'text',
    status: 'text',
    created_at: 'timestamp with time zone default now()',
    updated_at: 'timestamp with time zone default now()'
  },
  payment_records: {
    id: 'uuid primary key',
    user_id: 'uuid references users(id)',
    stripe_event_id: 'text',
    amount: 'integer',
    currency: 'text',
    type: 'text', // subscription | one_time
    created_at: 'timestamp with time zone default now()'
  }
};
