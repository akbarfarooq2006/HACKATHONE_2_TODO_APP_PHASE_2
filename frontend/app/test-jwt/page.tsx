'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { getJWTToken } from '@/lib/auth-client';

export default function TestJWTPage() {
  const { data: session } = useSession();
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetJWTToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getJWTToken();
      if (token) {
        setJwtToken(token);

        // Decode JWT token (just the payload, not verifying signature)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setDecodedToken(payload);
        }
      } else {
        setError('Failed to get JWT token');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestBackendAPI = async () => {
    if (!jwtToken || !decodedToken?.sub) {
      setError('Please get JWT token first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userId = decodedToken.sub;
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}/me`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });

      const data = await response.json();
      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <p className="mb-4">Please sign in to test JWT tokens</p>
          <a href="/sign-in" className="text-blue-600 hover:underline">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">JWT Token Testing</h1>

        {/* Session Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {session.user.id}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Name:</strong> {session.user.name}</p>
          </div>
        </div>

        {/* Get JWT Token */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Get JWT Token</h2>
          <p className="text-gray-600 mb-4">
            Session tokens (in cookies) are for frontend authentication.
            JWT tokens (generated on-demand) are for backend API calls.
          </p>
          <button
            onClick={handleGetJWTToken}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Get JWT Token'}
          </button>

          {jwtToken && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">JWT Token:</h3>
              <div className="bg-gray-100 p-3 rounded text-xs break-all font-mono">
                {jwtToken}
              </div>
              <p className="text-green-600 mt-2">
                ✅ Token starts with: {jwtToken.substring(0, 20)}...
              </p>
            </div>
          )}

          {decodedToken && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Decoded Payload:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Test Backend API */}
        {jwtToken && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Test Backend API</h2>
            <p className="text-gray-600 mb-4">
              Call the backend API with the JWT token to verify stateless authentication.
            </p>
            <button
              onClick={handleTestBackendAPI}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Backend API'}
            </button>

            {apiResponse && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">API Response:</h3>
                <div className="bg-gray-100 p-3 rounded">
                  <p className={`font-semibold ${apiResponse.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {apiResponse.status} {apiResponse.statusText}
                  </p>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>Session Tokens</strong> (in cookies): Used for frontend session management.
              Format: <code className="bg-white px-1">ZYxRoYkgU8tlrAEkc5bM5iDTfWKBVT3L...</code>
            </li>
            <li>
              <strong>JWT Tokens</strong> (generated on-demand): Used for backend API authentication.
              Format: <code className="bg-white px-1">eyJhbGciOiJFZDI1NTE5...</code>
            </li>
            <li>
              Click "Get JWT Token" to generate a JWT token from your current session.
            </li>
            <li>
              Click "Test Backend API" to call the FastAPI backend with the JWT token.
            </li>
            <li>
              The backend verifies the JWT token <strong>statelessly</strong> without database lookups.
            </li>
          </ol>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
