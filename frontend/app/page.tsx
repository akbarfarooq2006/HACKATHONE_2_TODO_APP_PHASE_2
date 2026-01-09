import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-linear-to-b from-blue-50 to-white">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Phase 2 Todo App
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl">
          A secure, modern task management application with authentication
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/sign-in"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-md border-2 border-blue-600"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🔐</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Secure Authentication
              </h3>
              <p className="text-sm text-gray-600">
                Email/password and Google OAuth with JWT tokens
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">💾</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Persistent Sessions
              </h3>
              <p className="text-sm text-gray-600">
                Stay signed in for 7 days with secure httpOnly cookies
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Protected Routes
              </h3>
              <p className="text-sm text-gray-600">
                Zero-trust architecture with backend token verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
