'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Sparkles, Send, Download, Copy } from 'lucide-react'
import Link from 'next/link'

interface Message {
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface FormState {
  subject: string
  topic: string
  difficulty: string
  grade: string
  numQuestions: string
  additionalPrompt: string
}

export default function GenerateQuestionsPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: 'Hello! 👋 I&apos;m ready to help you generate custom MCQs. Let&apos;s start by filling in some details. What subject would you like to create questions for? (Physics, Chemistry, Maths, or Biology)',
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormState>({
    subject: '',
    topic: '',
    difficulty: '',
    grade: '',
    numQuestions: '',
    additionalPrompt: '',
  })
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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
  ]

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
          content: steps[step + 1].message,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
        setStep(prev => prev + 1)
        setLoading(false)
      }, 300)
    } else if (step === steps.length - 1) {
      // Generate questions on final step
      try {
        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error('Failed to generate questions')
        }

        const data = await response.json()
        setGeneratedQuestions(data.questions || [])

        const assistantMessage: Message = {
          type: 'assistant',
          content: `Perfect! I've generated ${data.questions?.length || 0} questions for you. You can review them below and download if you&apos;re satisfied.`,
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Q-GENius</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Generate Questions</h1>
          <p className="text-muted-foreground text-lg">
            Create custom MCQs using our interactive chat interface
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border h-96 lg:h-screen lg:max-h-96 flex flex-col">
              <CardHeader className="border-b border-border">
                <CardTitle>Question Generation Assistant</CardTitle>
                <CardDescription>Let&apos;s create your MCQs together</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-muted/30 text-foreground rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/30 px-4 py-3 rounded-lg rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type your response..."
                    className="bg-muted/30 border-border"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !inputValue.trim()}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Current Step */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {steps.map((s, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded ${
                        index <= step ? 'bg-primary/10' : 'opacity-50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < step
                            ? 'bg-primary text-white'
                            : index === step
                              ? 'bg-primary/50 text-white'
                              : 'bg-border text-muted-foreground'
                        }`}
                      >
                        {index < step ? '✓' : index + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Form Summary */}
            {Object.values(formData).some(v => v) && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Your Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {formData.subject && (
                    <div>
                      <span className="text-muted-foreground">Subject:</span>
                      <p className="font-medium text-foreground">{formData.subject}</p>
                    </div>
                  )}
                  {formData.topic && (
                    <div>
                      <span className="text-muted-foreground">Topic:</span>
                      <p className="font-medium text-foreground">{formData.topic}</p>
                    </div>
                  )}
                  {formData.difficulty && (
                    <div>
                      <span className="text-muted-foreground">Difficulty:</span>
                      <p className="font-medium text-foreground">{formData.difficulty}</p>
                    </div>
                  )}
                  {formData.grade && (
                    <div>
                      <span className="text-muted-foreground">Grade:</span>
                      <p className="font-medium text-foreground">Grade {formData.grade}</p>
                    </div>
                  )}
                  {formData.numQuestions && (
                    <div>
                      <span className="text-muted-foreground">Questions:</span>
                      <p className="font-medium text-foreground">{formData.numQuestions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Generated Questions Preview */}
            {generatedQuestions.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Generated Questions</CardTitle>
                  <CardDescription>{generatedQuestions.length} questions ready</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {generatedQuestions.slice(0, 3).map((q, i) => (
                      <div key={i} className="p-2 bg-muted/20 rounded text-xs text-foreground truncate">
                        {i + 1}. {q}
                      </div>
                    ))}
                    {generatedQuestions.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{generatedQuestions.length - 3} more questions
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-secondary hover:bg-secondary/90 text-foreground text-sm"
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
    </div>
  )
}
