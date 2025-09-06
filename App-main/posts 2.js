module.exports = {
  posts: {
    id: 'uuid primary key',
    author_id: 'uuid references users(id)',
    text: 'text',
    media_url: 'text',
    moderation_status: "text default 'pending'", // pending | approved | flagged
    created_at: 'timestamp with time zone default now()'
  },
  comments: {
    id: 'uuid primary key',
    post_id: 'uuid references posts(id)',
    user_id: 'uuid references users(id)',
    body: 'text',
    created_at: 'timestamp with time zone default now()'
  },
  media_assets: {
    id: 'uuid primary key',
    user_id: 'uuid references users(id)',
    file_url: 'text',
    type: 'text',
    moderation_status: "text default 'pending'",
    created_at: 'timestamp with time zone default now()'
  }
};
