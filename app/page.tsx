'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Sparkles, BookOpen, Users, Zap } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-foreground">Q-GENius</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-muted/30 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="animate-fadeInUp">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance leading-tight text-foreground mb-6">
              Generate Intelligent MCQs with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI-Powered Distractors</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Q-GENius identifies learner deficiencies by generating multiple-choice questions with three scientifically-designed distractor types: Fact, Process, and Accuracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-primary text-primary hover:bg-muted">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-16">
          <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="animate-fadeInUp">
            <h2 className="text-4xl font-bold text-foreground mb-4">About Q-GENius</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Q-GENius is an innovative AI-powered system designed to revolutionize educational assessment. By leveraging advanced machine learning, it automatically generates modified multiple-choice questions with scientifically validated distractors that target specific learning gaps.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">The Paper</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This application is built on research that demonstrates how different types of distractors reveal unique learner misconceptions and knowledge gaps, enabling more effective and diagnostic assessment.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe education should be personalized. Q-GENius helps educators understand their students better by generating questions that expose not just what students don&apos;t know, but why they don&apos;t know it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-foreground mb-4">Key Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to create diagnostic MCQs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="animate-slideInLeft p-8 rounded-xl bg-muted/20 border border-muted/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Distractor Generation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate three types of scientifically-designed distractors: Fact-based, Process-based, and Accuracy-based misconceptions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="animate-fadeInUp p-8 rounded-xl bg-muted/20 border border-muted/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Flexible Question Generation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate questions by topic, difficulty level, grade, and subject. Supports both numerical and non-numerical questions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="animate-slideInRight p-8 rounded-xl bg-muted/20 border border-muted/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">AI-Powered Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Powered by advanced GPT-4 and o3-mini models for intelligent question and distractor generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to generate better assessments</p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="animate-slideInLeft flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Generate Options</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Paste your question and specify whether it&apos;s numerical or non-numerical. Our AI generates three types of distractors: fact-based, process-based, and accuracy-based options tailored to reveal specific misconceptions.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="animate-fadeInUp flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Generate Questions</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Use our chat-like interface to specify subject (Physics, Chemistry, Maths, Biology), topic, difficulty level, grade (10/11/12), and number of questions. Get bulk questions generated with integrated AI analysis.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="animate-slideInRight flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Rate & Refine</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Rate the quality of generated options and questions. Use your feedback to refine future generations. Export and use your questions in your classroom.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authors Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-foreground mb-4">Research Team</h2>
            <p className="text-xl text-muted-foreground">Meet the minds behind Q-GENius</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Author 1 */}
            <div className="animate-slideInLeft text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Dr. Author One</h3>
              <p className="text-sm text-muted-foreground mb-4">Lead Researcher</p>
              <p className="text-muted-foreground leading-relaxed">
                Contributed to the core MCQ generation algorithm and distractor classification framework.
              </p>
            </div>

            {/* Author 2 */}
            <div className="animate-fadeInUp text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Dr. Author Two</h3>
              <p className="text-sm text-muted-foreground mb-4">Co-Researcher</p>
              <p className="text-muted-foreground leading-relaxed">
                Designed the validation methodology and conducted extensive user studies with educators.
              </p>
            </div>

            {/* Author 3 */}
            <div className="animate-slideInRight text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Dr. Author Three</h3>
              <p className="text-sm text-muted-foreground mb-4">AI/ML Specialist</p>
              <p className="text-muted-foreground leading-relaxed">
                Implemented the AI backbone and optimized the neural models for educational contexts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Transform Your Assessments?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start creating intelligent, diagnostic MCQs today
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg text-foreground">Q-GENius</span>
              </div>
              <p className="text-sm text-muted-foreground">Intelligent MCQ generation for better assessments</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Research</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Q-GENius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
