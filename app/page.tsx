'use client';

import ToolResult from '@/components/chat/ToolResult';
import { ToolCallResult } from '@/components/chat/types';
import RepoSelector from '@/components/RepoSelector';
import { generateId } from 'ai';
import { Message, useChat } from 'ai/react';
import { useState } from 'react';
import Spinner from './Spinner';


export default function Chat() {
  const [sessionID] = useState(generateId(4));
  const [repoCloned, setRepoCloned] = useState(false);
  const [repositoryPath, setRepositoryPath] = useState<string>('');

  const { messages, input, handleInputChange, handleSubmit, data, isLoading } = useChat({
    api: '/api/chat',
    body: {
      sessionID,
      repositoryPath,
    },
  });

  const toolCallsResults = data ? (data as unknown as ToolCallResult[]) : [];

  // Generate a map of message role to text color
  const roleToColorMap: Record<Message['role'], string> = {
    system: 'red',
    user: 'black',
    function: 'blue',
    tool: 'purple',
    assistant: 'green',
    data: 'orange',
  };

  const handleRepoSelected = (result: any) => {
    if (result.success) {
      setRepoCloned(true);
      setRepositoryPath(result.repositoryPath);
      console.log('Repository cloned successfully:', result);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl py-8 mx-auto">
      {/* Repository Selector Section - Only show if repo not cloned */}
      {!repoCloned && (
        <div className="mb-8">
          <RepoSelector sessionID={sessionID} onRepoSelected={handleRepoSelected} />
        </div>
      )}

      {/* Chat Section - Only show if repo is cloned */}
      {repoCloned && (
        <div className="flex flex-col w-full max-w-md mx-auto">
          {messages.length > 0
            ? messages.map((m: Message, i: number) => (
              <div
                key={m.id}
                className="whitespace-pre-wrap"
                style={{ color: roleToColorMap[m.role] }}
              >
                {toolCallsResults.filter(t => t.messageIdx === i).map(t => (
                  <ToolResult key={t.tool_call_id} toolCallResult={t} />
                ))}
                <strong>{`${m.role}: `}</strong>
                {m.content || JSON.stringify(m.tool_calls)}
                <br />
                <br />
              </div>
            ))
            : null}
          <div id="chart-goes-here"></div>
          {isLoading && <div className="fixed bottom-24 flex justify-center w-full max-w-md"><Spinner /></div>}
          <form onSubmit={handleSubmit}>
            <input
              className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
            />
          </form>
        </div>
      )}
    </div>
  );
}