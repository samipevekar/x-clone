import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { TbMessageChatbot } from "react-icons/tb";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Ensure you are using the correct style
import RightPanelSkeleton from '../../components/skeletons/RightPanelSkeleton';

export default function AiChat() {

  const HOST = import.meta.env.VITE_URL

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.trim().startsWith('* ')) {
        return (
          <li key={index} className="ml-4 list-disc">
            {formatText(line.trim().slice(2))}
          </li>
        );
      }
      return (
        <p key={index} className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap"> {/* Prevent overflow */}
          {formatText(line)}
        </p>
      );
    });
  };

  const formatText = (text) => {
    // Check if the text is code and skip formatting for bold
    if (text.startsWith('```')) {
      return text.replace(/```/g, ''); // Simply return the code without formatting
    }

    // Format bold text with the HTML <strong> tag
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      try {
        setIsLoading(true);
        setError(null);
        setMessages([...messages, { sender: 'user', text: query }]);
        
        const response = await fetch(`${HOST}/api/ai/chat/${query}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch AI response.');
        }

        setMessages([...messages, { sender: 'user', text: query }, { sender: 'ai', text: data }]);
        setQuery('');
      } catch (err) {
        setError('Something went wrong. Please try again later.');
        console.error("Error fetching AI response:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  

  return (
    <div className="flex flex-col h-screen p-4 border-r-[1px] border-gray-700 w-full">
      {messages.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <TbMessageChatbot className='h-40 w-40 text-primary' />
          <h1 className='font-bold text-[40px]'><span className='text-primary'>Talk</span>Buddy</h1>
          <h2 className='text-[40px] font-bold max-sm:text-[30px] text-center'>Welcome, <span className='text-primary'>{authUser?.fullName}</span></h2>
        </div>
      )}

      <div className="flex-grow overflow-y-auto mb-4 p-2 max-sm:p-0">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-center mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' ? (
              <>
                <TbMessageChatbot className="w-10 h-10 mr-2 text-primary" />
                <span className="inline-block max-w-[600px] max-sm:max-w-[250px] overflow-auto  text-ellipsis bg-white text-black px-4 py-2 my-3 rounded-lg">
                  {msg.text.startsWith('```') ? (
                    <>
                      <SyntaxHighlighter language="javascript" style={atomDark}>
                        {msg.text.replace(/```/g, '')}
                      </SyntaxHighlighter>
                    </>
                  ) : (
                    formatMessage(msg.text)
                  )}
                </span>
              </>
            ) : (
              <>
                <span className="inline-block max-sm:max-w-[250px] px-4 py-2 rounded-lg bg-blue-500 text-white">
                  {msg.text}
                </span>
                <img src={authUser?.profileImg || '/avatar-placeholder.png'} alt="User Avatar" className="w-6 h-6 rounded-full ml-2" />
              </>
            )}
          </div>
        ))}
        {isLoading && <div className="text-center text-gray-500"><RightPanelSkeleton/></div>}
        {error && (
          <div className="text-center text-red-500">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-500 rounded-md"
          placeholder="Ask TalkBuddy..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-md" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
