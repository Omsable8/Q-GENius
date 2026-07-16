'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Plus, BookOpen, Zap, LogOut, Flame, GraduationCap, Calendar, Hash, X, FileText, Target, CheckCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { authenticatedFetch } from '@/lib/authenticatedFetch'
import { motion } from 'framer-motion'

interface QuestionViewData {
  subject: string
  topic: string
  type: string
  difficulty: string
  grade: string
  created_at: string
  questions: string[]
}

interface OptionViewData {
  question: string
  question_type: string
  created_at: string
  correct: string
  fact: string
  process: string
  accuracy: string
}

type ViewData = QuestionViewData | OptionViewData

export default function DashboardPage() {
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [stats, setStats] = useState({ questionsGenerated: 0, distractorsCreated: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const pathname = usePathname()
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewData, setViewData] = useState<ViewData | null>(null)
  const [viewType, setViewType] = useState<'questions' | 'options'>('questions')
  const [viewLoading, setViewLoading] = useState(false)

  const handleView = async (type: 'questions' | 'options', id: string) => {
    setViewLoading(true)
    setViewType(type)
    setViewModalOpen(true)

    try {
      const response = await authenticatedFetch('/api_flask/get_full_view', {
        method: 'POST',
        body: JSON.stringify({
          type: type,
          id: id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setViewData(data)
      }
    } catch (error) {
      console.error('Failed to fetch view data:', error)
    } finally {
      setViewLoading(false)
    }
  }

  const closeModal = () => {
    setViewModalOpen(false)
    setViewData(null)
  }

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
          fetch('/api_flask/get_stats', { credentials: 'include' }),
          fetch('/api_flask/get_history', { credentials: 'include' })
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
              id: q[4],
              title: `${q[0]}: ${q[1]}`,
              rawDate: new Date(q[3]),
              type: 'questions',
              count: q[2]
            })),
            ...histData.distr_hist.map((d: any) => ({
              id: d[2],
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
      const response = await fetch('/api_flask/logout', {
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
          <Link href="/history">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              View All
            </Button>
          </Link>
        </div>
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
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => handleView(item.type, item.id)}>
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
      
      {/* View Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                {viewType === 'questions' ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                    <Zap className="h-5 w-5 text-secondary" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {viewType === 'questions' ? 'Question Details' : 'Distractor Details'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {viewType === 'questions' ? 'Generated questions and metadata' : 'Options and analysis'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
              {viewLoading ? (
                <div className="space-y-4">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-secondary/40" />
                  <div className="h-4 w-3/4 animate-pulse rounded-md bg-secondary/30" />
                  <div className="h-32 w-full animate-pulse rounded-xl bg-muted/50" />
                  <div className="h-32 w-full animate-pulse rounded-xl bg-muted/50" />
                </div>
              ) : viewData ? (
                viewType === 'questions' ? (
                  <QuestionView data={viewData as QuestionViewData} />
                ) : (
                  <OptionView data={viewData as OptionViewData} />
                )
              ) : (
                <p className="text-center text-muted-foreground">No data available</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}


function QuestionView({ data }: { data: QuestionViewData }) {
  return (
    <div className="space-y-6">
      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BookOpen className="h-4 w-4" />
            Subject
          </div>
          <p className="font-semibold text-foreground">{data.subject}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            Topic
          </div>
          <p className="font-semibold text-foreground">{data.topic}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            Type
          </div>
          <p className="font-semibold text-foreground">{data.type}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Flame className="h-4 w-4" />
            Difficulty
          </div>
          <p className="font-semibold text-foreground">{data.difficulty}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <GraduationCap className="h-4 w-4" />
            Grade
          </div>
          <p className="font-semibold text-foreground">Grade {data.grade}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            Created
          </div>
          <p className="font-semibold text-foreground">{new Date(data.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Hash className="h-5 w-5 text-primary" />
          Generated Questions ({data.questions?.length || 0})
        </h3>
        <div className="space-y-3">
          {data.questions?.map((question, index) => (
            <div
              key={index}
              className="rounded-xl border border-secondary/30 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="text-foreground leading-relaxed">{question}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OptionView({ data }: { data: OptionViewData }) {
  const options = [
    { type: 'correct', label: 'Correct Answer', value: data.correct, color: 'bg-green-50 border-green-200 text-green-700' },
    { type: 'fact', label: 'Fact-Based Distractor', value: data.fact, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { type: 'process', label: 'Process-Based Distractor', value: data.process, color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { type: 'accuracy', label: 'Accuracy-Based Distractor', value: data.accuracy, color: 'bg-slate-50 border-slate-200 text-slate-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="rounded-xl border border-secondary/30 bg-card p-4">
        <p className="text-sm text-muted-foreground mb-2">Original Question</p>
        <p className="text-lg font-medium text-foreground">{data.question}</p>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-border bg-white px-4 py-2">
          <span className="text-sm text-muted-foreground">Type: </span>
          <span className="font-semibold text-foreground">{data.question_type}</span>
        </div>
        <div className="rounded-xl border border-border bg-white px-4 py-2">
          <span className="text-sm text-muted-foreground">Created: </span>
          <span className="font-semibold text-foreground">{new Date(data.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Zap className="h-5 w-5 text-secondary" />
          Generated Options
        </h3>
        <div className="space-y-3">
          {options.map((option) => (
            <div
              key={option.type}
              className={`rounded-xl border p-4 ${option.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {option.type === 'correct' && <CheckCircle className="h-4 w-4" />}
                <span className="text-sm font-semibold">{option.label}</span>
              </div>
              <p className="text-slate-800">{option.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}