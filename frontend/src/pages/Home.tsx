import { Link } from '@tanstack/react-router'
import {
  FiArrowRight,
  FiCheck,
  FiCode,
  FiHeart,
  FiGithub,
} from 'react-icons/fi'

import Logo from '@/components/ui/logo'
import Footer from '@/components/Common/Layout/Footer'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="lg" />
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Try It Out</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Just a simple{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #3b82f6, #6366f1, #8b5cf6)',
                  fontFamily:
                    '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                }}
              >
                concat
              </span>{' '}
              for your stuff
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              I built this to organize my own items and thought you might find
              it useful too. It's nothing fancy, but it works pretty well.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button size="lg" className="flex items-center gap-2">
                  Give it a try
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What it does
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Pretty straightforward stuff, honestly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FiCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Add & organize items
              </h3>
              <p className="text-sm text-muted-foreground">
                Create items, categorize them, add notes. The basics you'd
                expect.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FiHeart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Actually works
              </h3>
              <p className="text-sm text-muted-foreground">
                I use this myself daily, so I try to keep the bugs to a minimum.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FiGithub className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Open source
              </h3>
              <p className="text-sm text-muted-foreground">
                Code is available if you want to see how it works or suggest
                improvements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
              It's free
            </h2>
            <p className="mb-6 text-muted-foreground">
              This is a personal project, not a business. No subscriptions, no
              premium tiers, no "contact sales" nonsense. Just sign up and use
              it.
            </p>
            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm">
                <FiCheck className="h-4 w-4 text-green-500" />
                No limits on items
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <FiCheck className="h-4 w-4 text-green-500" />
                All features included
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <FiCheck className="h-4 w-4 text-green-500" />
                No ads or tracking
              </div>
            </div>
            <Link to="/signup">
              <Button size="lg" className="mx-auto flex items-center gap-2">
                Start using it
                <FiArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Questions or issues?
          </h2>
          <p className="text-muted-foreground">
            Drop me a line if something's broken or you have suggestions. I
            can't promise enterprise-level support, but I'll do my best to help.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
