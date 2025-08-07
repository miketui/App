// User roles
export const USER_ROLES = {
  APPLICANT: 'Applicant',
  MEMBER: 'Member',
  LEADER: 'Leader',
  ADMIN: 'Admin'
};

// User statuses
export const USER_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  BANNED: 'banned',
  SUSPENDED: 'suspended'
};

// Ballroom categories
export const BALLROOM_CATEGORIES = [
  'Vogue Femme',
  'Butch Queen',
  'Butch Queen Vogue Femme',
  'Femme Queen',
  'Butch Queen Up in Drags',
  'Butch Queen Realness',
  'Femme Queen Realness',
  'Butch Queen Face',
  'Femme Queen Face',
  'Butch Queen Body',
  'Femme Queen Body',
  'Butch Queen Runway',
  'Femme Queen Runway',
  'Butch Queen Performance',
  'Femme Queen Performance'
];

// Experience levels
export const EXPERIENCE_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional'
];

// Document categories
export const DOCUMENT_CATEGORIES = [
  'Rules',
  'History',
  'Tutorials',
  'Events',
  'Resources',
  'House Documents',
  'Competition Info',
  'Media'
];

// Document access levels
export const DOCUMENT_ACCESS_LEVELS = {
  APPLICANT: 'Applicant',
  MEMBER: 'Member',
  LEADER: 'Leader',
  ADMIN: 'Admin'
};

// Chat thread types
export const CHAT_THREAD_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
  HOUSE: 'house',
  ANNOUNCEMENT: 'announcement'
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video',
  SYSTEM: 'system'
};

// Post visibility levels
export const POST_VISIBILITY = {
  PUBLIC: 'public',
  HOUSE_ONLY: 'house_only',
  MEMBERS_ONLY: 'members_only',
  PRIVATE: 'private'
};

// Event types
export const EVENT_TYPES = [
  'Ball',
  'Practice',
  'Workshop',
  'Competition',
  'Social',
  'Meeting',
  'Performance'
];

// Event statuses
export const EVENT_STATUSES = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Notification types
export const NOTIFICATION_TYPES = {
  POST_LIKE: 'post_like',
  POST_COMMENT: 'post_comment',
  POST_SHARE: 'post_share',
  COMMENT_LIKE: 'comment_like',
  MESSAGE: 'message',
  APPLICATION_UPDATE: 'application_update',
  ROLE_CHANGE: 'role_change',
  HOUSE_INVITE: 'house_invite',
  EVENT_REMINDER: 'event_reminder',
  SYSTEM: 'system'
};

// Content moderation statuses
export const MODERATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  FLAGGED: 'flagged',
  REJECTED: 'rejected'
};

// Payment types
export const PAYMENT_TYPES = {
  SUBSCRIPTION: 'subscription',
  ONE_TIME: 'one_time',
  DONATION: 'donation'
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  LEADER: 'leader',
  ADMIN: 'admin'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    GENERATE_CODE: '/auth/generate-code',
    VERIFY_CODE: '/auth/verify-code'
  },
  USERS: {
    PROFILE: '/users/profile',
    APPLICATIONS: '/users/applications'
  },
  DOCUMENTS: {
    UPLOAD: '/documents/upload',
    LIST: '/documents',
    DOWNLOAD: '/documents/:id/download'
  },
  CHAT: {
    THREADS: '/chat/threads',
    MESSAGES: '/chat/threads/:threadId/messages'
  },
  POSTS: {
    CREATE: '/posts',
    LIST: '/posts',
    LIKE: '/posts/:id/like'
  },
  AI: {
    GENERATE_CAPTION: '/ai/generate-caption',
    MODERATE_CONTENT: '/ai/moderate-content'
  }
};

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ]
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'supabase.auth.token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  EMAIL_REQUIRED: 'Email is required.',
  PASSWORD_REQUIRED: 'Password is required.',
  LOGIN_FAILED: 'Login failed. Please try again.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  APPLICATION_SUBMITTED: 'Application submitted successfully!',
  DOCUMENT_UPLOADED: 'Document uploaded successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  POST_CREATED: 'Post created successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
};

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500
};

export default {
  USER_ROLES,
  USER_STATUSES,
  BALLROOM_CATEGORIES,
  EXPERIENCE_LEVELS,
  DOCUMENT_CATEGORIES,
  DOCUMENT_ACCESS_LEVELS,
  CHAT_THREAD_TYPES,
  MESSAGE_TYPES,
  POST_VISIBILITY,
  EVENT_TYPES,
  EVENT_STATUSES,
  NOTIFICATION_TYPES,
  MODERATION_STATUSES,
  PAYMENT_TYPES,
  SUBSCRIPTION_PLANS,
  API_ENDPOINTS,
  FILE_LIMITS,
  PAGINATION,
  STORAGE_KEYS,
  THEMES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES
};