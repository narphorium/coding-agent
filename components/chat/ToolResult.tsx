import { ToolCallResult } from './types';
import ExecutePythonCodeDisplay from './ExecutePythonCodeDisplay';
import ReadFileDisplay from './ReadFileDisplay';
import ProjectLayoutDisplay from './ProjectLayoutDisplay';

interface ToolResultProps {
  toolCallResult: ToolCallResult;
}

export default function ToolResult({ toolCallResult }: ToolResultProps) {
  switch (toolCallResult.function_name) {
    case 'execute_python_code':
      return <ExecutePythonCodeDisplay result={toolCallResult} />;
    case 'read_file':
      return <ReadFileDisplay result={toolCallResult} />;
    case 'project_layout':
      return <ProjectLayoutDisplay result={toolCallResult} />;
    default:
      return null;
  }
}