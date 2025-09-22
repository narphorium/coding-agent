import { CreateMessage, StreamData, Tool } from 'ai';
import { evaluateCode, nonEmpty } from '../codeInterpreter';

export const executePythonCodeTool: Tool = {
  type: 'function',
  function: {
    name: 'execute_python_code',
    description: 'Execute python code in Jupyter Notebook via code interpreter.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: `Python code that will be directly executed via Jupyter Notebook.
The stdout, stderr and results will be returned as a JSON object.
Subsequent calls to the tool will keep the state of the interpreter.`,
        },
      },
      required: ['code'],
    },
  },
};

export async function handleExecutePythonCode(
  toolCall: any,
  data: StreamData,
  messages: any[],
  appendToolCallMessage: any,
  sessionID: string
): Promise<CreateMessage[]> {
  const evaluation = await evaluateCode(
    sessionID, toolCall.func.arguments.code as string,
  );

  data.append({
    messageIdx: messages.length,
    function_name: "execute_python_code",
    parameters: {
      code: toolCall.func.arguments.code as string
    },
    tool_call_id: toolCall.id,
    evaluation: {
      stdout: evaluation.stdout,
      stderr: evaluation.stderr,
      ...(evaluation.error && {
        error: {
          traceback: evaluation.error.traceback,
          name: evaluation.error.name,
          value: evaluation.error.value,
        }
      }),
      results: evaluation.results.map(t => JSON.parse(JSON.stringify(t))),
    }
  });

  const msgs = appendToolCallMessage({
    tool_call_id: toolCall.id,
    function_name: 'execute_python_code',
    tool_call_result: {
      stdout: evaluation.stdout,
      stderr: evaluation.stderr,
      ...(evaluation.error && {
        traceback: evaluation.error.traceback,
        name: evaluation.error.name,
        value: evaluation.error.value,
      }),
      results: evaluation.results.map(result => result.text).filter(nonEmpty),
    },
  });

  return msgs;
}