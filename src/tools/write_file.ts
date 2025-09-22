import { CreateMessage, StreamData, Tool, ToolCallPayload } from 'ai';

export const writeFileTool: Tool = {
  type: 'function',
  function: {
    name: 'write_file',
    description: 'Write content to a file in the filesystem.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The file path to write to',
        },
        content: {
          type: 'string',
          description: 'The content to write to the file',
        },
      },
      required: ['path', 'content'],
    },
  },
};

export async function handleWriteFile(
  toolCall: any,
  data: StreamData,
  messages: any[],
  appendToolCallMessage: any,
  sandbox: any
): Promise<CreateMessage[]> {
  try {
    const filePath = toolCall.func.arguments.path as string;
    const fileContent = toolCall.func.arguments.content as string;

    await sandbox.files.write(filePath, fileContent);

    data.append({
      messageIdx: messages.length,
      function_name: "write_file",
      parameters: {
        path: filePath,
        content: fileContent
      },
      tool_call_id: toolCall.id,
      result: {
        success: true,
        message: `File written successfully to ${filePath}`
      }
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'write_file',
      tool_call_result: {
        success: true,
        message: `File written successfully to ${filePath}`,
      },
    });

    return msgs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error writing file';

    data.append({
      messageIdx: messages.length,
      function_name: "write_file",
      parameters: {
        path: toolCall.func.arguments.path as string,
        content: toolCall.func.arguments.content as string
      },
      tool_call_id: toolCall.id,
      error: errorMessage
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'write_file',
      tool_call_result: {
        error: errorMessage,
      },
    });

    return msgs;
  }
}