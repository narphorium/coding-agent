import { CreateMessage, StreamData, Tool, ToolCallPayload } from 'ai';

export const readFileTool: Tool = {
  type: 'function',
  function: {
    name: 'read_file',
    description: 'Read the contents of a file from the filesystem.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The file path to read from',
        },
      },
      required: ['path'],
    },
  },
};

export async function handleReadFile(
  toolCall: any,
  data: StreamData,
  messages: any[],
  appendToolCallMessage: any,
  sandbox: any
): Promise<CreateMessage[]> {
  try {
    const filePath = toolCall.func.arguments.path as string;
    const fileContent = await sandbox.files.read(filePath);

    data.append({
      messageIdx: messages.length,
      function_name: "read_file",
      parameters: {
        path: filePath
      },
      tool_call_id: toolCall.id,
      result: {
        content: fileContent
      }
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'read_file',
      tool_call_result: {
        content: fileContent,
      },
    });

    return msgs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error reading file';

    data.append({
      messageIdx: messages.length,
      function_name: "read_file",
      parameters: {
        path: toolCall.func.arguments.path as string
      },
      tool_call_id: toolCall.id,
      error: errorMessage
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'read_file',
      tool_call_result: {
        error: errorMessage,
      },
    });

    return msgs;
  }
}