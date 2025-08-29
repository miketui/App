'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowRight, CheckCircle, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { signInWithEmail, getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/utils'

interface ApplicationData {
  displayName: string
  pronouns: string
  bio: string
  ballroomExperience: string
  interestedHouse: string
  socialLinks: {
    instagram: string
    twitter: string
    tiktok: string
  }
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showApplication, setShowApplication] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    displayName: '',
    pronouns: '',
    bio: '',
    ballroomExperience: '',
    interestedHouse: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      tiktok: ''
    }
  })
  const [houses, setHouses] = useState<Array<{ id: string; name: string }>>([])
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      if (user && user.status === 'active') {
        router.push('/feed')
      } else if (user && user.status === 'pending') {
        // Show pending approval screen
        setEmailSent(true)
      }
    }
    checkAuth()
  }, [router])

  // Fetch houses for application form
  useEffect(() => {
    const fetchHouses = async () => {
      const { data } = await supabase
        .from('houses')
        .select('*')
        .order('name')
      
      if (data) setHouses(data)
    }
    fetchHouses()
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isLoading || !validateEmail(email)) return

    setIsLoading(true)

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id, role, status')
        .eq('email', email)
        .single()

      if (existingUser) {
        // Existing user - send magic link
        const result = await signInWithEmail(email)
        if (result.success) {
          setEmailSent(true)
        } else {
          console.error(result.error)
        }
      } else {
        // New user - show application form
        setShowApplication(true)
      }
    } catch (error) {
      // User doesn't exist, show application
      setShowApplication(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)

    try {
      // Create auth user first
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36),
        options: {
          data: {
            display_name: applicationData.displayName,
          }
        }
      })

      if (signUpError) {
        console.error(signUpError)
        return
      }

      // Send magic link for verification
      const result = await signInWithEmail(email)
      if (result.success) {
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Application error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApplicationData = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setApplicationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ApplicationData],
          [child]: value
        }
      }))
    } else {
      setApplicationData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-basquiat-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-basquiat-bg" />
            </div>
            <CardTitle className="basquiat-text-gradient">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a magic link to <strong className="text-basquiat-yellow">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-basquiat-muted">
              Click the link in your email to complete your sign-in or finish your application.
            </p>
            <Button 
              variant="ghost" 
              onClick={() => {
                setEmailSent(false)
                setShowApplication(false)
                setEmail('')
              }}
              className="text-basquiat-blue"
            >
              Try different email
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showApplication) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Crown className="w-12 h-12 text-basquiat-yellow mx-auto mb-4" />
            <h1 className="text-4xl font-bold basquiat-text-gradient mb-2">
              Join the Haus
            </h1>
            <p className="text-basquiat-muted">
              Tell us about yourself to complete your application
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep 
                    ? 'bg-basquiat-yellow text-basquiat-bg' 
                    : 'bg-basquiat-surface text-basquiat-muted border-2 border-basquiat-blue/30'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-basquiat-yellow' : 'bg-basquiat-surface'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Card>
            <form onSubmit={handleApplicationSubmit}>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && 'Personal Information'}
                  {currentStep === 2 && 'Community Details'}
                  {currentStep === 3 && 'Review & Submit'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-basquiat-text mb-2">
                          Display Name *
                        </label>
                        <Input
                          required
                          value={applicationData.displayName}
                          onChange={(e) => updateApplicationData('displayName', e.target.value)}
                          placeholder="How should we call you?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-basquiat-text mb-2">
                          Pronouns
                        </label>
                        <Input
                          value={applicationData.pronouns}
                          onChange={(e) => updateApplicationData('pronouns', e.target.value)}
                          placeholder="she/her, he/him, they/them"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-basquiat-text mb-2">
                        Bio *
                      </label>
                      <Textarea
                        required
                        rows={4}
                        value={applicationData.bio}
                        onChange={(e) => updateApplicationData('bio', e.target.value)}
                        placeholder="Tell us about yourself and what brings you to our community..."
                      />
                    </div>
                  </>
                )}

                {/* Step 2: Community Details */}
                {currentStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-basquiat-text mb-2">
                        Ballroom Experience
                      </label>
                      <select
                        value={applicationData.ballroomExperience}
                        onChange={(e) => updateApplicationData('ballroomExperience', e.target.value)}
                        className="w-full px-3 py-2 bg-basquiat-surface border-2 border-basquiat-blue/30 rounded-basquiat text-basquiat-text"
                      >
                        <option value="">Select your experience level</option>
                        <option value="none">New to ballroom culture</option>
                        <option value="beginner">Beginner (0-1 years)</option>
                        <option value="intermediate">Intermediate (1-3 years)</option>
                        <option value="advanced">Advanced (3+ years)</option>
                        <option value="legend">Legendary status</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-basquiat-text mb-2">
                        House Interest
                      </label>
                      <select
                        value={applicationData.interestedHouse}
                        onChange={(e) => updateApplicationData('interestedHouse', e.target.value)}
                        className="w-full px-3 py-2 bg-basquiat-surface border-2 border-basquiat-blue/30 rounded-basquiat text-basquiat-text"
                      >
                        <option value="">Choose a house that interests you</option>
                        {houses.map((house) => (
                          <option key={house.id} value={house.id}>
                            {house.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-basquiat-text mb-2">
                        Social Links (Optional)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          type="url"
                          value={applicationData.socialLinks.instagram}
                          onChange={(e) => updateApplicationData('socialLinks.instagram', e.target.value)}
                          placeholder="Instagram URL"
                        />
                        <Input
                          type="url"
                          value={applicationData.socialLinks.twitter}
                          onChange={(e) => updateApplicationData('socialLinks.twitter', e.target.value)}
                          placeholder="Twitter/X URL"
                        />
                        <Input
                          type="url"
                          value={applicationData.socialLinks.tiktok}
                          onChange={(e) => updateApplicationData('socialLinks.tiktok', e.target.value)}
                          placeholder="TikTok URL"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-basquiat-yellow">Review Your Application</h3>
                    <div className="grid gap-4">
                      <div>
                        <strong className="text-basquiat-text">Email:</strong> {email}
                      </div>
                      <div>
                        <strong className="text-basquiat-text">Name:</strong> {applicationData.displayName}
                      </div>
                      {applicationData.pronouns && (
                        <div>
                          <strong className="text-basquiat-text">Pronouns:</strong> {applicationData.pronouns}
                        </div>
                      )}
                      <div>
                        <strong className="text-basquiat-text">Bio:</strong> 
                        <p className="text-basquiat-muted mt-1">{applicationData.bio}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Previous
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowApplication(false)}
                    >
                      Back to Login
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={
                        (currentStep === 1 && (!applicationData.displayName || !applicationData.bio))
                      }
                    >
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-basquiat-yellow text-basquiat-bg"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Application'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Crown className="w-16 h-16 text-basquiat-yellow mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-2">
            <span className="basquiat-text-gradient">Haus</span>
          </h1>
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-basquiat-blue">of</span>{' '}
            <span className="basquiat-text-gradient">Basquiat</span>
          </h2>
          <p className="text-basquiat-muted">
            Enter your email to sign in or apply for membership
          </p>
        </div>

        {/* Sign In Form */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Join our vibrant ballroom community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-basquiat-text mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-basquiat-muted" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !validateEmail(email)}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <div className="text-center text-xs text-basquiat-muted">
          <p>
            By continuing, you agree to our community guidelines and 
            commitment to creating a safe, inclusive space for all.
          </p>
        </div>
      </div>
    </div>
  )
}
