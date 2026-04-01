'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Sparkles, Star, Copy, Download, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

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
  const [rateLimitError, setRateLimitError] = useState(false)
  const [showRateLimitDialog, setShowRateLimitDialog] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    questionType: 'non-numerical',
    additionalPrompt: '',
  })
  const [results, setResults] = useState<GenerationResult | null>(null)
  const [ratings, setRatings] = useState<{ [key: string]: number }>({})

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.question.trim()) {
      toast.error('Please enter a question')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formData.question,
          questionType: formData.questionType,
          additionalPrompt: formData.additionalPrompt,
        }),
      })

      if (response.status === 429) {
        setRateLimitError(true)
        setShowRateLimitDialog(true)
        toast.error('Rate limit exceeded. Please try again later.')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.message || 'Failed to generate options')
        return
      }

      const options_data = await response.json()
      setResults(options_data)
      setRatings({})
      toast.success('Options generated successfully!')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Generate Options</h1>
          <p className="text-muted-foreground text-lg">
            Enter a question and we&apos;ll generate three types of scientifically-designed distractors
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-20">
              <CardHeader>
                <CardTitle>Generate Distractors</CardTitle>
                <CardDescription>One question at a time</CardDescription>
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
                        className="bg-muted/30 border-border min-h-32"
                      />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="questionType">Question Type *</FieldLabel>
                      <Select value={formData.questionType} onValueChange={(value) => setFormData(prev => ({ ...prev, questionType: value }))}>
                        <SelectTrigger className="bg-muted/30 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                        className="bg-muted/30 border-border min-h-24"
                      />
                    </Field>
                  </FieldGroup>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 font-semibold"
                  >
                    {loading ? 'Generating...' : 'Generate Options'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {results ? (
              <div className="space-y-6 animate-fadeInUp">
                {/* Question Display */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-foreground leading-relaxed">{results.question}</p>
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Correct Answer:</p>
                      <p className="text-lg font-semibold text-primary">{results.correctAnswer}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Generated Options */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Generated Distractors</h2>

                  {results.options.map((option, index) => (
                    <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {option.type.charAt(0).toUpperCase() + option.type.slice(1)}-Based Distractor
                            </CardTitle>
                            <CardDescription>
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
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/20 rounded-lg border border-muted/40">
                          <p className="text-foreground font-medium">{option.text}</p>
                        </div>
                        
                        {/* <div>
                          <p className="text-sm text-muted-foreground mb-2">Why this distractor?</p>
                          <p className="text-foreground leading-relaxed">{option.explanation}</p>
                        </div> */}

                        <div>
                          <p className="text-sm text-muted-foreground mb-3">Rate this option:</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => handleRating(option.type, star)}
                                className="transition-colors"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    (ratings[option.type] || 0) >= star
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  className="w-full bg-secondary hover:bg-secondary/90 text-foreground py-6"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </Button>
              </div>
            ) : (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Enter a question on the left to generate AI-powered distractors
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rate Limit Dialog */}
      <AlertDialog open={showRateLimitDialog} onOpenChange={setShowRateLimitDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Rate Limit Exceeded
            </AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve reached your generation limit for this hour. Please try again later or upgrade your plan for unlimited generations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-4">
            <p className="text-sm text-foreground">
              <strong>Next reset:</strong> In approximately 1 hour
            </p>
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">
              Dismiss
            </AlertDialogCancel>
            <AlertDialogAction className="bg-primary text-white hover:bg-primary/90">
              Upgrade Plan
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
