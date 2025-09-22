import { ReadFileResult } from './types';

interface ReadFileDisplayProps {
  result: ReadFileResult;
}

export default function ReadFileDisplay({ result }: ReadFileDisplayProps) {
  return (
    <div className="flex flex-col border-green-400 border rounded-md p-2 mb-4 space-y-1 text-green-700">
      <strong>read_file:</strong>
      <div className="text-sm text-gray-600">Path: {result.parameters.path}</div>
      {result.error ? (
        <div className="text-red-600">Error: {result.error}</div>
      ) : result.result ? (
        <div>
          <div className="text-sm font-medium">File Content:</div>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">{result.result.content}</pre>
        </div>
      ) : null}
    </div>
  );
}