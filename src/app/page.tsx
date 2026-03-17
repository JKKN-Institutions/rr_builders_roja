import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Database, Shield, Clock, IndianRupee } from "lucide-react";

/**
 * Landing Page Component
 * Mobile-first responsive design with construction industry aesthetic
 * Features hero section and key product highlights
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" aria-hidden="true" />
        <div className="container relative mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="inline-flex items-center gap-3 mb-6" role="banner">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                BuildWise <span className="text-accent">Cashflow</span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Financial Intelligence & WIP Analysis Platform for Construction
            </p>
            <p className="text-base text-muted-foreground mb-8">
              Real-time financial insights powered by Tally Integration
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto min-w-[180px]"
                aria-label="Get started with BuildWise Cashflow"
              >
                <Link href="/login">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-w-[180px]"
                aria-label="Login to existing account"
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>

            {/* Demo Note */}
            <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <span className="font-medium">Try the demo</span> with sample construction data
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Built for Construction Excellence
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Make confident financial decisions with real-time data from your Tally system
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1: Financial Intelligence */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">Financial Intelligence</CardTitle>
              <CardDescription>
                Real-time insights into your project finances with predictive analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Cash flow forecasting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Budget vs actual tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Profitability analysis</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2: WIP Analysis */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">WIP Analysis</CardTitle>
              <CardDescription>
                Track work-in-progress across all your construction projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Project-wise WIP tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Material cost monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Labor cost analysis</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3: Real-time Tally */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">Real-time Tally Sync</CardTitle>
              <CardDescription>
                Direct integration with your Tally system for accurate data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Live data synchronization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Automated data updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Single source of truth</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 4: Security */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">Enterprise Security</CardTitle>
              <CardDescription>
                Bank-grade security for your financial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Encrypted data storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Role-based access control</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Audit trail logging</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 5: Time Savings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">Save Time</CardTitle>
              <CardDescription>
                Automate manual reporting and data entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Automated report generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>One-click dashboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Scheduled email reports</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 6: Indian Currency */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <IndianRupee className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">Built for India</CardTitle>
              <CardDescription>
                Designed for Indian construction businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Indian Rupee formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>GST compliance ready</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1" aria-hidden="true">•</span>
                  <span>Local business practices</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 BuildWise Cashflow. Built for RR Thulasi Builders.
          </p>
        </div>
      </footer>
    </main>
  );
}
