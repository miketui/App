module.exports = {
  chat_threads: {
    id: 'uuid primary key',
    name: 'text',
    thread_type: "text", // direct | group
    created_by: 'uuid references users(id)',
    created_at: 'timestamp with time zone default now()'
  },
  messages: {
    id: 'uuid primary key',
    thread_id: 'uuid references chat_threads(id)',
    sender_id: 'uuid references users(id)',
    body: 'text',
    read: 'boolean default false',
    created_at: 'timestamp with time zone default now()'
  }
};
