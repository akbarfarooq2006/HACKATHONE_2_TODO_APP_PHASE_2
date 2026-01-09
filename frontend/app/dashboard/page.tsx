"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import UserMenu from "@/components/user-menu";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router, mounted]);

  if (isPending || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {session.user?.name || "User"}!
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Email Address
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {session.user?.email}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {session.user?.id}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Account Status
                </h3>
                <p className="mt-1 text-sm text-green-600 font-medium">
                  ✓ Active
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              🎉 Authentication Successful!
            </h3>
            <p className="text-sm text-blue-700">
              You are now signed in and can access protected resources. Your
              session will persist across page refreshes for 7 days.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
