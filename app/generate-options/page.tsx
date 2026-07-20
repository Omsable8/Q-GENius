'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Sparkles, Star, Copy, Download, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { authenticatedFetch } from '@/lib/authenticatedFetch'
import { ErrorBanner } from '@/components/error-banner'

interface GeneratedOption {
  type: 'fact' | 'process' | 'accuracy' | 'correct'
  text: string
}

interface GenerationResult {
  question: string
  correctAnswer: string
  options: GeneratedOption[]
}

export default function GenerateOptionsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitError, setRateLimitError] = useState(false)
  const [showRateLimitDialog, setShowRateLimitDialog] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    questionType: 'non-numerical',
    additionalPrompt: '',
  })
  const [results, setResults] = useState<GenerationResult | null>(null)
  const [ratings, setRatings] = useState<{ [key: string]: number }>({})
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: 'easeOut' },
    },
  }
  const cardStaggerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }
  const cardItemVariants: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.question.trim()) {
      setError('Please enter a question')
      return
    }

    setLoading(true)

    try {
      
      const response = await authenticatedFetch('http://localhost:5000/api/generate_options', {
        method: 'POST',
        body: JSON.stringify({
          question: formData.question,
          questionType: formData.questionType,
          additionalPrompt: formData.additionalPrompt,
        }),
      });

      if (response.status === 429) {
        setRateLimitError(true)
        setShowRateLimitDialog(true)
        setError('Rate limit exceeded. Please try again later.')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Failed to generate options')
        return
      }

      const options_data = await response.json()
      setResults(options_data)
      sessionStorage.removeItem('user_stats')
      setRatings({})
      toast.success('Options generated successfully!')
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRating = (optionType: string, rating: number) => {
    setRatings(prev => ({ ...prev, [optionType]: rating }))
  }

  const handleCopyOption = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    if (!results) return

    const content = `Question: ${results.question}
    Correct answer: ${results.correctAnswer}
Options:
${results.options.map(opt => `${opt.type.charAt(0).toUpperCase() + opt.type.slice(1)} - ${opt.text}`).join('\n\n')}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mcq-options.txt'
    a.click()
    toast.success('Downloaded successfully!')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
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
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-[#8CA9FF]" />
            <span className="text-lg font-bold text-slate-900">Q-GENius</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:bg-[#AAC4F5]/35 hover:text-slate-900">Dashboard</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-slate-700 hover:bg-[#AAC4F5]/35 hover:text-slate-900">Profile</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-[#8CA9FF] to-blue-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">Generate Options</h1>
          <p className="text-lg text-slate-600">
            Enter a question and we'll generate three types of scientifically-designed distractors
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl lg:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="self-start sticky top-28 lg:col-span-1">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
            <Card className="border border-[#AAC4F5]/30 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Generate Distractors</CardTitle>
                <CardDescription className="text-slate-600">One question at a time</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="question">Question *</FieldLabel>
                      <Textarea
                        id="question"
                        name="question"
                        placeholder="Enter your question here..."
                        value={formData.question}
                        onChange={handleChange}
                        className="min-h-32 rounded-xl border border-[#FFF2C6] bg-[#FFF8DE] text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-[#8CA9FF]/50 focus:border-[#8CA9FF]"
                      />
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {['Try: Kinematics', 'Try: Cell Biology', 'Try: Organic Chemistry'].map((quick) => (
                          <button
                            key={quick}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, question: quick.replace('Try: ', '') }))}
                            className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            {quick}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="questionType">Question Type *</FieldLabel>
                      <Select value={formData.questionType} onValueChange={(value) => setFormData(prev => ({ ...prev, questionType: value }))}>
                        <SelectTrigger className="rounded-xl border border-[#FFF2C6] bg-[#FFF8DE] text-slate-800 focus:ring-2 focus:ring-[#8CA9FF]/50 focus:border-[#8CA9FF]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border border-slate-200 bg-white">
                          <SelectItem value="numerical">Numerical</SelectItem>
                          <SelectItem value="non-numerical">Non-Numerical</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="additionalPrompt">Additional Prompt (Optional)</FieldLabel>
                      <Textarea
                        id="additionalPrompt"
                        name="additionalPrompt"
                        placeholder="Any specific requirements or constraints..."
                        value={formData.additionalPrompt}
                        onChange={handleChange}
                        className="min-h-24 rounded-xl border border-[#FFF2C6] bg-[#FFF8DE] text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-[#8CA9FF]/50 focus:border-[#8CA9FF]"
                      />
                    </Field>
                  </FieldGroup>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#8CA9FF] py-6 font-semibold text-white shadow-lg shadow-[#8CA9FF]/40 transition-all duration-300 hover:bg-[#7F9DFA] hover:shadow-xl hover:shadow-[#8CA9FF]/45"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Generating...
                      </span>
                    ) : (
                      'Generate Options'
                    )}
                  </Button>
                </form>
                <div className="mt-5 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                  <p className="mb-2 text-base font-semibold text-slate-800">How it works</p>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p><span className="font-semibold text-blue-600">Fact:</span> Tests core conceptual knowledge.</p>
                    <p><span className="font-semibold text-amber-700">Process:</span> Tests sequence and method understanding.</p>
                    <p><span className="font-semibold text-slate-700">Accuracy:</span> Targets precision and common errors.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-6">
                <Card className="overflow-hidden border border-[#AAC4F5]/30 bg-white shadow-sm">
                  <motion.div
                    className="pointer-events-none absolute left-0 top-0 h-full w-full"
                    initial={{ y: '-100%' }}
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="h-24 w-full bg-gradient-to-b from-transparent via-[#8CA9FF]/20 to-transparent" />
                  </motion.div>
                  <CardHeader>
                    <div className="h-6 w-32 animate-pulse rounded-md bg-[#AAC4F5]/40" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-5 w-full animate-pulse rounded-md bg-[#AAC4F5]/35" />
                    <div className="h-5 w-5/6 animate-pulse rounded-md bg-[#AAC4F5]/35" />
                    <div className="h-24 w-full animate-pulse rounded-xl bg-gradient-to-r from-[#FFF2C6]/60 via-[#AAC4F5]/35 to-[#FFF2C6]/60 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
                  </CardContent>
                </Card>
                {[1, 2, 3].map((item) => (
                  <Card key={item} className="relative overflow-hidden border border-[#AAC4F5]/30 bg-white shadow-sm">
                    <motion.div
                      className="pointer-events-none absolute left-0 top-0 h-full w-full"
                      initial={{ y: '-100%' }}
                      animate={{ y: ['-100%', '100%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: item * 0.12 }}
                    >
                      <div className="h-24 w-full bg-gradient-to-b from-transparent via-[#8CA9FF]/20 to-transparent" />
                    </motion.div>
                    <CardHeader>
                      <div className="h-6 w-56 animate-pulse rounded-md bg-[#AAC4F5]/40" />
                      <div className="h-4 w-48 animate-pulse rounded-md bg-[#AAC4F5]/30" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-20 w-full animate-pulse rounded-xl bg-gradient-to-r from-[#FFF2C6]/60 via-[#AAC4F5]/35 to-[#FFF2C6]/60 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="h-6 w-6 animate-pulse rounded-full bg-[#AAC4F5]/35" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results ? (
              <motion.div className="space-y-6" variants={cardStaggerVariants} initial="hidden" animate="show">
                {/* Question Display */}
                <motion.div variants={cardItemVariants}>
                  <Card className="border border-[#AAC4F5]/30 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed text-slate-800">{results.question}</p>
                    <div className="mt-4 rounded-lg border border-[#8CA9FF]/25 bg-[#8CA9FF]/15 p-4">
                      <p className="mb-1 text-base text-slate-600">Correct Answer:</p>
                      <p className="text-lg font-semibold text-[#8CA9FF]">{results.correctAnswer}</p>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>

                {/* Generated Options */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">Generated Distractors</h2>

                  {results.options?.map((option, index) => (
                    <motion.div key={index} variants={cardItemVariants}>
                      <Card className="border border-[#AAC4F5]/25 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg text-slate-900">
                                {option.type.charAt(0).toUpperCase() + option.type.slice(1)}-Based Distractor
                              </CardTitle>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                option.type === 'fact'
                                  ? 'border border-blue-100 bg-blue-50 text-blue-600'
                                  : option.type === 'process'
                                    ? 'border border-amber-100 bg-amber-50 text-amber-700'
                                    : 'border border-slate-200 bg-slate-100 text-slate-600'
                              }`}>
                                {option.type.charAt(0).toUpperCase() + option.type.slice(1)}
                              </span>
                            </div>
                            <CardDescription className="text-slate-600">
                              {option.type === 'fact' && 'Tests fundamental knowledge'}
                              {option.type === 'process' && 'Tests understanding of processes'}
                              {option.type === 'accuracy' && 'Tests precision and accuracy'}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyOption(option.text)}
                              className="text-slate-500 transition-all duration-200 hover:scale-105 hover:bg-[#AAC4F5]/35 hover:text-[#8CA9FF]"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-lg border border-[#FFF2C6] bg-[#FFF8DE] p-4">
                          <p className="font-medium text-slate-800">{option.text}</p>
                        </div>
                        
                        {/* <div>
                          <p className="text-base text-muted-foreground mb-2">Why this distractor?</p>
                          <p className="text-foreground leading-relaxed">{option.explanation}</p>
                        </div> */}

                        <div>
                          <p className="mb-3 text-base text-slate-600">Rate this option:</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => handleRating(option.type, star)}
                                className="transition-all duration-200 hover:scale-110"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    (ratings[option.type] || 0) >= star
                                      ? 'fill-[#8CA9FF] text-[#8CA9FF]'
                                      : 'text-slate-400'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Download Button */}
                <motion.div variants={cardItemVariants}>
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-[#AAC4F5] py-6 text-slate-900 transition-all duration-300 hover:bg-[#9EBBEE]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Results
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="flex min-h-[500px] items-center justify-center rounded-2xl border-2 border-dashed border-[#AAC4F5]/40 bg-white p-10 text-center shadow-sm"
              >
                <div>
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#8CA9FF]/20 shadow-[0_0_35px_rgba(140,169,255,0.45)]">
                    <Sparkles className="h-10 w-10 text-[#8CA9FF]" />
                  </div>
                  <p className="text-xl font-semibold text-slate-800">Awaiting Question Input...</p>
                  <p className="mt-2 text-slate-600">
                    The AI Engine will analyze and generate 3 scientifically-backed distractors.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        </div>
      </motion.div>

      {/* Rate Limit Dialog */}
      <AlertDialog open={showRateLimitDialog} onOpenChange={setShowRateLimitDialog}>
        <AlertDialogContent className="border border-[#AAC4F5]/45 bg-[#FFF8DE]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-slate-900">
              <AlertCircle className="w-5 h-5 text-[#8CA9FF]" />
              Rate Limit Exceeded
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              You've reached your generation limit for this hour. Please try again later or upgrade your plan for unlimited generations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 rounded-lg border border-[#FFF2C6] bg-[#FFF2C6]/55 p-4">
            <p className="text-base text-slate-700">
              <strong>Next reset:</strong> In approximately 1 hour
            </p>
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel className="border border-[#AAC4F5]/45 bg-[#FFF8DE] text-slate-700 hover:bg-[#AAC4F5]/30">
              Dismiss
            </AlertDialogCancel>
            <AlertDialogAction className="bg-[#8CA9FF] text-white hover:bg-[#7F9DFA]">
              Upgrade Plan
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
