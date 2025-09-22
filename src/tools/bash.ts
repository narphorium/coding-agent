import { CreateMessage, StreamData } from 'ai';

export const bashTool = {
  type: 'function' as const,
  function: {
    name: 'bash',
    description: 'Execute bash commands in the sandbox environment.',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The bash command to execute',
        },
        working_directory: {
          type: 'string',
          description: 'Optional working directory to run the command in',
        },
        timeout: {
          type: 'number',
          description: 'Optional timeout in milliseconds (default: 30000)',
        },
      },
      required: ['command'],
    },
  },
};

export async function handleBash(
  toolCall: any,
  data: StreamData,
  messages: any[],
  appendToolCallMessage: any,
  sandbox: any
): Promise<CreateMessage[]> {
  try {
    const command = toolCall.func.arguments.command as string;
    const workingDirectory = toolCall.func.arguments.working_directory as string | undefined;
    const timeout = toolCall.func.arguments.timeout as number | undefined;

    // Build the command options
    const commandOptions: any = {
      timeout: timeout || 30000,
    };

    if (workingDirectory) {
      commandOptions.cwd = workingDirectory;
    }

    // Execute the command
    const result = await sandbox.commands.run(command, commandOptions);

    data.append({
      messageIdx: messages.length,
      function_name: "bash",
      parameters: {
        command: command,
        working_directory: workingDirectory || null,
        timeout: timeout || null
      },
      tool_call_id: toolCall.id,
      result: {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exit_code: result.exitCode
      }
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'bash',
      tool_call_result: {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exit_code: result.exitCode,
      },
    });

    return msgs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error executing bash command';

    data.append({
      messageIdx: messages.length,
      function_name: "bash",
      parameters: {
        command: toolCall.func.arguments.command as string,
        working_directory: (toolCall.func.arguments.working_directory as string) || null,
        timeout: (toolCall.func.arguments.timeout as number) || null
      },
      tool_call_id: toolCall.id,
      error: errorMessage
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'bash',
      tool_call_result: {
        error: errorMessage,
      },
    });

    return msgs;
  }
}