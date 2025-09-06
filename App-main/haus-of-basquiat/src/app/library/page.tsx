'use client'

import { useState } from 'react'
import { FileText, Download, Search, Filter, Calendar, Tag, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/layout/navigation'

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  // Mock documents data
  const documents = [
    {
      id: '1',
      title: 'Community Guidelines',
      description: 'Official guidelines for respectful community participation and ballroom culture',
      category: 'Policies',
      year: 2024,
      fileType: 'PDF',
      fileSize: '2.5 MB',
      downloadCount: 156,
      updatedAt: '2024-01-15',
      tags: ['guidelines', 'community', 'safety']
    },
    {
      id: '2',
      title: 'Ball Competition Rules',
      description: 'Official rules and judging criteria for ballroom competitions',
      category: 'Events',
      year: 2024,
      fileType: 'PDF',
      fileSize: '1.8 MB',
      downloadCount: 89,
      updatedAt: '2024-02-20',
      tags: ['competition', 'rules', 'judging']
    },
    {
      id: '3',
      title: 'Membership Application Form',
      description: 'Complete application form for new community members',
      category: 'Forms',
      year: 2024,
      fileType: 'PDF',
      fileSize: '850 KB',
      downloadCount: 234,
      updatedAt: '2024-01-10',
      tags: ['application', 'membership', 'form']
    },
    {
      id: '4',
      title: 'Ballroom Terminology Guide',
      description: 'Comprehensive guide to ballroom and voguing terminology',
      category: 'Resources',
      year: 2023,
      fileType: 'PDF',
      fileSize: '3.2 MB',
      downloadCount: 412,
      updatedAt: '2023-12-05',
      tags: ['terminology', 'education', 'culture']
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories', count: documents.length },
    { value: 'Policies', label: 'Policies', count: documents.filter(d => d.category === 'Policies').length },
    { value: 'Events', label: 'Events', count: documents.filter(d => d.category === 'Events').length },
    { value: 'Forms', label: 'Forms', count: documents.filter(d => d.category === 'Forms').length },
    { value: 'Resources', label: 'Resources', count: documents.filter(d => d.category === 'Resources').length }
  ]

  const years = [
    { value: 'all', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesYear = selectedYear === 'all' || doc.year.toString() === selectedYear
    
    return matchesSearch && matchesCategory && matchesYear
  })

  const getFileIcon = (fileType: string) => {
    return <FileText className="w-5 h-5 text-basquiat-blue" />
  }

  return (
    <div className="min-h-screen bg-basquiat-bg">
      <Navigation />
      
      <div className="lg:pl-64">
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold basquiat-text-gradient">Library</h1>
              <p className="text-basquiat-muted">
                Access community documents, forms, and resources
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search */}
                <div className="md:col-span-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-basquiat-muted" />
                    <Input
                      placeholder="Search documents, tags, or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-basquiat-surface border-2 border-basquiat-blue/30 rounded-basquiat text-basquiat-text"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 bg-basquiat-surface border-2 border-basquiat-blue/30 rounded-basquiat text-basquiat-text"
                  >
                    {years.map(year => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-basquiat-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-basquiat-text mb-2">
                      No documents found
                    </h3>
                    <p className="text-basquiat-muted">
                      Try adjusting your search criteria or filters
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:border-basquiat-yellow/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-basquiat-text leading-tight mb-2">
                          {doc.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {doc.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {doc.year}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-basquiat-muted mb-4 line-clamp-2">
                      {doc.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-basquiat-surface text-basquiat-muted"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-xs text-basquiat-muted">
                          +{doc.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex items-center justify-between text-xs text-basquiat-muted mb-4">
                      <div className="flex items-center space-x-3">
                        <span>{doc.fileType}</span>
                        <span>{doc.fileSize}</span>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{doc.downloadCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Statistics */}
          {filteredDocuments.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-basquiat-muted">
                  <span>
                    Showing {filteredDocuments.length} of {documents.length} documents
                  </span>
                  <span>
                    Total downloads: {documents.reduce((sum, doc) => sum + doc.downloadCount, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}