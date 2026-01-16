'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const isAuthenticated = !!session?.user

  const handleGetStarted = () => {
    router.push(isAuthenticated ? '/dashboard' : '/sign-in')
  }

  const handleSignIn = () => {
    router.push(isAuthenticated ? '/dashboard' : '/sign-in')
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Manage Your Tasks Effortlessly
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-foreground mb-8 max-w-2xl mx-auto">
            Simple, powerful task management for busy professionals. Stay organized, boost productivity, and never miss a deadline.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity shadow-card"
            >
              Get Started
            </button>
            <button
              onClick={handleSignIn}
              className="w-full sm:w-auto border-2 border-accent text-accent px-8 py-3 rounded-lg text-lg font-semibold hover:bg-accent hover:text-white transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Everything You Need to Stay Organized
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background shadow-card rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Simple Task Management
              </h3>
              <p className="text-foreground">
                Create, edit, and organize your tasks with an intuitive interface designed for speed and efficiency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background shadow-card rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Secure & Private
              </h3>
              <p className="text-foreground">
                Your data is protected with enterprise-grade security. Only you can access your tasks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background shadow-card rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Works Everywhere
              </h3>
              <p className="text-foreground">
                Access your tasks from any device. Responsive design ensures a great experience on mobile, tablet, and desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center bg-background shadow-card rounded-lg p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-foreground mb-8">
            Join thousands of professionals who trust TaskApp to manage their daily tasks.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-accent text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity shadow-card"
          >
            Start Managing Tasks Now
          </button>
        </div>
      </section>
    </div>
  )
}
