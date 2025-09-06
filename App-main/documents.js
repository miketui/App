module.exports = {
  table: 'documents',
  columns: {
    id: 'uuid primary key',
    uploader_id: 'uuid references users(id)',
    category: 'text',
    file_url: 'text',
    download_count: 'integer default 0',
    created_at: 'timestamp with time zone default now()',
    moderation_status: "text default 'pending'" // pending | approved | flagged
  }
};
