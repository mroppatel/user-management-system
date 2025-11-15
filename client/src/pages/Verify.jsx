import React, { useEffect, useState } from 'react';

// VerifyEmail.jsx
// Usage: Add a route in your React app like /verify-email that renders this component.
// Expects a `token` query param: /verify-email?token=... 
// It calls the backend endpoint: `${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`
// Make sure to set VITE_API_URL in your .env (for example: VITE_API_URL=http://localhost:4000)

export default function VerifyEmail() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | missing
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('missing');
      setMessage('Verification token not found in the URL.');
      return;
    }

    const verify = async () => {
      setStatus('loading');
      setMessage('Verifying your email...');

      try {
        // Build verify URL. Your backend route must accept GET and read token from query.
        const base = import.meta.env.VITE_API_URL || '';
        const url = `${base}/auth/verify-email?token=${encodeURIComponent(token)}`;

        const res = await fetch(url, { method: 'GET' });

        if (res.ok) {
          // backend returns HTML for a browser, or JSON — handle both
          let text = await res.text();
          // Try to parse JSON if possible
          try {
            const json = JSON.parse(text);
            setMessage(json.message || 'Email verified successfully.');
          } catch (e) {
            // If it's HTML or plain text, keep a friendly message
            setMessage('Email verified successfully. You can now log in.');
          }
          setStatus('success');
        } else {
          // Try to extract error message
          let text = await res.text();
          try {
            const json = JSON.parse(text);
            setMessage(json.message || 'Verification failed');
          } catch (e) {
            setMessage(text || 'Verification failed or token expired.');
          }
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error or server not reachable.');
      }
    };

    verify();
  }, []);

  const goTo = (path) => (window.location.href = path);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-lg w-full mx-4 bg-white shadow-lg rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">✓</div>
          <div>
            <h1 className="text-2xl font-semibold">Email verification</h1>
            <p className="text-sm text-gray-500">Confirming your account</p>
          </div>
        </div>

        <div className="mt-6">
          {status === 'loading' && (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600" />
              <div className="text-gray-700">{message}</div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">{message}</p>
              <div className="flex gap-3">
                <button onClick={() => goTo('/login')} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Go to Login</button>
                <button onClick={() => goTo('/')} className="px-4 py-2 rounded-md border">Go to Homepage</button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-red-600 font-medium">{message}</p>
              <div className="flex gap-3">
                <button onClick={() => location.reload()} className="px-4 py-2 rounded-md bg-yellow-500 text-white">Try again</button>
                <button onClick={() => goTo('/request-reset')} className="px-4 py-2 rounded-md border">Request new verification</button>
              </div>
            </div>
          )}

          {status === 'missing' && (
            <div>
              <p className="text-orange-600">{message}</p>
              <div className="mt-4">
                <button onClick={() => goTo('/signup')} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Create Account</button>
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="text-gray-600">Preparing...</div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-400">
          If the verification link doesn't work, copy the full URL from your email and open it in this browser.
        </div>
      </div>
    </div>
  );
}
