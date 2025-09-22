import { CreateMessage, StreamData } from 'ai';

export const editFileTool = {
  type: 'function' as const,
  function: {
    name: 'edit_file',
    description: 'Edit the contents of a file by replacing specific text with new text.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The file path to edit',
        },
        old_text: {
          type: 'string',
          description: 'The existing text to replace',
        },
        new_text: {
          type: 'string',
          description: 'The new text to replace the old text with',
        },
      },
      required: ['path', 'old_text', 'new_text'],
    },
  },
};

export async function handleEditFile(
  toolCall: any,
  data: StreamData,
  messages: any[],
  appendToolCallMessage: any,
  sandbox: any
): Promise<CreateMessage[]> {
  try {
    const filePath = toolCall.func.arguments.path as string;
    const oldText = toolCall.func.arguments.old_text as string;
    const newText = toolCall.func.arguments.new_text as string;

    // Read the current file content
    const currentContent = await sandbox.files.read(filePath);

    // Check if the old text exists in the file
    if (!currentContent.includes(oldText)) {
      throw new Error(`Text "${oldText}" not found in file ${filePath}`);
    }

    // Replace the old text with new text
    const updatedContent = currentContent.replace(oldText, newText);

    // Write the updated content back to the file
    await sandbox.files.write(filePath, updatedContent);

    data.append({
      messageIdx: messages.length,
      function_name: "edit_file",
      parameters: {
        path: filePath,
        old_text: oldText,
        new_text: newText
      },
      tool_call_id: toolCall.id,
      result: {
        success: true,
        message: `File edited successfully: replaced "${oldText}" with "${newText}" in ${filePath}`
      }
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'edit_file',
      tool_call_result: {
        success: true,
        message: `File edited successfully: replaced "${oldText}" with "${newText}" in ${filePath}`,
      },
    });

    return msgs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error editing file';

    data.append({
      messageIdx: messages.length,
      function_name: "edit_file",
      parameters: {
        path: toolCall.func.arguments.path as string,
        old_text: toolCall.func.arguments.old_text as string,
        new_text: toolCall.func.arguments.new_text as string
      },
      tool_call_id: toolCall.id,
      error: errorMessage
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'edit_file',
      tool_call_result: {
        error: errorMessage,
      },
    });

    return msgs;
  }
}