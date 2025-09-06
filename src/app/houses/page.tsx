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

interface House {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHouses = async () => {
      try {
        const response = await api.get('/houses');
        setHouses(response.data.houses);
      } catch (error) {
        console.error('Error loading houses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHouses();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-basquiat-red mb-6">Houses & Committees</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {houses.map((house) => (
            <Card key={house.id} className="p-6 border-4 border-black shadow-brutal">
              <h2 className="text-2xl font-bold text-black mb-2">{house.name}</h2>
              <p className="text-gray-600 mb-4">{house.category}</p>
              <p className="text-gray-800 whitespace-pre-wrap">{house.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
