import { ProjectLayoutResult } from './types';

interface ProjectLayoutDisplayProps {
  result: ProjectLayoutResult;
}

export default function ProjectLayoutDisplay({ result }: ProjectLayoutDisplayProps) {
  return (
    <div className="flex flex-col border-purple-400 border rounded-md p-2 mb-4 space-y-1 text-purple-700">
      <strong>project_layout:</strong>
      <div className="text-sm text-gray-600">
        Root: {result.parameters.rootPath || 'current directory'}
        {result.parameters.maxDepth && ` | Max Depth: ${result.parameters.maxDepth}`}
        {result.parameters.includeHidden && ' | Include Hidden'}
      </div>
      {result.error ? (
        <div className="text-red-600">Error: {result.error}</div>
      ) : result.result ? (
        <div>
          <div className="text-sm font-medium">Directory Structure:</div>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">{result.result.structure}</pre>
        </div>
      ) : null}
    </div>
  );
}