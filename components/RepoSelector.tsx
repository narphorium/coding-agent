'use client';

import { useState } from 'react';

interface RepoSelectorProps {
  sessionID: string;
  onRepoSelected?: (result: any) => void;
}

interface GitCheckoutResult {
  success: boolean;
  sessionID: string;
  repoName: string;
  repositoryPath: string;
  results: Array<{
    command: string;
    stdout: string;
    stderr: string;
    error?: any;
  }>;
}

export default function RepoSelector({ sessionID, onRepoSelected }: RepoSelectorProps) {
  const [gitUrl, setGitUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GitCheckoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gitUrl.trim()) {
      setError('Please enter a Git URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(gitUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/git-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionID,
          githubUrl: gitUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to checkout repository');
      }

      setResult(data);
      onRepoSelected?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Select Repository</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gitUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Git Repository URL
          </label>
          <input
            id="gitUrl"
            type="url"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !gitUrl.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Cloning Repository...' : 'Clone Repository'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Repository Cloned Successfully!</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Repository:</strong> {result.repoName}</p>
            <p><strong>Path:</strong> {result.repositoryPath}</p>
            <p><strong>Session ID:</strong> {result.sessionID}</p>
          </div>
          
          {result.results && result.results.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-green-800 mb-2">Execution Results:</h4>
              <div className="space-y-2">
                {result.results.map((execution, index) => (
                  <div key={index} className="bg-white p-3 rounded border text-xs">
                    <p className="font-mono text-gray-600 mb-1">
                      <strong>Command:</strong> {execution.command}
                    </p>
                    {execution.stdout && (
                      <pre className="text-green-600 whitespace-pre-wrap">{execution.stdout}</pre>
                    )}
                    {execution.stderr && (
                      <pre className="text-red-600 whitespace-pre-wrap">{execution.stderr}</pre>
                    )}
                    {execution.error && (
                      <pre className="text-red-600 whitespace-pre-wrap">
                        Error: {JSON.stringify(execution.error, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
