'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  MessageCircle, 
  FileText, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Crown,
  Shield,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getCurrentUser, signOut } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface NavigationProps {
  className?: string
}

export default function Navigation({ className }: NavigationProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initialize = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    initialize()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navigationItems = [
    {
      name: 'Feed',
      href: '/feed',
      icon: Home,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Chats',
      href: '/chats',
      icon: MessageCircle,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Library',
      href: '/library',
      icon: FileText,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['Member', 'Leader', 'Admin']
    }
  ]

  const adminItems = [
    {
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      roles: ['Admin']
    }
  ]

  const canAccessRoute = (requiredRoles: string[]) => {
    return user && requiredRoles.includes(user.role)
  }

  if (loading) {
    return null
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-64 ${className}`}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-basquiat-surface border-r border-basquiat-blue/20">
          <div className="flex h-16 shrink-0 items-center px-6">
            <Link href="/feed" className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-basquiat-yellow" />
              <span className="text-xl font-bold basquiat-text-gradient">
                Haus of Basquiat
              </span>
            </Link>
          </div>
          
          <nav className="flex flex-1 flex-col px-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigationItems.map((item) => {
                    if (!canAccessRoute(item.roles)) return null
                    
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors ${
                            isActive
                              ? 'bg-basquiat-blue text-basquiat-bg'
                              : 'text-basquiat-text hover:text-basquiat-yellow hover:bg-basquiat-blue/10'
                          }`}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              
              {/* Admin Section */}
              {user?.role === 'Admin' && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-basquiat-muted">
                    Administration
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {adminItems.map((item) => {
                      const isActive = pathname.startsWith(item.href)
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors ${
                              isActive
                                ? 'bg-basquiat-red text-basquiat-text'
                                : 'text-basquiat-text hover:text-basquiat-red hover:bg-basquiat-red/10'
                            }`}
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )}
              
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-3 py-3 border-t border-basquiat-blue/20">
                  <Avatar
                    src={user?.avatar_url}
                    alt={user?.display_name || 'User'}
                    fallback={user?.display_name || 'U'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-basquiat-text truncate">
                      {user?.display_name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={user?.role === 'Admin' ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        {user?.role}
                      </Badge>
                      {user?.status === 'pending' && (
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="text-basquiat-muted hover:text-basquiat-red"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-basquiat-surface border-b border-basquiat-blue/20 px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="text-basquiat-text"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-1 gap-x-4 self-stretch items-center">
            <Link href="/feed" className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-basquiat-yellow" />
              <span className="font-bold basquiat-text-gradient">Haus</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-x-4">
            <Avatar
              src={user?.avatar_url}
              alt={user?.display_name || 'User'}
              fallback={user?.display_name || 'U'}
              size="sm"
            />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="relative z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            
            <div className="fixed inset-0 flex">
              <div className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-basquiat-text"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-basquiat-surface">
                  <div className="flex h-16 shrink-0 items-center px-6">
                    <Link href="/feed" className="flex items-center space-x-2">
                      <Crown className="h-8 w-8 text-basquiat-yellow" />
                      <span className="text-xl font-bold basquiat-text-gradient">
                        Haus of Basquiat
                      </span>
                    </Link>
                  </div>
                  
                  <nav className="flex flex-1 flex-col px-6">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigationItems.map((item) => {
                            if (!canAccessRoute(item.roles)) return null
                            
                            const isActive = pathname === item.href
                            return (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors ${
                                    isActive
                                      ? 'bg-basquiat-blue text-basquiat-bg'
                                      : 'text-basquiat-text hover:text-basquiat-yellow hover:bg-basquiat-blue/10'
                                  }`}
                                >
                                  <item.icon className="h-5 w-5 shrink-0" />
                                  {item.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                      
                      {/* Mobile Admin Section */}
                      {user?.role === 'Admin' && (
                        <li>
                          <div className="text-xs font-semibold leading-6 text-basquiat-muted">
                            Administration
                          </div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {adminItems.map((item) => {
                              const isActive = pathname.startsWith(item.href)
                              return (
                                <li key={item.name}>
                                  <Link
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors ${
                                      isActive
                                        ? 'bg-basquiat-red text-basquiat-text'
                                        : 'text-basquiat-text hover:text-basquiat-red hover:bg-basquiat-red/10'
                                    }`}
                                  >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {item.name}
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        </li>
                      )}
                      
                      <li className="mt-auto">
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="w-full justify-start text-basquiat-muted hover:text-basquiat-red"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}