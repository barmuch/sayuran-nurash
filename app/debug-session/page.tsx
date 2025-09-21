'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('=== SESSION DEBUG ===');
    console.log('Status:', status);
    console.log('Session:', session);
    console.log('User role:', session?.user?.role);
    console.log('====================');
  }, [session, status]);

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <strong>Status:</strong> {status}
          </div>
          
          <div>
            <strong>Session Data:</strong>
            <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <div><strong>User ID:</strong> {session?.user?.id || 'None'}</div>
            <div><strong>Username:</strong> {session?.user?.username || 'None'}</div>
            <div><strong>Email:</strong> {session?.user?.email || 'None'}</div>
            <div><strong>Role:</strong> {session?.user?.role || 'None'}</div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Cookie Information:</h3>
            <div className="text-sm">
              <div>All cookies: {typeof document !== 'undefined' ? document.cookie : 'N/A'}</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Tests:</h3>
            <div className="space-y-2">
              <div>
                ✅ Is authenticated: {session ? 'Yes' : 'No'}
              </div>
              <div>
                ✅ Is admin: {session?.user?.role === 'admin' ? 'Yes' : 'No'}
              </div>
              <div>
                ✅ Can access admin: {session?.user?.role === 'admin' ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}