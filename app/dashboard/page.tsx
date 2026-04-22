'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Plus, BookOpen, Zap, BarChart3, Settings, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function DashboardPage() {
  const [recentItems] = useState([
    {
      title: 'Physics Kinematics Questions',
      date: '2 hours ago',
      type: 'questions',
      count: 5,
    },
    {
      title: 'Chemistry Reactions Distractors',
      date: 'Yesterday',
      type: 'options',
      count: 3,
    },
    {
      title: 'Maths Calculus Questions',
      date: '3 days ago',
      type: 'questions',
      count: 8,
    },
  ])

  const [stats, setStats] = useState({
    questionsGenerated: 0,
    distractorsCreated: 0,
    hoursSpent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  /*
   * Fetches user statistics from the database or session storage.
  */
  const pathname = usePathname();
  useEffect(() => {
    const getStats = async () => {
      setIsLoading(true)
      const cachedStats = sessionStorage.getItem('user_stats')
      
      if (cachedStats) {
        setStats(JSON.parse(cachedStats))
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('http://localhost:5000/api/get_stats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          const newStats = {
            questionsGenerated: data.q_gen || 0,
            distractorsCreated: data.dist_gen || 0,
            hoursSpent: 0,
          }
          setStats(newStats)
          sessionStorage.setItem('user_stats', JSON.stringify(newStats))
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getStats()
  }, [pathname])
  // Helper component for the stat value
  const StatValue = ({ value }: { value: number }) => (
    <p className="text-3xl font-bold text-foreground">
      {isLoading ? (
        <span className="animate-pulse">...</span>
      ) : (
        value.toLocaleString()
      )}
    </p>
  )
  /**
   * Handles user logout by calling the backend to unset JWT cookies.
  */
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        window.location.href = '/' // Redirect to landing page
      }
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Q-GENius</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Link href="/profile">
              <Button variant="ghost" size="sm">Profile</Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Ready to create more intelligent assessments?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/generate-options">
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Generate Distractors
                </CardTitle>
                <CardDescription>
                  Create smart options for a single question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enter one question and get three types of scientifically-designed distractors
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/generate-questions">
            <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20 hover:border-secondary/50 cursor-pointer transition-all duration-300 hover:shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-secondary" />
                  Generate Questions
                </CardTitle>
                <CardDescription>
                  Create multiple questions using chat interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Specify subject, topic, difficulty, and grade to generate bulk questions
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Questions Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatValue value={stats.questionsGenerated} />
              <p className="text-sm text-muted-foreground">Total questions created</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" />
                Distractors Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatValue value={stats.distractorsCreated} />
              <p className="text-sm text-muted-foreground">Smart options generated</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-muted" />
                Time Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatValue value={stats.hoursSpent} />
              <p className="text-sm text-muted-foreground">Estimated hours saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
            <Link href="/history">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {recentItems.map((item, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.date}</p>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {item.type === 'questions' ? '📝 Questions' : '⚡ Distractors'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
                          {item.count} items
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-muted/20 to-primary/10 border-border">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Check out our documentation and tutorials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <a href='https://doi.org/10.1007/978-3-031-36336-8_98'>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" >
                  📃 Read Paper
                </Button>
              </a>
              <a href='https://www.youtube.com/watch?v=BIY6XJ5S7ig'>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  🎥 Watch Tutorial
                </Button>
              </a>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                💬 Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
