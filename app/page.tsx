'use client';

import MessageContent from '@/components/chat/MessageContent';
import ToolResult from '@/components/chat/ToolResult';
import { ToolCallResult } from '@/components/chat/types';
import ModelPicker from '@/components/ModelPicker';
import RepoSelector from '@/components/RepoSelector';
import { generateId } from 'ai';
import { Message, useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';


export default function Chat() {
  const [sessionID] = useState(generateId(4));
  const [repoCloned, setRepoCloned] = useState(false);
  const [repositoryPath, setRepositoryPath] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [showStatusMessage, setShowStatusMessage] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, data, isLoading } = useChat({
    api: '/api/chat',
    body: {
      sessionID,
      repositoryPath,
      model: selectedModel,
    },
  });

  const toolCallsResults = data ? (data as unknown as ToolCallResult[]) : [];
  
  // Debug logging
  console.log('Messages:', messages);
  console.log('Tool results:', toolCallsResults);
  messages.forEach((msg, idx) => {
    console.log(`Message ${idx}:`, {
      role: msg.role,
      content: msg.content?.substring(0, 100),
      tool_calls: msg.tool_calls,
      id: msg.id
    });
  });

  // Hide status message when first chat message is sent
  useEffect(() => {
    if (messages.length > 0 && showStatusMessage) {
      setShowStatusMessage(false);
    }
  }, [messages.length, showStatusMessage]);

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
      setShowStatusMessage(true);
      console.log('Repository cloned successfully:', result);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl pt-8 pb-24 mx-auto">
      {/* Repository Selector Section - Only show if repo not cloned */}
      {!repoCloned && (
        <div className="mb-8">
          <RepoSelector sessionID={sessionID} onRepoSelected={handleRepoSelected} />
        </div>
      )}

      {/* Status Message - Show when repo is cloned and no messages yet */}
      {repoCloned && showStatusMessage && messages.length === 0 && (
        <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-medium">Repository successfully cloned!</p>
          <p className="text-sm">Repository: {repositoryPath}</p>
        </div>
      )}

      {/* Chat Section - Only show if repo is cloned */}
      {repoCloned && (
        <div className="flex flex-col w-full max-w-md mx-auto">
          {messages.length > 0
            ? messages.map((m: Message, i: number) => {
              // For the last assistant message, show all tool results
              const isLastAssistantMessage = m.role === 'assistant' && 
                !messages.slice(i + 1).some(msg => msg.role === 'assistant');
              
              return (
                <div
                  key={m.id}
                  className="whitespace-pre-wrap"
                  style={{ color: roleToColorMap[m.role] }}
                >
                  <strong>{`${m.role}: `}</strong>
                  {m.role === 'assistant' && m.content ? (
                    <MessageContent content={m.content} />
                  ) : (
                    m.content || JSON.stringify(m.tool_calls)
                  )}
                  
                  {/* Display tool results for the last assistant message */}
                  {isLastAssistantMessage && toolCallsResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm text-gray-600 font-semibold">Tool Calls:</div>
                      {toolCallsResults.map(t => (
                        <ToolResult key={t.tool_call_id} toolCallResult={t} />
                      ))}
                    </div>
                  )}
                  
                  <br />
                  <br />
                </div>
              );
            })
            : null}
          <div id="chart-goes-here"></div>
          {isLoading && <div className="fixed bottom-24 flex justify-center w-full max-w-md"><Spinner /></div>}
          
          {/* Model Picker and Chat Input */}
          <div className="fixed bottom-0 w-full max-w-md flex items-center gap-2 p-2 mb-8">
            <ModelPicker
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              disabled={isLoading}
            />
            <form onSubmit={handleSubmit} className="flex-1">
              <input
                className="w-full p-2 border border-gray-300 rounded shadow-xl"
                value={input}
                placeholder="Say something..."
                onChange={handleInputChange}
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}