import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { 
  ArrowRight, BookOpen, Users, Star, Sparkles, Award, 
  Zap, FileCheck, Bot, Search, Play, CheckCircle2 
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/components/courses/CourseCard'
import { CourseCardSkeleton } from '@/components/courses/CourseCardSkeleton'
import { useFeaturedCourses, useCourseCount } from '@/hooks/queries/useFeaturedCourses'

export function LandingPage() {
  const { data: featuredCourses, isLoading: isFeaturedLoading } = useFeaturedCourses()
  const { data: totalCourses } = useCourseCount()
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="flex flex-col w-full">
      <Helmet>
        <title>EduFlow LMS — Learn Skills. Earn Certificates. Grow Your Career.</title>
        <meta name="description" content="Access 200+ expert courses on programming, design, business, and more. Learn at your own pace with AI-powered tutoring." />
        <meta property="og:title" content="EduFlow LMS" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Section 1 — Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#EEF2FF] pt-24 pb-20 dark:from-background dark:to-background">
        <div className="container px-4 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Left Column */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="mr-2 h-4 w-4 fill-primary" />
                🚀 Now with AI-Powered Tutoring
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                Learn Without Limits. <span className="text-primary block mt-2">Grow Without Boundaries.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
                Access 200+ expert-led courses, earn certificates, and accelerate your career — all at your own pace.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to={ROUTES.SIGNUP} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 text-lg shadow-lg shadow-primary/25">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to={ROUTES.CATALOG} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full h-14 px-8 text-lg bg-background/50 backdrop-blur-sm">
                    Browse Courses
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt="Student" 
                      className="w-10 h-10 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Join 12,000+ learners
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative hidden lg:block">
              {/* Decorative blobs */}
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50" />
              
              {/* Illustration Placeholder / Abstract */}
              <div className="relative aspect-square w-full max-w-lg mx-auto bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-3xl border border-primary/10 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Student learning"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                />
                <div className="relative z-10 w-3/4 h-3/4 bg-card rounded-2xl shadow-2xl border border-border p-6 flex flex-col gap-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="h-4 w-1/3 bg-muted rounded-full" />
                  <div className="h-32 w-full bg-muted rounded-xl" />
                  <div className="h-4 w-2/3 bg-muted rounded-full" />
                  <div className="h-4 w-1/2 bg-muted rounded-full" />
                </div>
                
                {/* Floating Stats */}
                <div className="absolute top-8 -right-6 bg-card px-4 py-3 rounded-xl shadow-xl border border-border flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <div className="font-bold">4.9★</div>
                    <div className="text-xs text-muted-foreground">Average Rating</div>
                  </div>
                </div>

                <div className="absolute bottom-12 -left-6 bg-card px-4 py-3 rounded-xl shadow-xl border border-border flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold">200+</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Section 2 — Stats Bar */}
      <section className="w-full bg-muted/30 py-8 border-y border-border">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-border">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Users className="h-6 w-6 text-primary mb-3 opacity-80" />
              <div className="font-heading text-3xl font-bold text-primary">12,000+</div>
              <div className="text-sm text-muted-foreground font-medium mt-1">Students Enrolled</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <BookOpen className="h-6 w-6 text-primary mb-3 opacity-80" />
              <div className="font-heading text-3xl font-bold text-primary">200+</div>
              <div className="text-sm text-muted-foreground font-medium mt-1">Expert Courses</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Award className="h-6 w-6 text-primary mb-3 opacity-80" />
              <div className="font-heading text-3xl font-bold text-primary">8,500+</div>
              <div className="text-sm text-muted-foreground font-medium mt-1">Certificates Issued</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Star className="h-6 w-6 text-primary mb-3 opacity-80" />
              <div className="font-heading text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground font-medium mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Features */}
      <section className="py-24">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">Everything You Need to Succeed</h2>
            <p className="mt-4 text-lg text-muted-foreground">Built for learners who are serious about growth</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            <div className="bg-card rounded-xl shadow-card p-8 border border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Learn at Your Pace</h3>
              <p className="text-muted-foreground leading-relaxed">
                Lifetime access to all enrolled courses. Watch, pause, rewind — on any device, anytime you want.
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-card p-8 border border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Instructors</h3>
              <p className="text-muted-foreground leading-relaxed">
                Learn from industry professionals with years of real-world experience teaching practical skills.
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-card p-8 border border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Certificates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Earn shareable certificates recognized by top companies worldwide to boost your resume and LinkedIn.
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-card p-8 border border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Tutor 24/7</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ask questions any time. Our AI tutor explains concepts specific to your course material context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Featured Courses */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">Our Most Popular Courses</h2>
            <p className="mt-4 text-lg text-muted-foreground">Thousands of students are learning these right now</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {isFeaturedLoading ? (
              [...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)
            ) : (
              featuredCourses?.map(course => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
          
          <div className="flex justify-center">
            <Link to={ROUTES.CATALOG}>
              <Button variant="outline" size="lg" className="px-8 font-medium">
                View All Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5 — How It Works */}
      <section className="py-24">
        <div className="container px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-16">Start Learning in 3 Simple Steps</h2>
          
          <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] border-t-2 border-dashed border-primary/30 z-0" />
            
            <div className="relative z-10 flex flex-col items-center bg-background">
              <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center text-4xl font-bold text-primary mb-6 shadow-sm">
                1
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Browse & Choose</h3>
              </div>
              <p className="text-muted-foreground max-w-xs leading-relaxed">
                Explore 200+ courses across 6 categories. Filter by skill level and price to find your fit.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center bg-background">
              <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center text-4xl font-bold text-primary mb-6 shadow-sm">
                2
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Play className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Enroll & Learn</h3>
              </div>
              <p className="text-muted-foreground max-w-xs leading-relaxed">
                Watch HD lessons, read materials, take quizzes — all in one beautifully designed place.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center bg-background">
              <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center text-4xl font-bold text-primary mb-6 shadow-sm">
                3
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Earn & Grow</h3>
              </div>
              <p className="text-muted-foreground max-w-xs leading-relaxed">
                Complete courses, earn verifiable certificates, and advance your career to the next level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Testimonials */}
      <section className="py-24 bg-slate-900 text-slate-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-white">Loved by Learners Worldwide</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-6">
                  <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-slate-300 italic leading-relaxed mb-8">
                  "EduFlow transformed my career. I went from zero Python knowledge to landing a data analyst job in 4 months. The AI tutor feature is a game-changer."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-lg">
                  PS
                </div>
                <div>
                  <div className="font-bold text-white">Priya S.</div>
                  <div className="text-sm text-slate-400">Data Analyst at Infosys</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-6">
                  <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-slate-300 italic leading-relaxed mb-8">
                  "The course quality is incredible. Well-structured, practical, and the instructor actually responds to forum questions. Worth every rupee."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-lg">
                  AM
                </div>
                <div>
                  <div className="font-bold text-white">Arjun M.</div>
                  <div className="text-sm text-slate-400">Full-Stack Developer</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-6">
                  <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-slate-300 italic leading-relaxed mb-8">
                  "I earned my first certificate in UI/UX and immediately used it to get a freelance project. EduFlow pays for itself."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white text-lg">
                  SR
                </div>
                <div>
                  <div className="font-bold text-white">Sneha R.</div>
                  <div className="text-sm text-slate-400">Freelance Designer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Pricing */}
      <section id="pricing" className="py-24 bg-muted/20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when you're ready.</p>
            
            <div className="mt-8 inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${!isAnnual ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${isAnnual ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted text-muted-foreground'}`}
              >
                Annual <span className="ml-1 text-xs text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Access to 50+ free courses</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Community forum access</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Progress tracking</li>
                <li className="flex items-center gap-3 text-muted-foreground line-through"><div className="h-5 w-5 shrink-0" /> Certificates</li>
                <li className="flex items-center gap-3 text-muted-foreground line-through"><div className="h-5 w-5 shrink-0" /> AI Tutor</li>
                <li className="flex items-center gap-3 text-muted-foreground line-through"><div className="h-5 w-5 shrink-0" /> Premium courses</li>
              </ul>
              <Link to={ROUTES.SIGNUP}>
                <Button variant="outline" className="w-full" size="lg">Get Started Free</Button>
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="bg-card rounded-2xl p-8 border-2 border-primary shadow-xl flex flex-col relative transform lg:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="mb-8 mt-2">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  {isAnnual ? (
                    <>
                      <span className="text-4xl font-bold">₹479</span>
                      <span className="text-muted-foreground">/month</span>
                      <span className="ml-2 text-sm text-muted-foreground line-through">₹599</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">₹599</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
                {isAnnual && <div className="text-sm text-emerald-500 font-medium mt-1">Billed ₹5,748 annually</div>}
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Access to all 200+ courses</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> All certificates included</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> AI Tutor (unlimited)</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Offline downloads</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Priority support</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Community forum</li>
              </ul>
              <Link to={`${ROUTES.SIGNUP}?plan=pro`}>
                <Button className="w-full" size="lg">Start Pro Free — 7 Days</Button>
              </Link>
            </div>
            
            {/* Enterprise Tier */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Everything in Pro</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Team management dashboard</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Custom branding</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> SSO & SCIM</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Dedicated account manager</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> SLA guarantee</li>
              </ul>
              <a href="mailto:sales@eduflow.app">
                <Button variant="outline" className="w-full" size="lg">Contact Sales</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 — Instructor CTA */}
      <section className="py-24 bg-slate-900 text-slate-50">
        <div className="container px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Turn Your Expertise Into Income</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Share your knowledge with thousands of eager learners. Build courses, earn revenue, and become a recognized expert in your field — all on EduFlow.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/signup?role=instructor">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 h-14 px-8 text-lg font-bold shadow-lg shadow-primary/25">
                  Start Teaching Today
                </Button>
              </a>
              <a href="/catalog">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white/10 hover:text-white h-14 px-8 text-lg font-medium">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9 — Final CTA Banner */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Ready to Start Learning Today?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">
            Join 12,000+ students already on EduFlow. Your first course is on us.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={ROUTES.SIGNUP}>
              <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg font-bold">
                Create Free Account
              </Button>
            </Link>
            <Link to={ROUTES.CATALOG}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white/10 hover:text-white h-14 px-8 text-lg font-medium">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
