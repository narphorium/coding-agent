// Tool call result interfaces
export interface BaseToolCallResult {
  messageIdx: number;
  tool_call_id: string;
  function_name: string;
}

export interface ExecutePythonCodeResult extends BaseToolCallResult {
  function_name: 'execute_python_code';
  parameters: {
    code: string;
  };
  evaluation: {
    stdout: string[];
    stderr: string[];
    error?: {
      traceback: string;
      name: string;
      value: string;
    };
    results: any[];
  };
}

export interface ReadFileResult extends BaseToolCallResult {
  function_name: 'read_file';
  parameters: {
    path: string;
  };
  result?: {
    content: string;
  };
  error?: string;
}

export interface ProjectLayoutResult extends BaseToolCallResult {
  function_name: 'project_layout';
  parameters: {
    rootPath?: string;
    maxDepth?: number;
    includeHidden?: boolean;
  };
  result?: {
    structure: string;
  };
  error?: string;
}

export type ToolCallResult = ExecutePythonCodeResult | ReadFileResult | ProjectLayoutResult;