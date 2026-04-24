'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Plus, BookOpen, Zap, BarChart3, Settings, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { authenticatedFetch } from '@/lib/authenticatedFetch'
export default function DashboardPage() {
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [stats, setStats] = useState({ questionsGenerated: 0, distractorsCreated: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const pathname = usePathname()

  // Helper to format timestamps (Simple version)
  const formatTimeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Check if date is valid
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setIsHistoryLoading(true);

      // 1. Try to load everything from session storage first
      const cachedStats = sessionStorage.getItem('user_stats');
      const cachedHistory = sessionStorage.getItem('user_history');

      if (cachedStats && cachedHistory) {
        setStats(JSON.parse(cachedStats));
        setRecentItems(JSON.parse(cachedHistory));
        setIsLoading(false);
        setIsHistoryLoading(false);
        return;
      }

      try {
        // 2. Fetch Stats and History if cache is empty
        const [statsResp, histResp] = await Promise.all([
          fetch('http://localhost:5000/api/get_stats', { credentials: 'include' }),
          fetch('http://localhost:5000/api/get_history', { credentials: 'include' })
        ]);

        if (statsResp.ok && histResp.ok) {
          const statsData = await statsResp.json();
          const histData = await histResp.json();

          // 3. Process Stats
          const newStats = {
            questionsGenerated: statsData.q_gen || 0,
            distractorsCreated: statsData.dist_gen || 0,
          };
          const combinedRaw = [
            ...histData.ques_hist.map((q: any) => ({
              title: `${q[0]}: ${q[1]}`,
              rawDate: new Date(q[3]),
              type: 'questions',
              count: q[2]
            })),
            ...histData.distr_hist.map((d: any) => ({
              title: d[0].length > 40 ? d[0].substring(0, 40) + '...' : d[0],
              rawDate: new Date(d[1]),
              type: 'options',
              count: 3
            }))
          ];
          
          const finalItems = combinedRaw
          .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
          .slice(0, 3)
          .map(item => ({
            ...item,
            date: formatTimeAgo(item.rawDate) // Now formatted correctly
          }));

          // 5. Update State and Session Storage
          setStats(newStats);
          setRecentItems(finalItems);
          sessionStorage.setItem('user_stats', JSON.stringify(newStats));
          sessionStorage.setItem('user_history', JSON.stringify(finalItems));
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setIsLoading(false);
        setIsHistoryLoading(false);
      }
    };

    fetchDashboardData();
  }, [pathname]);

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
        sessionStorage.clear() // clean access/refresh, user_stats and user_history
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
        <div className="grid md:grid-cols-2 gap-6 mb-12">
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
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          {isHistoryLoading ? (
            <div className="text-center py-10 text-muted-foreground animate-pulse">Loading recent activity...</div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
              No recent activity found. Start generating!
            </div>
          ) : (
            recentItems.map((item, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.date}</p>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.type === 'questions' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                          }`}>
                          {item.type === 'questions' ? '📝 Questions' : '⚡ Distractors'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
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
            ))
          )}
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
