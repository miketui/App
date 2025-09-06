'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface GalleryItem {
  id: string;
  title: string;
  file_url: string;
  category: string;
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGalleryItems = async () => {
      try {
        const response = await api.get('/documents?category=gallery');
        setGalleryItems(response.data.documents);
      } catch (error) {
        console.error('Error loading gallery items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGalleryItems();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basquiat-cream p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-basquiat-red mb-6">Gallery</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-4 border-black shadow-brutal">
              <img src={item.file_url} alt={item.title} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-bold text-black mb-1">{item.title}</h2>
                <p className="text-gray-600">{item.category}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
