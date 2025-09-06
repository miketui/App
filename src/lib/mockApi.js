// Mock API using local data

const users = [
  {
    id: '1',
    email: 'testuser@example.com',
    role: 'Member',
    house_id: '1',
    status: 'active',
    display_name: 'Test User',
    bio: 'A test user bio.',
    avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
  },
];

const houses = [
    {
        id: '1',
        name: 'House of Eleganza',
        category: 'Ballroom',
        description: 'Celebrating grace, poise, and sophisticated performance',
    }
];

const mockPosts = [
      {
        id: '1',
        content: 'Just discovered an incredible analysis of Basquiat\'s "Untitled (Skull)" from 1981. The way he combines African mask traditions with contemporary urban art is absolutely revolutionary. The skull isn\'t just death - it\'s transformation, ancestry, and rebirth all at once. 💀✨',
        author_id: 'user1',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        like_count: 23,
        comment_count: 7,
        is_liked: false,
        author: {
          id: 'user1',
          username: 'artlover23',
          full_name: 'Maya Chen',
          role: 'curator'
        },
        tags: ['basquiat', 'skull', 'analysis', 'african-art']
      },
      {
        id: '2',
        content: 'Walking through Brooklyn today, I couldn\'t help but think about Jean-Michel\'s early days here. The energy, the raw creativity, the way art explodes from every corner. Street art isn\'t just decoration - it\'s revolution made visible.',
        author_id: 'user2',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        like_count: 15,
        comment_count: 4,
        is_liked: true,
        author: {
          id: 'user2',
          username: 'brooklyn_art',
          full_name: 'Alex Rodriguez',
          role: 'member'
        },
        tags: ['brooklyn', 'street-art', 'inspiration']
      },
      {
        id: '3',
        content: 'New exhibition opening next week: "Words as Weapons: Text in Basquiat\'s Work." Looking at how he used language not just as art but as activism. His words carry the weight of history and the promise of change. Who else is planning to attend? 📝🎨',
        author_id: 'user3',
        created_at: new Date(Date.now() - 14400000).toISOString(),
        like_count: 31,
        comment_count: 12,
        is_liked: false,
        author: {
          id: 'user3',
          username: 'dr_williams',
          full_name: 'Dr. Sarah Williams',
          role: 'curator'
        },
        tags: ['exhibition', 'text-art', 'activism']
      },
      {
        id: '4',
        content: 'Teaching my kids about Basquiat today. They were amazed that someone could make art that\'s both beautiful AND tells important stories about justice and identity. Art education starts early! 👨‍👩‍👧‍👦',
        author_id: 'user4',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        like_count: 42,
        comment_count: 9,
        is_liked: true,
        author: {
          id: 'user4',
          username: 'parentartist',
          full_name: 'Marcus Johnson',
          role: 'member'
        },
        tags: ['education', 'family', 'justice']
      },
      {
        id: '5',
        content: 'Reminder: The crown motif in Basquiat\'s work isn\'t about vanity or ego. It\'s about reclaiming power, dignity, and self-worth in a world that often denies these things to Black bodies. Every crown is a statement of inherent royalty. 👑',
        author_id: 'user5',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        like_count: 67,
        comment_count: 18,
        is_liked: false,
        author: {
          id: 'user5',
          username: 'cultural_critic',
          full_name: 'Dr. Amara Washington',
          role: 'curator'
        },
        tags: ['crown', 'power', 'identity', 'symbolism']
      }
    ];

const mockGalleryItems = [
  {
    id: '1',
    title: 'Untitled (Skull)',
    author: 'Jean-Michel Basquiat',
    year: 1981,
    imageUrl: 'https://uploads.adsttc.com/uploads/image/upload/large_jpg/slideshow/The_Broad_s_Basquiat_exhibit-2.jpg',
  },
  {
    id: '2',
    title: 'Boy and Dog in a Johnnypump',
    author: 'Jean-Michel Basquiat',
    year: 1982,
    imageUrl: 'https://uploads.adsttc.com/uploads/image/upload/large_jpg/slideshow/The_Broad_s_Basquiat_exhibit-2.jpg',
  },
  {
    id: '3',
    title: 'Untitled (History of Black People)',
    author: 'Jean-Michel Basquiat',
    year: 1983,
    imageUrl: 'https://uploads.adsttc.com/uploads/image/upload/large_jpg/slideshow/The_Broad_s_Basquiat_exhibit-2.jpg',
  },
];

const mockConversations = [
  {
    id: '1',
    participants: ['1', 'user2'],
    last_message: 'Hey! Love your latest post about Basquiat's work',
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    other_participant: {
      id: 'user2',
      username: 'artlover23',
      full_name: 'Maya Chen',
      role: 'curator'
    }
  },
  {
    id: '2',
    participants: ['1', 'user3'],
    last_message: 'Thanks for sharing that gallery info!',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    other_participant: {
      id: 'user3',
      username: 'brooklyn_art',
      full_name: 'Alex Rodriguez',
      role: 'member'
    }
  }
];

const mockMessages = {
  '1': [
    {
      id: '1',
      content: 'Hey! Love your latest post about Basquiat's work',
      sender_id: 'user2',
      conversation_id: '1',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      sender: {
        id: 'user2',
        username: 'artlover23',
        full_name: 'Maya Chen',
        role: 'curator'
      }
    },
    {
      id: '2',
      content: 'Thank you! I've been studying his techniques lately',
      sender_id: '1',
      conversation_id: '1',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      content: 'His use of text as art is so fascinating. Have you seen the Crown series?',
      sender_id: 'user2',
      conversation_id: '1',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      sender: {
        id: 'user2',
        username: 'artlover23',
        full_name: 'Maya Chen',
        role: 'curator'
      }
    }
  ],
  '2': []
};

export const mockApi = {
  login: async (email, password) => {
    console.log('Logging in with:', email, password);
    const user = users.find((u) => u.email === email);
    if (user) {
      return { user, session: { access_token: 'mock_token' }, error: null };
    }
    return { user: null, session: null, error: { message: 'Invalid credentials' } };
  },

  getUser: async (id) => {
    const user = users.find((u) => u.id === id);
    return user;
  },

  getHouse: async (id) => {
    const house = houses.find((h) => h.id === id);
    return house;
  },

  getFeedPosts: async () => {
    return mockPosts;
  },

  updateProfile: async (userId, updates) => {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      return { data: users[userIndex], error: null };
    }
    return { data: null, error: { message: 'User not found' } };
  },

  getHouses: async () => {
    return houses;
  },

  getGalleryItems: async () => {
    return mockGalleryItems;
  },

  getConversations: async (userId) => {
    return mockConversations.filter(c => c.participants.includes(userId));
  },

  getMessages: async (conversationId) => {
    return mockMessages[conversationId] || [];
  },

  sendMessage: async (conversationId, message) => {
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(message);
    return { data: message, error: null };
  }
};