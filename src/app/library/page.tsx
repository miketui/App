'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'artwork' | 'article' | 'video' | 'book' | 'exhibition';
  url?: string;
  author?: string;
  year?: number;
  tags: string[];
  user_id: string;
  created_at: string;
  is_public: boolean;
}

export default function LibraryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    type: 'artwork' as LibraryItem['type'],
    url: '',
    author: '',
    year: new Date().getFullYear(),
    tags: '',
    is_public: true,
  });

  const supabase = createClientComponentClient();

  const itemTypes = [
    { value: 'artwork', label: 'Artwork', color: 'bg-basquiat-red' },
    { value: 'article', label: 'Article', color: 'bg-basquiat-blue' },
    { value: 'video', label: 'Video', color: 'bg-basquiat-green' },
    { value: 'book', label: 'Book', color: 'bg-basquiat-yellow' },
    { value: 'exhibition', label: 'Exhibition', color: 'bg-basquiat-purple' }
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadLibraryItems();
      }
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    filterItems();
  }, [libraryItems, searchQuery, selectedType]);

  const loadLibraryItems = () => {
    // Mock library items data
    const mockItems: LibraryItem[] = [
      {
        id: '1',
        title: 'Untitled (Skull)',
        description: 'One of Basquiat\'s most iconic works featuring his distinctive skull motif',
        type: 'artwork',
        author: 'Jean-Michel Basquiat',
        year: 1981,
        tags: ['skull', 'graffiti', 'neo-expressionism'],
        user_id: 'current-user',
        created_at: new Date().toISOString(),
        is_public: true,
      },
      {
        id: '2',
        title: 'The Radiant Child Documentary',
        description: 'Documentary about Jean-Michel Basquiat\'s life and artistic journey',
        type: 'video',
        url: 'https://example.com/radiant-child',
        year: 2010,
        tags: ['documentary', 'biography', 'art-history'],
        user_id: 'current-user',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        is_public: true,
      },
      {
        id: '3',
        title: 'Basquiat: The Unknown Notebooks',
        description: 'Collection of sketches, notes, and ideas from the artist\'s personal notebooks',
        type: 'book',
        author: 'Various',
        year: 2015,
        tags: ['sketches', 'notebooks', 'personal'],
        user_id: 'current-user',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        is_public: false,
      },
      {
        id: '4',
        title: 'King Pleasure Exhibition',
        description: 'Major retrospective at Chelsea Market featuring immersive installations',
        type: 'exhibition',
        author: 'Estate of Jean-Michel Basquiat',
        year: 2022,
        tags: ['retrospective', 'immersive', 'contemporary'],
        user_id: 'current-user',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        is_public: true,
      },
      {
        id: '5',
        title: 'The Art of Resistance',
        description: 'Analysis of political themes in Basquiat\'s work and their relevance today',
        type: 'article',
        url: 'https://example.com/art-resistance',
        author: 'Dr. Sarah Williams',
        year: 2023,
        tags: ['politics', 'resistance', 'analysis'],
        user_id: 'current-user',
        created_at: new Date(Date.now() - 345600000).toISOString(),
        is_public: true,
      }
    ];

    setLibraryItems(mockItems);
  };

  const filterItems = () => {
    let filtered = libraryItems;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.author?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;

    const item: LibraryItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description,
      type: newItem.type,
      url: newItem.url || undefined,
      author: newItem.author || undefined,
      year: newItem.year,
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      user_id: user?.id || '',
      created_at: new Date().toISOString(),
      is_public: newItem.is_public,
    };

    setLibraryItems(prev => [item, ...prev]);
    setIsAddModalOpen(false);
    setNewItem({
      title: '',
      description: '',
      type: 'artwork',
      url: '',
      author: '',
      year: new Date().getFullYear(),
      tags: '',
      is_public: true,
    });
  };

  const getTypeConfig = (type: LibraryItem['type']) => {
    return itemTypes.find(t => t.value === type) || itemTypes[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basquiat-cream p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-basquiat-red">My Library</h1>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-basquiat-green"
          >
            Add to Library
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 border-4 border-black shadow-brutal mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search library items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2 border-black"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedType('all')}
                className={`${selectedType === 'all' ? 'bg-basquiat-yellow text-black' : 'bg-white text-black border-2 border-black'}`}
              >
                All
              </Button>
              {itemTypes.map(type => (
                <Button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`${selectedType === type.value ? `${type.color} text-white` : 'bg-white text-black border-2 border-black'}`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {libraryItems.length} items
          </div>
        </Card>

        {/* Library Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const typeConfig = getTypeConfig(item.type);
            return (
              <Card key={item.id} className="p-4 border-4 border-black shadow-brutal hover:shadow-brutal-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${typeConfig.color} text-white px-3 py-1 text-sm font-bold uppercase`}>
                    {typeConfig.label}
                  </Badge>
                  <Badge className={`${item.is_public ? 'bg-green-500' : 'bg-gray-500'} text-white px-2 py-1 text-xs`}>
                    {item.is_public ? 'Public' : 'Private'}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">{item.title}</h3>
                
                {item.author && (
                  <p className="text-sm text-gray-600 mb-2">by {item.author}</p>
                )}
                
                {item.year && (
                  <p className="text-sm text-gray-600 mb-3">{item.year}</p>
                )}

                <p className="text-sm text-gray-800 mb-4 line-clamp-3">{item.description}</p>

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded border border-black"
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded border border-black">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Added {formatDate(item.created_at)}</span>
                  {item.url && (
                    <Button
                      onClick={() => window.open(item.url, '_blank')}
                      className="bg-basquiat-blue text-white text-xs px-3 py-1"
                    >
                      View
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-black mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start building your Basquiat library by adding items'
              }
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-basquiat-green"
            >
              Add First Item
            </Button>
          </div>
        )}

        {/* Add Item Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add to Library"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">Title *</label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                className="border-2 border-black"
                placeholder="Enter title"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Type *</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as LibraryItem['type'] }))}
                className="w-full border-2 border-black px-3 py-2 bg-white"
              >
                {itemTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Description</label>
              <Textarea
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                className="border-2 border-black"
                placeholder="Describe this item..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Author/Artist</label>
                <Input
                  value={newItem.author}
                  onChange={(e) => setNewItem(prev => ({ ...prev, author: e.target.value }))}
                  className="border-2 border-black"
                  placeholder="Author/Artist name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Year</label>
                <Input
                  type="number"
                  value={newItem.year}
                  onChange={(e) => setNewItem(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="border-2 border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">URL (optional)</label>
              <Input
                value={newItem.url}
                onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                className="border-2 border-black"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Tags</label>
              <Input
                value={newItem.tags}
                onChange={(e) => setNewItem(prev => ({ ...prev, tags: e.target.value }))}
                className="border-2 border-black"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={newItem.is_public}
                onChange={(e) => setNewItem(prev => ({ ...prev, is_public: e.target.checked }))}
                className="w-4 h-4 border-2 border-black"
              />
              <label htmlFor="is_public" className="text-sm font-bold text-black">
                Make this item public
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setIsAddModalOpen(false)}
                variant="outline"
                className="flex-1 border-2 border-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddItem}
                disabled={!newItem.title.trim()}
                className="flex-1 bg-basquiat-green"
              >
                Add to Library
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}