'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Sparkles, Send, Download, BookOpen, Target, Flame, GraduationCap, Hash, FileText, BrainCircuit, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { authenticatedFetch } from '@/lib/authenticatedFetch'
import { ErrorBanner } from '@/components/error-banner'

const API_BASE_URL = 'http://localhost:5000'

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
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormState>({
    subject: '',
    topic: '',
    type: '',
    difficulty: '',
    grade: '',
    numQuestions: '5',
    additionalPrompt: '',
  })
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  

  const subjects = ['Physics', 'Chemistry', 'Maths', 'Biology']
  const questionTypes = ['Numeric', 'Non-Numeric']
  const difficulties = ['Easy', 'Medium', 'Hard']
  const grades = ['10', '11', '12']
  const numOptions = ['3', '5', '10', '15', '20']

  const blueprintItems = [
    { key: 'subject', label: 'Subject', value: formData.subject, icon: BookOpen },
    { key: 'topic', label: 'Topic', value: formData.topic, icon: Target },
    { key: 'type', label: 'Type', value: formData.type, icon: BrainCircuit },
    { key: 'difficulty', label: 'Difficulty', value: formData.difficulty, icon: Flame },
    { key: 'grade', label: 'Grade', value: formData.grade ? `Grade ${formData.grade}` : '', icon: GraduationCap },
    { key: 'numQuestions', label: 'Questions', value: formData.numQuestions, icon: Hash },
    { key: 'additionalPrompt', label: 'Prompt', value: formData.additionalPrompt, icon: FileText },
  ]

  const handleGenerate = async () => {
    if (!formData.subject || !formData.topic || !formData.type || !formData.difficulty || !formData.grade) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await authenticatedFetch(API_BASE_URL + '/api/generate_questions', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      setGeneratedQuestions(data.questions || [])

      sessionStorage.removeItem('user_history')
    } catch (error) {
      setError('Failed to generate questions. Error: '+error)
      console.error(error)
    } finally {
      setLoading(false)
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

  const SelectField = ({
    label,
    value,
    options,
    onChange,
    icon: Icon,
    placeholder = 'Select...',
  }: {
    label: string
    value: string
    options: string[]
    onChange: (val: string) => void
    icon: any
    placeholder?: string
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-[#8CA9FF]" />
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#AAC4F5]/40 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 shadow-sm focus:border-[#8CA9FF] focus:outline-none focus:ring-2 focus:ring-[#8CA9FF]/20 transition-all cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="h-4 w-4 text-[#8CA9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )

  const RadioGroup = ({
    label,
    value,
    options,
    onChange,
    icon: Icon,
  }: {
    label: string
    value: string
    options: string[]
    onChange: (val: string) => void
    icon: any
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-[#8CA9FF]" />
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
              value === opt
                ? 'bg-[#8CA9FF] text-white shadow-md shadow-[#8CA9FF]/25'
                : 'border border-[#AAC4F5]/40 bg-white text-slate-600 hover:border-[#8CA9FF]/60 hover:bg-[#AAC4F5]/10'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )

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
              Create custom MCQs using our interactive form
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/50 bg-white/70 p-6 shadow-2xl backdrop-blur-xl lg:min-h-[calc(100vh-12.5rem)] lg:p-8">
          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* LEFT: Form */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border border-slate-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <Sparkles className="h-5 w-5 text-[#8CA9FF]" />
                    Question Configuration
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Fill in the details to generate your MCQs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  {/* Subject - Drop Down */}
                  <SelectField
                    label="Subject"
                    value={formData.subject}
                    options={subjects}
                    onChange={(val) => setFormData(prev => ({ ...prev, subject: val }))}
                    icon={BookOpen}
                  />

                  {/* Topic - Text Input */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <Target className="h-4 w-4 text-[#8CA9FF]" />
                      Topic
                    </label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="e.g. Kinematics, Organic Chemistry, Calculus..."
                      className="rounded-xl border-[#AAC4F5]/40 bg-white text-slate-800 placeholder:text-slate-400 focus:border-[#8CA9FF] focus:ring-2 focus:ring-[#8CA9FF]/20"
                    />
                  </div>

                  {/* Question Type - Radio */}
                  <RadioGroup
                    label="Question Type"
                    value={formData.type}
                    options={questionTypes}
                    onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                    icon={BrainCircuit}
                  />

                  {/* Difficulty - Radio */}
                  <RadioGroup
                    label="Difficulty"
                    value={formData.difficulty}
                    options={difficulties}
                    onChange={(val) => setFormData(prev => ({ ...prev, difficulty: val }))}
                    icon={Flame}
                  />

                  {/* Grade - Radio */}
                  <RadioGroup
                    label="Grade"
                    value={formData.grade}
                    options={grades}
                    onChange={(val) => setFormData(prev => ({ ...prev, grade: val }))}
                    icon={GraduationCap}
                  />

                  {/* Number of Questions - Select */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <Hash className="h-4 w-4 text-[#8CA9FF]" />
                      Number of Questions
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.numQuestions}
                      onChange={(e) => setFormData(prev => ({ ...prev, numQuestions: e.target.value }))}
                      placeholder="e.g. 5"
                      className="rounded-xl border-[#AAC4F5]/40 bg-white text-slate-800 placeholder:text-slate-400 focus:border-[#8CA9FF] focus:ring-2 focus:ring-[#8CA9FF]/20"
                    />
                  </div>

                  {/* Additional Prompt - Textarea */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <FileText className="h-4 w-4 text-[#8CA9FF]" />
                      Additional Requirements <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={formData.additionalPrompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalPrompt: e.target.value }))}
                      placeholder="Any specific requirements, constraints, or focus areas..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-[#AAC4F5]/40 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#8CA9FF] focus:outline-none focus:ring-2 focus:ring-[#8CA9FF]/20 transition-all"
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-[#8CA9FF] text-white shadow-[0_10px_24px_rgba(140,169,255,0.45)] transition-all duration-300 hover:bg-[#7F9DFA] hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 h-11 text-base font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                  <ErrorBanner message={error} onDismiss={() => setError(null)} />
                </CardContent>
              </Card>
            </div>

            
            {/* RIGHT: Blueprint + Results */}
            <div className="space-y-6 self-start lg:sticky lg:top-28 lg:col-span-7">
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

              {/* Generated Questions Preview - NO TRUNCATE */}
              {generatedQuestions.length > 0 && (
                <Card className="border border-slate-100 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Generated Questions</CardTitle>
                    <CardDescription className="text-slate-600">{generatedQuestions.length} questions ready</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                      {generatedQuestions.map((q, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-lg border border-[#FFF2C6] bg-[#FFF8DE] p-3 text-sm text-slate-700 leading-relaxed"
                        >
                          <span className="font-semibold text-[#8CA9FF] mr-1">{i + 1}.</span>
                          {q}
                        </motion.div>
                      ))}
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