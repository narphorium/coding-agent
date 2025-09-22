import { WriteFileResult } from './types';

interface WriteFileDisplayProps {
  result: WriteFileResult;
}

export default function WriteFileDisplay({ result }: WriteFileDisplayProps) {
  return (
    <div className="flex flex-col border-purple-400 border rounded-md p-2 mb-4 space-y-1 text-purple-700">
      <strong>write_file:</strong>
      <div className="text-sm text-gray-600">Path: {result.parameters.path}</div>

      {result.error ? (
        <div className="text-red-600">Error: {result.error}</div>
      ) : result.result ? (
        <div className="space-y-2">
          <div className="text-green-600 font-medium">{result.result.message}</div>

          <div className="text-sm text-gray-600">
            Content length: {result.parameters.content.length} characters
          </div>

          <div>
            <div className="text-sm font-medium">Content Preview:</div>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32 border">
              {result.parameters.content.length > 500
                ? result.parameters.content.substring(0, 500) + '...\n[Content truncated]'
                : result.parameters.content
              }
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}