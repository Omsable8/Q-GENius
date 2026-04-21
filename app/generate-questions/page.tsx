'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Sparkles, Send, Download, BookOpen, Target, Flame, GraduationCap, Hash, FileText, BrainCircuit, History } from 'lucide-react'
import Link from 'next/link'

const API_BASE_URL = 'http://localhost:5000'
interface Message {
  type: 'user' | 'assistant'
  content: string | undefined
  timestamp: Date
}

interface FormState {
  subject: string
  topic: string
  type: string
  difficulty: string
  grade: string
  numQuestions: string
  additionalPrompt: string
}

export default function GenerateQuestionsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "Hello! 👋 I'm ready to help you generate custom MCQs. Let's start by filling in some details. What subject would you like to create questions for? (Physics, Chemistry, Maths, or Biology)",
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormState>({
    subject: '',
    topic: '',
    type: '',
    difficulty: '',
    grade: '',
    numQuestions: '',
    additionalPrompt: '',
  })
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const quickTemplates = [
    'Grade 12 Calculus - Differentiation',
    'Cell Biology Basics - Organelles',
    'Physics Kinematics - Motion in 1D',
    'Organic Chemistry - Functional Groups',
  ]
  const blueprintItems = [
    { key: 'subject', label: 'Subject', value: formData.subject, icon: BookOpen },
    { key: 'topic', label: 'Topic', value: formData.topic, icon: Target },
    { key: 'type', label: 'Type', value: formData.type, icon: BrainCircuit },
    { key: 'difficulty', label: 'Difficulty', value: formData.difficulty, icon: Flame },
    { key: 'grade', label: 'Grade', value: formData.grade ? `Grade ${formData.grade}` : '', icon: GraduationCap },
    { key: 'numQuestions', label: 'Questions', value: formData.numQuestions, icon: Hash },
    { key: 'additionalPrompt', label: 'Prompt', value: formData.additionalPrompt, icon: FileText },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const steps = [
    {
      label: 'Subject',
      key: 'subject',
      options: ['Physics', 'Chemistry', 'Maths', 'Biology'],
      message: 'Great! Now, which topic would you like to focus on?',
    },
    {
      label: 'Topic',
      key: 'topic',
      message: 'Which type of questions? (Numeric / Non-numeric)',
    },
    {
      label: 'Type',
      key: 'type',
      options: ['Numeric', 'Non-Numeric'],
      message: 'What difficulty level would you prefer? (Easy, Medium, Hard)',
    },
    {
      label: 'Difficulty',
      key: 'difficulty',
      options: ['Easy', 'Medium', 'Hard'],
      message: 'Which grade level? (10, 11, or 12)',
    },
    {
      label: 'Grade',
      key: 'grade',
      options: ['10', '11', '12'],
      message: 'How many questions would you like to generate?',
    },
    {
      label: 'Number of Questions',
      key: 'numQuestions',
      message: 'Any additional requirements or prompts? (Optional - you can skip this)',
    },
    {
      label: 'Additional Prompt',
      key: 'additionalPrompt'
    }
  ]
  const getCookie = (name: string): string => {
    const nameLenPlus = name.length + 1;
    return (
      document.cookie
        .split(';')
        .map(c => c.trim())
        .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
        .map(cookie => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || ''
    );
  };
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Update form data
    const currentStep = steps[step]
    if (currentStep && currentStep.key !== 'additionalPrompt') {
      setFormData(prev => ({ ...prev, [currentStep.key]: inputValue }))
    } else if (step === steps.length - 1) {
      setFormData(prev => ({ ...prev, additionalPrompt: inputValue }))
    }

    setLoading(true)

    // Generate assistant response
    if (step < steps.length - 1) {
      setTimeout(() => {
        const assistantMessage: Message = {
          type: 'assistant',
          content: steps[step].message,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
        setStep(prev => prev + 1)
        setLoading(false)
      }, 300)
    } else if (step === steps.length - 1) {
      // Generate questions on final step
      try {
        const response = await fetch(API_BASE_URL+'/api/generate_questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' ,'X-CSRF-TOKEN':getCookie('csrf_access_token')},
          credentials:'include',
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error('Failed to generate questions')
        }

        const data = await response.json()
        setGeneratedQuestions(data.questions || [])

        const assistantMessage: Message = {
          type: 'assistant',
          content: `Perfect! I've generated ${data.questions?.length || 0} questions for you. You can review them below and download if you're satisfied.`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      } catch (error) {
        toast.error('Failed to generate questions')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDownload = () => {
    if (generatedQuestions.length === 0) return

    const content = generatedQuestions.join('\n\n' + '─'.repeat(50) + '\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-questions.txt'
    a.click()
    toast.success('Downloaded successfully!')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-20 h-[34rem] w-[34rem] rounded-full bg-[#8CA9FF]/20 blur-[120px]"
        animate={{ x: [0, 30, 0], y: [0, 24, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[36rem] w-[36rem] rounded-full bg-[#FFF2C6]/30 blur-[120px]"
        animate={{ x: [0, -26, 0], y: [0, -20, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-[#AAC4F5]/40 bg-white/85 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-[#8CA9FF]" />
            <span className="font-bold text-lg text-slate-900">Q-GENius</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:bg-[#AAC4F5]/30 hover:text-slate-900">Dashboard</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-slate-700 hover:bg-[#AAC4F5]/30 hover:text-slate-900">Profile</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8 py-4 lg:py-6"
      >
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mb-2 bg-gradient-to-r from-[#8CA9FF] to-blue-600 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">Generate Questions</h1>
            <p className="text-lg text-slate-600">
              Create custom MCQs using our interactive chat interface
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">Current Step</p>
              <p className="text-sm font-semibold text-slate-900">{step + 1}/{steps.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">Messages</p>
              <p className="text-sm font-semibold text-slate-900">{messages.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/50 bg-white/70 p-6 shadow-2xl backdrop-blur-xl lg:min-h-[calc(100vh-12.5rem)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 self-start lg:sticky lg:top-28 lg:col-span-3">
            <Card className="border border-slate-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <History className="h-5 w-5 text-[#8CA9FF]" />
                  Chat History
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Full conversation timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.type}-${index}`}
                      className={`rounded-xl border px-3 py-2 ${
                        message.type === 'user'
                          ? 'border-[#8CA9FF]/35 bg-[#8CA9FF]/8'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-semibold uppercase tracking-wide ${
                          message.type === 'user' ? 'text-[#8CA9FF]' : 'text-slate-500'
                        }`}>
                          {message.type === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <span className="text-[11px] text-slate-400" suppressHydrationWarning>
                          {isMounted
                            ? message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--:--'}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-700">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Progress Tracker</CardTitle>
                <CardDescription className="text-slate-600">Live completion journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {steps.map((s, index) => (
                  <div
                    key={index}
                      className={`flex items-center gap-3 rounded-xl p-2 transition-all duration-300 ${
                        index <= step ? 'bg-[#AAC4F5]/20' : 'opacity-50'
                      }`}
                  >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          index < step
                            ? 'bg-[#8CA9FF] text-white'
                            : index === step
                              ? 'bg-[#AAC4F5] text-slate-900'
                              : 'bg-[#FFF2C6] text-slate-600'
                        }`}
                      >
                        {index < step ? '✓' : index + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{s.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-6">
            <Card className="flex h-[680px] lg:h-[calc(100vh-18rem)] min-h-[620px] flex-col border border-slate-100 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-slate-900">Question Generation Assistant</CardTitle>
                <CardDescription className="text-slate-600">Let's create your MCQs together</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-3 lg:max-w-md ${
                        message.type === 'user'
                          ? 'rounded-br-md bg-[#8CA9FF] text-white'
                          : 'rounded-bl-md border border-[#AAC4F5]/25 bg-white text-slate-800'
                      }`}
                    >
                      <p className="text-base leading-relaxed">{message.content}</p>
                      <span className="mt-1 block text-xs opacity-70" suppressHydrationWarning>
                        {isMounted
                          ? message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '--:--'}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-[#AAC4F5]/25 bg-white px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#8CA9FF] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#8CA9FF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#8CA9FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="border-t border-slate-100 p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type your response..."
                    className="text-baseborder-[#AAC4F5]/40 bg-white/80 text-slate-800 shadow-[0_8px_25px_rgba(15,23,42,0.08)] backdrop-blur-md placeholder:text-slate-500 focus:ring-2 focus:ring-[#8CA9FF]/50"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !inputValue.trim()}
                    className="bg-[#8CA9FF] text-white shadow-[0_10px_24px_rgba(140,169,255,0.45)] transition-all duration-300 hover:bg-[#7F9DFA] hover:scale-[1.03]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6 self-start lg:sticky lg:top-28 lg:col-span-3">
            <Card className="border border-slate-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Inspiration</CardTitle>
                <CardDescription className="text-slate-600">Quick start templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickTemplates.map((template, index) => (
                    <motion.button
                      key={template}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setInputValue(template)}
                      className="group flex w-full items-start justify-between rounded-xl border border-[#FFF2C6] bg-[#FFF8DE] p-3 text-left transition-all duration-300 hover:border-[#8CA9FF]/60"
                    >
                      <span className="text-base text-slate-700">{template}</span>
                      <Sparkles className="mt-0.5 h-4 w-4 text-[#8CA9FF] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Live Blueprint</CardTitle>
                <CardDescription className="text-slate-600">Parameters update in real time</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {blueprintItems.map((item) => {
                  const Icon = item.icon
                  return item.value ? (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, scale: 0.9, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#8CA9FF]/50 bg-[#AAC4F5]/25 px-3 py-1.5 text-sm font-medium text-slate-800"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#8CA9FF]" />
                      <span>{item.label}: {item.value}</span>
                    </motion.div>
                  ) : (
                    <div
                      key={item.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#AAC4F5]/70 bg-[#FFF8DE]/65 px-3 py-1.5 text-xs text-slate-500"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#AAC4F5]" />
                      <span>{item.label}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Generated Questions Preview */}
            {generatedQuestions.length > 0 && (
              <Card className="border border-slate-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">Generated Questions</CardTitle>
                  <CardDescription className="text-slate-600">{generatedQuestions.length} questions ready</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {generatedQuestions.slice(0, 3).map((q, i) => (
                      <div key={i} className="rounded-lg border border-[#FFF2C6] bg-[#FFF8DE] p-2 text-xs text-slate-700 truncate">
                        {i + 1}. {q}
                      </div>
                    ))}
                    {generatedQuestions.length > 3 && (
                      <p className="text-xs text-slate-500 text-center py-2">
                        +{generatedQuestions.length - 3} more questions
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-[#AAC4F5] hover:bg-[#98B7EC] text-slate-900 text-sm"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download All
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  )
}
