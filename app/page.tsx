'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import LiveDate from './components/LiveDate';
import DocumentTypesSlider from './components/DocumentTypesSlider';
import DataCenter from './components/DataCenter';
import UploadSteps from './components/UploadSteps';
import StatsCounter from './components/StatsCounter';
import DirectorMessage from './components/DirectorMessage';
import Navbar from './components/Navbar';
import CollegeInfo from './components/CollegeInfo';
import FeedbackForm from '@/app/components/FeedbackForm';
import VideoBackground from './components/VideoBackground';

interface ChatMessage {
  message: string;
  response: string;
  timestamp: string;
  error?: boolean;
}

export default function Home() {
  const router = useRouter();
  const [heroRef] = useInView({ triggerOnce: true });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasFetchedHistory = useRef(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.ycislocker.space/api';

  const getToken = () => {
    return localStorage.getItem('token') || '';
  };

  useEffect(() => {
    if (!isChatOpen || hasFetchedHistory.current) return;

    const fetchHistory = async () => {
      const token = getToken();
      if (!token) {
        setErrorMessage('Please log in to use the chatbot.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        const response = await axios.get<ChatMessage[]>(`${API_BASE_URL}/chat/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data.reverse());
        hasFetchedHistory.current = true;
      } catch (error: unknown) {
        let errorMsg = 'Failed to load chat history.';
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMsg = error.response.data.error;
        }
        setErrorMessage(errorMsg);
        if (["No token provided", "Invalid token"].includes(errorMsg)) {
          setTimeout(() => router.push('/login'), 2000);
        }
      }
    };

    fetchHistory();
  }, [isChatOpen, API_BASE_URL, router]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const token = getToken();
    if (!token) {
      setErrorMessage('Please log in to use the chatbot.');
      setInputMessage('');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    const userMessage = inputMessage.trim();
    const tempMessage: ChatMessage = {
      message: userMessage,
      response: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await axios.post<ChatMessage>(
        `${API_BASE_URL}/chat/message`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev.filter((m) => m !== tempMessage), res.data]);
    } catch (error: unknown) {
      let errorMsg = 'Sorry, something went wrong.';
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      setMessages((prev) => [
        ...prev.filter((m) => m !== tempMessage),
        { ...tempMessage, response: errorMsg, error: true },
      ]);
      if (["No token provided", "Invalid token"].includes(errorMsg)) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) {
      setErrorMessage(null);
      hasFetchedHistory.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <LiveDate />
      <Navbar />
      <main className="flex flex-col">
        <section ref={heroRef}>
          <VideoBackground />
        </section>
        <DirectorMessage />
        <DocumentTypesSlider />
        <StatsCounter />
        <UploadSteps />
        <CollegeInfo />
        <DataCenter />

        <section ref={ctaRef} className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 mix-blend-multiply" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative text-center py-16 px-6">
                <h2 className="text-3xl font-bold text-white mb-8">Ready to Get Started?</h2>
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-full hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
                >
                  Create Your Account
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <FeedbackForm />

      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={toggleChat}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          aria-label="Open AI Chatbot"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </motion.button>
      </div>

      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-xl z-50 flex flex-col max-h-[80vh]"
          role="dialog"
        >
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">YCIS Chatbot</h3>
            <button onClick={toggleChat} aria-label="Close Chat">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 && !errorMessage && (
              <p className="text-gray-500 text-center">Start a conversation!</p>
            )}
            {errorMessage && (
              <div className="text-left mb-4">
                <p className="inline-block bg-red-100 text-red-800 rounded-lg px-3 py-2 max-w-[70%]">{errorMessage}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="mb-4">
                {msg.message && (
                  <div className="text-right">
                    <p className="inline-block bg-blue-100 text-blue-800 rounded-lg px-3 py-2 max-w-[70%]">{msg.message}</p>
                  </div>
                )}
                {msg.response && (
                  <div className="text-left mt-2">
                    <p className={`inline-block px-3 py-2 rounded-lg max-w-[70%] ${msg.error ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                      {msg.response}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {isLoading && <p className="text-gray-500 text-center">Typing...</p>}
          </div>
          <div className="p-4 border-t bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700"
                disabled={isLoading}
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-6 py-12"></div>
      </footer>
    </div>
  );
}
