import { ToolCallResult } from './types';
import ExecutePythonCodeDisplay from './ExecutePythonCodeDisplay';
import ReadFileDisplay from './ReadFileDisplay';
import ProjectLayoutDisplay from './ProjectLayoutDisplay';
import EditFileDisplay from './EditFileDisplay';
import WriteFileDisplay from './WriteFileDisplay';
import BashDisplay from './BashDisplay';

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
    case 'edit_file':
      return <EditFileDisplay result={toolCallResult} />;
    case 'write_file':
      return <WriteFileDisplay result={toolCallResult} />;
    case 'bash':
      return <BashDisplay result={toolCallResult} />;
    default:
      return null;
  }
}