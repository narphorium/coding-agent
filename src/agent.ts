import {
  CreateMessage,
  OpenAIStream,
  StreamData,
  StreamingTextResponse,
  Tool,
  ToolCallPayload,
} from 'ai';
import OpenAI from 'openai';
import { getSandbox } from './codeInterpreter';
import { bashTool, handleBash } from './tools/bash';
import { editFileTool, handleEditFile } from './tools/edit_file';
import { executePythonCodeTool, handleExecutePythonCode } from './tools/execute_python_code';
import { finishedTool, handleFinished } from './tools/finished';
import { handleProjectLayout, projectLayoutTool } from './tools/project_layout';
import { handleReadFile, readFileTool } from './tools/read_file';
import { handleWriteFile, writeFileTool } from './tools/write_file';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const tools: Tool[] = [
  executePythonCodeTool,
  readFileTool,
  projectLayoutTool,
  writeFileTool,
  editFileTool,
  bashTool,
  finishedTool,
];

export async function createChatCompletion(messages: any[], sessionID: string, repositoryPath?: string, model: string = 'gpt-4o') {

  // Use provided repository path or try to determine it from sandbox
  let currentRepositoryPath = repositoryPath;
  if (!repositoryPath) {
    console.warn('No repository path provided');
  }

  // Create system prompt describing available tools and repository path
  const systemPrompt = `You are an autonomous coding assistant with access to powerful tools for exploring, understanding, and modifying codebases. Your approach should be methodical and thorough:

## PLANNING PHASE (Always start here):
1. **ALWAYS** start by using the **project_layout** tool to understand the repository structure
2. **ALWAYS** read relevant files using **read_file** to understand the existing codebase before making changes
3. Plan your approach based on what you learn from exploration
4. Think step-by-step about what needs to be done

## Available Tools:

1. **project_layout**: Get the full directory structure of the repository. ALWAYS use this first to understand the project organization.

2. **read_file**: Read the contents of any file from the filesystem. Use this extensively to examine code files, configuration files, and understand existing patterns.

3. **write_file**: Create new files with specified content. Use this to create new files when needed.

4. **edit_file**: Edit existing files by replacing specific text with new text. Use this to modify existing code.

5. **bash**: Execute bash/shell commands in the sandbox environment. Use this for building, testing, installing dependencies, etc.

6. **execute_python_code**: Execute Python code in a Jupyter Notebook environment. This tool maintains state between calls.

7. **finished**: Call this when you have completed the task successfully. This signals that no more tool calls are needed.

## IMPORTANT WORKFLOW:
- Spend significant time exploring and understanding before making changes
- Use project_layout and read_file extensively in the planning phase
- Make changes incrementally and test as you go
- Call the finished tool when the task is complete
- You can make multiple tool calls in sequence until the task is done
- Always used fenced code blocks when writing code and include the language after the backticks.

**Current Repository Path**: ${currentRepositoryPath}

You are working in a sandboxed environment where the repository has been cloned. Take your time to understand the codebase thoroughly before implementing changes. Quality and correctness are more important than speed.`;

  // Add system prompt to the beginning of messages if not already present
  const messagesWithSystem = messages[0]?.role === 'system'
    ? messages
    : [{ role: 'system', content: systemPrompt }, ...messages];

  const response = await openai.chat.completions.create({
    model,
    stream: true,
    messages: messagesWithSystem,
    tools,
    tool_choice: 'auto',
  });

  const data = new StreamData();

  const stream = OpenAIStream(response as any, {
    experimental_onToolCall: async (
      call: ToolCallPayload,
      appendToolCallMessage,
    ) => {
      const newMessages: CreateMessage[] = [];
      const sandbox = await getSandbox(sessionID);
      let isFinished = false;

      for (const toolCall of call.tools) {
        if (toolCall.func.name === 'execute_python_code') {
          const msgs = await handleExecutePythonCode(toolCall, data, messages, appendToolCallMessage, sessionID);
          newMessages.push(...msgs);
        } else if (toolCall.func.name === 'read_file') {
          const msgs = await handleReadFile(toolCall, data, messages, appendToolCallMessage, sandbox);
          newMessages.push(...msgs);
        } else if (toolCall.func.name === 'project_layout') {
          const msgs = await handleProjectLayout(toolCall, data, messages, appendToolCallMessage, sandbox);
          newMessages.push(...msgs);
        } else if (toolCall.func.name === 'write_file') {
          const msgs = await handleWriteFile(toolCall, data, messages, appendToolCallMessage, sandbox);
          newMessages.push(...msgs);
        } else if (toolCall.func.name === 'edit_file') {
          const msgs = await handleEditFile(toolCall, data, messages, appendToolCallMessage, sandbox);
          newMessages.push(...msgs);
        } else if (toolCall.func.name === 'bash') {
          const msgs = await handleBash(toolCall, data, messages, appendToolCallMessage, sandbox);
          newMessages.push(...msgs);
        } else if (toolCall.func.name === 'finished') {
          const msgs = await handleFinished(toolCall, data, messages, appendToolCallMessage, sandbox);
          newMessages.push(...msgs);
          isFinished = true;
        }
      }

      // Continue the conversation with tools unless finished
      if (!isFinished) {
        return openai.chat.completions.create({
          messages: [...messages, ...newMessages],
          model,
          stream: true,
          tools,
          tool_choice: 'auto',
        }) as any;
      }

      // When finished is called, we should stop the agentic loop
      return null;
    },
    onCompletion(completion) {
      console.log('completion', completion);
    },
    async onFinal(completion) {
      await data.close();
    },
  });

  return new StreamingTextResponse(stream, {}, data);
}