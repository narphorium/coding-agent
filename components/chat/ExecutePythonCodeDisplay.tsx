import { ExecutePythonCodeResult } from './types';

interface ExecutePythonCodeDisplayProps {
  result: ExecutePythonCodeResult;
}

export default function ExecutePythonCodeDisplay({ result }: ExecutePythonCodeDisplayProps) {
  return (
    <div className="flex flex-col border-blue-400 border rounded-md p-2 mb-4 space-y-1 text-blue-700">
      <strong>{result.function_name}:</strong>
      <pre>{result.parameters.code}</pre>
      {result.evaluation.stdout.length > 0 && <div>Stdout: {result.evaluation.stdout.join('\n')}</div>}
      {result.evaluation.stderr.length > 0 && <div>Stderr: {result.evaluation.stderr.join('\n')}</div>}
      {result.evaluation.error && (
        <div>
          <div>Error Name: {result.evaluation.error.name}</div>
          <div>Error Value: {result.evaluation.error.value}</div>
          <div>Error Traceback:</div>
          <pre>{result.evaluation.error.traceback}</pre>
        </div>
      )}
      {result.evaluation.results.length > 0 && <div>Results:</div>}
      {result.evaluation.results.length > 0 && <pre>{JSON.stringify(result.evaluation.results, null, 2)}</pre>}
    </div>
  );
}