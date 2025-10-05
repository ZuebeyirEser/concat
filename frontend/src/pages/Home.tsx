import { Link } from '@tanstack/react-router'
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiShoppingCart,
  FiTrendingUp,
} from 'react-icons/fi'

import Footer from '@/components/Common/Layout/Footer'
import { Button } from '@/components/ui/button'
import Logo from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="lg" />
            <div className="flex items-center space-x-4">
              <ThemeToggle />
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

      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Your grocery receipts,
              <br />
              finally organized
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Track your spending, monitor nutrition, and understand how
              inflation affects your everyday purchases. Built for German
              supermarket apps.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button size="lg" className="flex items-center gap-2">
                  Start tracking
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything in one place
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Automatically sync receipts from Rewe, Edeka, Lidl, and other
              German supermarket apps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <FiActivity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Health tracking
              </h3>
              <p className="text-sm text-muted-foreground">
                Understand your nutrition patterns. See what you're buying and
                get insights on healthier alternatives.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <FiTrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Inflation tracker
              </h3>
              <p className="text-sm text-muted-foreground">
                Watch how prices change over time for items you buy regularly.
                Real data from your actual purchases.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <FiBarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Spending insights
              </h3>
              <p className="text-sm text-muted-foreground">
                Clear breakdown of where your money goes. Track spending by
                category, store, and time period.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm">
              <FiShoppingCart className="h-4 w-4" />
              Coming soon
            </div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Smart recipe suggestions
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
              Based on what you buy and your health goals, get personalized meal
              ideas and shopping recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <FiCheckCircle className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="mb-2 font-semibold text-foreground">
                What to cook tonight
              </h3>
              <p className="text-sm text-muted-foreground">
                Get suggestions based on ingredients you already have and items
                you frequently purchase.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <FiCheckCircle className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="mb-2 font-semibold text-foreground">
                Healthier swaps
              </h3>
              <p className="text-sm text-muted-foreground">
                Identify items you should consider avoiding and discover better
                alternatives at similar prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
              Free to use
            </h2>
            <p className="mb-8 text-muted-foreground">
              This is a personal project to solve a problem I had. No
              subscription fees, no premium plans. Just connect your supermarket
              apps and start tracking.
            </p>
            <Link to="/signup">
              <Button size="lg" className="mx-auto flex items-center gap-2">
                Create your account
                <FiArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
