import { EditFileResult } from './types';

interface EditFileDisplayProps {
  result: EditFileResult;
}

export default function EditFileDisplay({ result }: EditFileDisplayProps) {
  return (
    <div className="flex flex-col border-blue-400 border rounded-md p-2 mb-4 space-y-1 text-blue-700">
      <strong>edit_file:</strong>
      <div className="text-sm text-gray-600">Path: {result.parameters.path}</div>

      {result.parameters.use_llm && (
        <div className="text-sm text-gray-600">Mode: LLM-based intelligent diff</div>
      )}

      {result.error ? (
        <div className="text-red-600">Error: {result.error}</div>
      ) : result.result ? (
        <div className="space-y-2">
          <div className="text-green-600 font-medium">{result.result.message}</div>

          {result.result.changesApplied && result.result.changesApplied.length > 0 && (
            <div>
              <div className="text-sm font-medium">Changes Applied:</div>
              <ul className="text-sm list-disc list-inside text-gray-700">
                {result.result.changesApplied.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          {result.result.originalLength !== undefined && result.result.finalLength !== undefined && (
            <div className="text-sm text-gray-600">
              Length: {result.result.originalLength} → {result.result.finalLength} characters
            </div>
          )}

          {!result.parameters.use_llm && result.parameters.old_text && result.parameters.new_text && (
            <div className="text-xs">
              <div className="font-medium">Replacement:</div>
              <div className="bg-red-50 p-1 rounded border-l-2 border-red-300">
                <span className="text-red-700">- </span>
                <span className="bg-red-100">{result.parameters.old_text}</span>
              </div>
              <div className="bg-green-50 p-1 rounded border-l-2 border-green-300">
                <span className="text-green-700">+ </span>
                <span className="bg-green-100">{result.parameters.new_text}</span>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}