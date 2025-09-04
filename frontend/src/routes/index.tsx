import { createFileRoute, Link } from '@tanstack/react-router'
import { FiArrowRight, FiCheck, FiUsers, FiZap, FiShield } from 'react-icons/fi'

import Logo from '@/components/ui/logo'
import Footer from '@/components/Common/Footer'
import { Button } from '@/components/ui/button'
import { isLoggedIn } from '@/hooks/useAuth'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  // If user is already logged in, redirect to dashboard
  if (isLoggedIn()) {
    window.location.href = '/items'
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="lg" />
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Manage your items with{' '}
              <span 
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #3b82f6, #6366f1, #8b5cf6)',
                  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                }}
              >
                concat
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              A modern, efficient platform for organizing and managing your items. 
              Built with cutting-edge technology for the best user experience.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button size="lg" className="flex items-center gap-2">
                  Get Started
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to manage items
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Powerful features designed to make item management effortless and efficient.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FiZap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Lightning Fast</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Built with modern technology for blazing fast performance and smooth user experience.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FiShield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Secure & Private</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your data is protected with enterprise-grade security and privacy measures.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FiUsers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Team Collaboration</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Work together seamlessly with your team members and share items effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Choose the plan that works best for you and your team.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-lg border border-border bg-card p-8">
              <h3 className="text-lg font-semibold text-foreground">Free</h3>
              <p className="mt-2 text-sm text-muted-foreground">Perfect for getting started</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Up to 100 items
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Basic features
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Community support
                </li>
              </ul>
              <Link to="/signup" className="mt-8 block">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-lg border-2 border-primary bg-card p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-full">
                  Most Popular
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Pro</h3>
              <p className="mt-2 text-sm text-muted-foreground">For growing teams</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Unlimited items
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Advanced features
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Team collaboration
                </li>
              </ul>
              <Link to="/signup" className="mt-8 block">
                <Button className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-lg border border-border bg-card p-8">
              <h3 className="text-lg font-semibold text-foreground">Enterprise</h3>
              <p className="mt-2 text-sm text-muted-foreground">For large organizations</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">Custom</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  SLA guarantee
                </li>
              </ul>
              <Button variant="outline" className="mt-8 w-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join thousands of users who trust concat to manage their items efficiently.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button size="lg" className="flex items-center gap-2">
                  Start Free Trial
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}