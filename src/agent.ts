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
import { executePythonCodeTool, handleExecutePythonCode } from './tools/execute_python_code';
import { handleProjectLayout, projectLayoutTool } from './tools/project_layout';
import { handleReadFile, readFileTool } from './tools/read_file';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const tools: Tool[] = [
  executePythonCodeTool,
  readFileTool,
  projectLayoutTool,
];

export async function createChatCompletion(messages: any[], sessionID: string, repositoryPath?: string) {
  const model = 'gpt-4-turbo';

  // Use provided repository path or try to determine it from sandbox
  let currentRepositoryPath = repositoryPath;
  if (!repositoryPath) {
    console.warn('No repository path provided');  
  }

  // Create system prompt describing available tools and repository path
  const systemPrompt = `You are a helpful coding assistant with access to the following tools:

1. **execute_python_code**: Execute Python code in a Jupyter Notebook environment. This tool maintains state between calls, so variables and imports persist across executions.

2. **read_file**: Read the contents of any file from the filesystem. Use this to examine code files, configuration files, or any other files in the project.

3. **project_layout**: Get the full directory structure of the repository as text. This helps you understand the project organization and find relevant files.

**Current Repository Path**: ${currentRepositoryPath}

You are working in a sandboxed environment where the repository has been cloned. Use these tools to explore, understand, and work with the codebase effectively. When you need to understand the project structure, start with the project_layout tool. When you need to examine specific files, use read_file. When you need to run Python code or analyze data, use execute_python_code.

Always be thorough in your analysis and provide clear explanations of what you find.`;

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
  const stream = OpenAIStream(response, {
    experimental_onToolCall: async (
      call: ToolCallPayload,
      appendToolCallMessage,
    ) => {
      const newMessages: CreateMessage[] = [];
      const sandbox = await getSandbox(sessionID);

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
        }
      }

      return openai.chat.completions.create({
        messages: [...messages, ...newMessages],
        model,
        stream: true,
        tools,
        tool_choice: 'auto',
      });
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