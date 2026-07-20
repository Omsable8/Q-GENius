'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, ArrowLeft, BookOpen, Zap, X, Calendar, Target, Flame, GraduationCap, Hash, FileText, CheckCircle } from 'lucide-react'
import { authenticatedFetch } from '@/lib/authenticatedFetch'
import { ErrorBanner } from '@/components/error-banner'

interface HistoryItem {
  id: string
  title: string
  rawDate: Date
  date: string
  type: 'questions' | 'options'
  count: number
}

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

export default function HistoryPage() {
  const [questionsHistory, setQuestionsHistory] = useState<HistoryItem[]>([])
  const [optionsHistory, setOptionsHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'questions' | 'options'>('questions')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewData, setViewData] = useState<ViewData | null>(null)
  const [viewType, setViewType] = useState<'questions' | 'options'>('questions')
  const [viewLoading, setViewLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatTimeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return 'Recently'
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffInSeconds < 60) return 'Just now'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const response = await authenticatedFetch('/api_flask/get_entire_history', {
          method: 'GET',
        })
        if (response.ok) {
          const data = await response.json()

          // Process questions history
          const processedQuestions = (data.ques_hist || []).map((q: any) => ({
            id: q[4],
            title: `${q[0]}: ${q[1]}`,
            rawDate: new Date(q[3]),
            date: formatTimeAgo(new Date(q[3])),
            type: 'questions' as const,
            count: q[2]
          })).sort((a: HistoryItem, b: HistoryItem) => b.rawDate.getTime() - a.rawDate.getTime())

          // Process options/distractors history
          const processedOptions = (data.distr_hist || []).map((d: any) => ({
            id: d[2],
            title: d[0].length > 60 ? d[0].substring(0, 60) + '...' : d[0],
            rawDate: new Date(d[1]),
            date: formatTimeAgo(new Date(d[1])),
            type: 'options' as const,
            count: 3
          })).sort((a: HistoryItem, b: HistoryItem) => b.rawDate.getTime() - a.rawDate.getTime())

          setQuestionsHistory(processedQuestions)
          setOptionsHistory(processedOptions)
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
        setError('Failed to fetch history: '+error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const handleView = async (type: 'questions' | 'options', id: string) => {
    setViewLoading(true)
    setViewType(type)
    setViewModalOpen(true)

    try {
      const response = await authenticatedFetch('/api_flask/get_full_view', {
        method: 'POST',
        body: JSON.stringify({
          type: type,
          id: type === 'questions' ? id : id, // question_id or options_id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setViewData(data)
      }
    } catch (error) {
      console.error('Failed to fetch view data:', error)
      setError('Failed to fetch view data: '+error)
    } finally {
      setViewLoading(false)
    }
  }

  const closeModal = () => {
    setViewModalOpen(false)
    setViewData(null)
  }

  const currentHistory = activeTab === 'questions' ? questionsHistory : optionsHistory

  return (
    <div className="relative min-h-screen overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Background blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-20 h-[34rem] w-[34rem] rounded-full bg-[#8CA9FF]/15 blur-[120px]"
        animate={{ x: [0, 26, 0], y: [0, 22, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[36rem] w-[36rem] rounded-full bg-[#FFF2C6]/25 blur-[120px]"
        animate={{ x: [0, -22, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-[#AAC4F5]/35 bg-white/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-[#8CA9FF]" />
            <span className="text-lg font-bold text-slate-900">Q-GENius</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:bg-[#AAC4F5]/35 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-[#8CA9FF] to-blue-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            History
          </h1>
          <p className="text-lg text-slate-600">
            View all your generated questions and distractors
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'questions'
                ? 'bg-[#8CA9FF] text-white shadow-lg shadow-[#8CA9FF]/30'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-[#8CA9FF]/50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Questions ({questionsHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'options'
                ? 'bg-[#AAC4F5] text-slate-900 shadow-lg shadow-[#AAC4F5]/30'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-[#AAC4F5]/50'
            }`}
          >
            <Zap className="w-5 h-5" />
            Distractors ({optionsHistory.length})
          </button>
        </div>

        {/* History List */}
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="border border-slate-200 bg-white shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-3/4 animate-pulse rounded-md bg-[#AAC4F5]/40" />
                        <div className="h-4 w-24 animate-pulse rounded-md bg-[#AAC4F5]/30" />
                        <div className="flex gap-2">
                          <div className="h-6 w-24 animate-pulse rounded-full bg-[#AAC4F5]/30" />
                          <div className="h-6 w-16 animate-pulse rounded-full bg-[#AAC4F5]/30" />
                        </div>
                      </div>
                      <div className="h-8 w-16 animate-pulse rounded-md bg-[#AAC4F5]/30" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentHistory.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF2C6] flex items-center justify-center">
                {activeTab === 'questions' ? (
                  <BookOpen className="w-8 h-8 text-[#8CA9FF]" />
                ) : (
                  <Zap className="w-8 h-8 text-[#AAC4F5]" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No {activeTab === 'questions' ? 'questions' : 'distractors'} yet
              </h3>
              <p className="text-slate-600 mb-6">
                Start generating to see your history here
              </p>
              <Link href={activeTab === 'questions' ? '/generate-questions' : '/generate-options'}>
                <Button className="bg-[#8CA9FF] text-white hover:bg-[#7F9DFA]">
                  Generate {activeTab === 'questions' ? 'Questions' : 'Distractors'}
                </Button>
              </Link>
            </div>
          ) : (
            currentHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-500 mb-2">{item.date}</p>
                        <div className="flex gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            item.type === 'questions' 
                              ? 'bg-[#8CA9FF]/10 text-[#8CA9FF]' 
                              : 'bg-[#AAC4F5]/20 text-slate-700'
                          }`}>
                            {item.type === 'questions' ? 'Questions' : 'Distractors'}
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFF2C6] text-slate-700 font-medium">
                            {item.count} items
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[#8CA9FF] hover:bg-[#8CA9FF]/10"
                        onClick={() => handleView(item.type, item.id)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

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
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                {viewType === 'questions' ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8CA9FF]/15">
                    <BookOpen className="h-5 w-5 text-[#8CA9FF]" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AAC4F5]/20">
                    <Zap className="h-5 w-5 text-[#AAC4F5]" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {viewType === 'questions' ? 'Question Details' : 'Distractor Details'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {viewType === 'questions' ? 'Generated questions and metadata' : 'Options and analysis'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
              {viewLoading ? (
                <div className="space-y-4">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-[#AAC4F5]/40" />
                  <div className="h-4 w-3/4 animate-pulse rounded-md bg-[#AAC4F5]/30" />
                  <div className="h-32 w-full animate-pulse rounded-xl bg-[#FFF2C6]/50" />
                  <div className="h-32 w-full animate-pulse rounded-xl bg-[#FFF2C6]/50" />
                </div>
              ) : viewData ? (
                viewType === 'questions' ? (
                  <QuestionView data={viewData as QuestionViewData} />
                ) : (
                  <OptionView data={viewData as OptionViewData} />
                )
              ) : (
                <p className="text-center text-slate-500">No data available</p>
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
        <div className="rounded-xl border border-slate-200 bg-[#FFF8DE] p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <BookOpen className="h-4 w-4" />
            Subject
          </div>
          <p className="font-semibold text-slate-900">{data.subject}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#FFF8DE] p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <Target className="h-4 w-4" />
            Topic
          </div>
          <p className="font-semibold text-slate-900">{data.topic}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#FFF8DE] p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <FileText className="h-4 w-4" />
            Type
          </div>
          <p className="font-semibold text-slate-900">{data.type}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#FFF8DE] p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <Flame className="h-4 w-4" />
            Difficulty
          </div>
          <p className="font-semibold text-slate-900">{data.difficulty}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#FFF8DE] p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <GraduationCap className="h-4 w-4" />
            Grade
          </div>
          <p className="font-semibold text-slate-900">Grade {data.grade}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#FFF8DE] p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <Calendar className="h-4 w-4" />
            Created
          </div>
          <p className="font-semibold text-slate-900">{new Date(data.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
          <Hash className="h-5 w-5 text-[#8CA9FF]" />
          Generated Questions ({data.questions?.length || 0})
        </h3>
        <div className="space-y-3">
          {data.questions?.map((question, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#AAC4F5]/30 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8CA9FF]/15 text-sm font-semibold text-[#8CA9FF]">
                  {index + 1}
                </span>
                <p className="text-slate-800 leading-relaxed">{question}</p>
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
      <div className="rounded-xl border border-[#AAC4F5]/30 bg-[#FFF8DE] p-4">
        <p className="text-sm text-slate-600 mb-2">Original Question</p>
        <p className="text-lg font-medium text-slate-900">{data.question}</p>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2">
          <span className="text-sm text-slate-600">Type: </span>
          <span className="font-semibold text-slate-900">{data.question_type}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2">
          <span className="text-sm text-slate-600">Created: </span>
          <span className="font-semibold text-slate-900">{new Date(data.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
          <Zap className="h-5 w-5 text-[#AAC4F5]" />
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
