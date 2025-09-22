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

export interface EditFileResult extends BaseToolCallResult {
  function_name: 'edit_file';
  parameters: {
    path: string;
    old_text?: string;
    new_text?: string;
    edited_content?: string;
    use_llm?: boolean;
    model?: string;
  };
  result?: {
    success: boolean;
    message: string;
    changesApplied?: string[];
    originalLength?: number;
    finalLength?: number;
  };
  error?: string;
}

export interface WriteFileResult extends BaseToolCallResult {
  function_name: 'write_file';
  parameters: {
    path: string;
    content: string;
  };
  result?: {
    success: boolean;
    message: string;
  };
  error?: string;
}

export interface BashResult extends BaseToolCallResult {
  function_name: 'bash';
  parameters: {
    command: string;
    working_directory?: string | null;
    timeout?: number | null;
  };
  result?: {
    success: boolean;
    stdout: string;
    stderr: string;
    exit_code: number;
  };
  error?: string;
}

export type ToolCallResult = ExecutePythonCodeResult | ReadFileResult | ProjectLayoutResult | EditFileResult | WriteFileResult | BashResult;