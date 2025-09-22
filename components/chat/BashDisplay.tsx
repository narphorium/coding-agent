import { BashResult } from './types';

interface BashDisplayProps {
  result: BashResult;
}

export default function BashDisplay({ result }: BashDisplayProps) {
  return (
    <div className="flex flex-col border-gray-500 border rounded-md p-2 mb-4 space-y-1 text-gray-700">
      <strong>bash:</strong>
      <div className="text-sm text-gray-600">
        Command: <code className="bg-gray-100 px-1 rounded">{result.parameters.command}</code>
      </div>

      {result.parameters.working_directory && (
        <div className="text-sm text-gray-600">
          Working Directory: {result.parameters.working_directory}
        </div>
      )}

      {result.parameters.timeout && (
        <div className="text-sm text-gray-600">
          Timeout: {result.parameters.timeout}ms
        </div>
      )}

      {result.error ? (
        <div className="text-red-600">Error: {result.error}</div>
      ) : result.result ? (
        <div className="space-y-2">
          <div className={`text-sm font-medium ${
            result.result.exit_code === 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Exit Code: {result.result.exit_code}
          </div>

          {result.result.stdout && (
            <div>
              <div className="text-sm font-medium text-green-700">Standard Output:</div>
              <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-64 border border-green-200">
                {result.result.stdout}
              </pre>
            </div>
          )}

          {result.result.stderr && (
            <div>
              <div className="text-sm font-medium text-red-700">Standard Error:</div>
              <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-64 border border-red-200">
                {result.result.stderr}
              </pre>
            </div>
          )}

          {!result.result.stdout && !result.result.stderr && (
            <div className="text-sm text-gray-500 italic">No output</div>
          )}
        </div>
      ) : null}
    </div>
  );
}