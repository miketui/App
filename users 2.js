// Defines the Users table schema for reference
module.exports = {
  table: 'users',
  columns: {
    id: 'uuid primary key',
    email: 'text unique',
    role: "text default 'Applicant'", // Applicant | Member | Admin | Leader
    house_id: 'uuid',
    status: "text default 'pending'", // pending | active | banned
    created_at: 'timestamp with time zone default now()'
  }
};
