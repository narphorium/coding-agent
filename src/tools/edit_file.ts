import { CreateMessage, StreamData } from 'ai';
import { applyEditWithLLM } from '../applyEdit';

export const editFileTool = {
  type: 'function' as const,
  function: {
    name: 'edit_file',
    description: 'Edit the contents of a file. Supports two modes: 1) Simple replacement of old_text with new_text, or 2) LLM-based intelligent diff application using edited_content.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The file path to edit',
        },
        old_text: {
          type: 'string',
          description: 'The existing text to replace (for simple replacement mode)',
        },
        new_text: {
          type: 'string',
          description: 'The new text to replace the old text with (for simple replacement mode)',
        },
        edited_content: {
          type: 'string',
          description: 'The complete edited version of the file content (for LLM-based intelligent diff mode)',
        },
        use_llm: {
          type: 'boolean',
          description: 'Whether to use LLM-based intelligent diff application. If true, edited_content is required. If false, old_text and new_text are required.',
          default: false,
        },
        model: {
          type: 'string',
          description: 'The model to use for LLM-based editing (only used when use_llm is true)',
          default: 'gpt-4-turbo',
        },
      },
      required: ['path'],
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
    const useLLM = toolCall.func.arguments.use_llm as boolean || false;
    const model = toolCall.func.arguments.model as string || 'gpt-4-turbo';

    // Read the current file content
    let currentContent = '';
    try {
      currentContent = await sandbox.files.read(filePath);
    } catch (error) {
      // File might not exist, use empty string as original content
      currentContent = '';
    }

    let updatedContent: string;
    let successMessage: string;
    let changesApplied: string[] = [];

    if (useLLM) {
      // LLM-based intelligent diff mode
      const editedContent = toolCall.func.arguments.edited_content as string;

      if (!editedContent) {
        throw new Error('edited_content is required when use_llm is true');
      }

      const editResult = await applyEditWithLLM(
        currentContent,
        editedContent,
        filePath,
        model
      );

      if (!editResult.success) {
        throw new Error(`Failed to apply LLM edit: ${editResult.error}`);
      }

      updatedContent = editResult.finalContent;
      changesApplied = editResult.changesApplied || [];
      successMessage = `File edited successfully using LLM: ${changesApplied.join(', ')} in ${filePath}`;
    } else {
      // Simple replacement mode
      const oldText = toolCall.func.arguments.old_text as string;
      const newText = toolCall.func.arguments.new_text as string;

      if (!oldText || !newText) {
        throw new Error('old_text and new_text are required when use_llm is false');
      }

      // Check if the old text exists in the file
      if (!currentContent.includes(oldText)) {
        throw new Error(`Text "${oldText}" not found in file ${filePath}`);
      }

      // Replace the old text with new text
      updatedContent = currentContent.replace(oldText, newText);
      successMessage = `File edited successfully: replaced "${oldText}" with "${newText}" in ${filePath}`;
    }

    // Write the updated content back to the file
    await sandbox.files.write(filePath, updatedContent);

    const resultData = {
      success: true,
      message: successMessage,
      ...(useLLM && {
        changesApplied,
        originalLength: currentContent.length,
        finalLength: updatedContent.length
      })
    };

    data.append({
      messageIdx: messages.length,
      function_name: "edit_file",
      parameters: {
        path: filePath,
        ...(useLLM ?
          { edited_content: toolCall.func.arguments.edited_content, use_llm: true, model } :
          { old_text: toolCall.func.arguments.old_text, new_text: toolCall.func.arguments.new_text, use_llm: false }
        )
      },
      tool_call_id: toolCall.id,
      result: resultData
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'edit_file',
      tool_call_result: resultData,
    });

    return msgs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error editing file';

    data.append({
      messageIdx: messages.length,
      function_name: "edit_file",
      parameters: {
        path: toolCall.func.arguments.path as string,
        use_llm: toolCall.func.arguments.use_llm || false,
        ...(toolCall.func.arguments.use_llm ?
          { edited_content: toolCall.func.arguments.edited_content } :
          { old_text: toolCall.func.arguments.old_text, new_text: toolCall.func.arguments.new_text }
        )
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