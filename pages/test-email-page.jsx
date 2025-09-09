import React, { useState } from 'react';

export default function TestEmailPage() {
  const [testType, setTestType] = useState('configuration');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [internEmail, setInternEmail] = useState('');

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      let requestBody = { testType };

      if (testType === 'welcome-email') {
        requestBody = {
          testType,
          companyId,
          internData: {
            name: 'Test Intern',
            email: internEmail,
            internId: 'IID-TST-010125-ABCD',
            company: 'Test Company',
            department: 'Software Development',
            role: 'Intern'
          }
        };
      }

      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-green-600 mb-6">Email Functionality Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Type
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="configuration">Test SMTP Configuration</option>
              <option value="welcome-email">Test Welcome Email</option>
            </select>
          </div>

          {testType === 'welcome-email' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company ID
                </label>
                <input
                  type="text"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Enter company ID"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={internEmail}
                  onChange={(e) => setInternEmail(e.target.value)}
                  placeholder="Enter email to send test to"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          <button
            onClick={handleTest}
            disabled={loading || (testType === 'welcome-email' && (!companyId || !internEmail))}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              loading || (testType === 'welcome-email' && (!companyId || !internEmail))
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {loading ? 'Testing...' : 'Run Test'}
          </button>

          {result && (
            <div className={`p-4 rounded-md ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ Test Successful' : '❌ Test Failed'}
              </h3>
              <pre className={`mt-2 text-sm ${
                result.success ? 'text-green-700' : 'text-red-700'
              } whitespace-pre-wrap`}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">Setup Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Configure SMTP settings in your <code>.env.local</code> file</li>
            <li>See <code>SMTP_CONFIG.md</code> for detailed setup instructions</li>
            <li>Test SMTP configuration first</li>
            <li>Then test sending a welcome email</li>
          </ol>
        </div>
      </div>
    </div>
  );
}


