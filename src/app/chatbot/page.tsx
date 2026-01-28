"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, BlackboxChatRequest, BlackboxChatResponse } from "@/lib/types";
import {
  searchTextbook,
  buildSourcesBlock,
  getIndexStatus,
  isIndexReady,
} from "@/lib/textbook/hcmRag";

const BLACKBOX_API_URL = "https://api.blackbox.ai/chat/completions";
const DEFAULT_MODEL = "blackboxai/openai/gpt-5.1";
const SCORE_THRESHOLD = 0.8; // Minimum score to consider sources relevant
const MAX_HISTORY_TURNS = 6; // Last N turns to send to LLM

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexStatus, setIndexStatus] = useState<"building" | "ready" | "not_started">("not_started");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());

  // Build index on mount
  useEffect(() => {
    const buildIndex = async () => {
      setIndexStatus("building");
      try {
        // Trigger index build by doing a dummy search
        await searchTextbook("hồ chí minh", { topK: 1 });
        setIndexStatus("ready");
      } catch (err) {
        console.error("Failed to build index:", err);
        setError("Không thể khởi tạo chỉ mục giáo trình. Vui lòng tải lại trang.");
        setIndexStatus("not_started");
      }
    };

    buildIndex();
  }, []);

  // Check index status periodically while building
  useEffect(() => {
    if (indexStatus === "building") {
      const interval = setInterval(() => {
        const status = getIndexStatus();
        if (status === "ready") {
          setIndexStatus("ready");
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [indexStatus]);

  // Load API key from env or localStorage
  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_BLACKBOX_API_KEY;
    const storedKey = localStorage.getItem("blackbox_api_key");
    if (envKey) {
      setApiKey(envKey);
    } else if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build system prompt with sources
  const buildSystemPrompt = (sourcesBlock: string, userQuestion: string): string => {
    const isIncompleteQuestion = userQuestion.trim().endsWith("...") || 
                                 userQuestion.trim().endsWith("..") ||
                                 (userQuestion.length < 30 && !userQuestion.includes("?"));

    return `Bạn là một trợ lý AI chuyên về giáo trình "Tư tưởng Hồ Chí Minh" dành cho bậc đại học không chuyên ngành lý luận chính trị.

QUY TẮC NGHIÊM NGẶT:
1. CHỈ được sử dụng thông tin từ SOURCES được cung cấp bên dưới để trả lời
2. BẮT BUỘC trích dẫn nguồn bằng cách sử dụng [1], [2], [3]... trong câu trả lời khi tham khảo từ mỗi source
3. Nếu câu hỏi không hoàn chỉnh hoặc bị cắt, hãy:
   - Đọc kỹ SOURCES để hiểu ngữ cảnh và ý định của câu hỏi
   - Sử dụng thông tin trong SOURCES để trả lời phần có thể trả lời được
   - Nếu có thể suy luận được ý định câu hỏi từ SOURCES, hãy trả lời dựa trên đó
4. Nếu thông tin trong SOURCES hoàn toàn không liên quan đến câu hỏi, hãy nói rõ: "Theo nội dung giáo trình được cung cấp, tôi không tìm thấy thông tin liên quan đến câu hỏi này."
5. KHÔNG được bịa đặt hoặc suy đoán thông tin ngoài SOURCES
6. Trả lời bằng tiếng Việt, rõ ràng, có cấu trúc (ý chính -> giải thích -> trích dẫn)
7. Khi sử dụng markdown **text** để làm nổi bật, hãy đảm bảo đóng đúng cặp dấu ** và hoàn thành toàn bộ câu trả lời, không bị cắt giữa chừng

SOURCES:
${sourcesBlock}

Hãy trả lời câu hỏi của người dùng dựa trên SOURCES trên. Nếu câu hỏi không hoàn chỉnh, hãy sử dụng thông tin trong SOURCES để suy luận và trả lời phần có thể trả lời được. Nhớ trích dẫn [n] khi sử dụng thông tin từ mỗi source.`;
  };

  // Get last N turns for LLM context
  const getLastTurns = (allMessages: ChatMessage[]): ChatMessage[] => {
    // Get last MAX_HISTORY_TURNS messages (user + assistant pairs)
    const turns: ChatMessage[] = [];
    for (let i = allMessages.length - 1; i >= 0 && turns.length < MAX_HISTORY_TURNS; i--) {
      turns.unshift(allMessages[i]);
    }
    return turns;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isIndexReady()) return;

    if (!apiKey.trim()) {
      setError("Vui lòng nhập API key của Blackbox AI");
      return;
    }

    const userQuestion = input.trim();

    const userMessage: ChatMessage = {
      role: "user",
      content: userQuestion,
      timestamp: new Date(),
    };

    // Add user message to UI immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Search textbook
      const sources = await searchTextbook(userQuestion);

      // Check if sources are relevant
      // Lower threshold for incomplete questions (ending with ...)
      const isIncomplete = userQuestion.trim().endsWith("...") || userQuestion.trim().endsWith("..");
      const threshold = isIncomplete ? 0.6 : SCORE_THRESHOLD;
      
      if (sources.length === 0 || (sources[0] && sources[0].score < threshold)) {
        const rejectionMessage: ChatMessage = {
          role: "assistant",
          content:
            "Mình không tìm thấy nội dung này trong giáo trình HCM.txt mà mình đang có. Bạn thử hỏi lại bằng từ khóa khác hoặc nói rõ chương/mục.",
          timestamp: new Date(),
          sources: [],
        };
        setMessages((prev) => [...prev, rejectionMessage]);
        setIsLoading(false);
        return;
      }

      // Build sources block
      const sourcesBlock = buildSourcesBlock(sources);

      // Build system prompt (pass userQuestion for context)
      const systemPrompt = buildSystemPrompt(sourcesBlock, userQuestion);

      // Get last N turns
      const lastTurns = getLastTurns(updatedMessages.slice(0, -1)); // Exclude current user message

      // Prepare request
      const requestBody: BlackboxChatRequest = {
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...lastTurns.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
          { role: "user", content: userQuestion },
        ],
        temperature: 0.2,
        max_tokens: 2500,
        stream: false,
      };

      // Call Blackbox AI API
      const response = await fetch(BLACKBOX_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API error: ${response.status} ${response.statusText}`
        );
      }

      const data: BlackboxChatResponse = await response.json();

      if (data.choices && data.choices.length > 0) {
        // Convert sources to SourceReference format
        const sourceRefs = sources.map((s) => ({
          title: s.title,
          chapter: s.chapter,
          startLine: s.startLine,
          endLine: s.endLine,
          score: s.score,
        }));

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.choices[0].message.content,
          timestamp: new Date(),
          sources: sourceRefs,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Không nhận được phản hồi từ AI");
      }
    } catch (err) {
      console.error("Error calling Blackbox AI:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi gọi API. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setExpandedSources(new Set());
  };

  const toggleSource = (index: number) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSources(newExpanded);
  };

  // Render message content with markdown bold (**text**) as blue bold
  const renderMessageContent = (content: string) => {
    // Improved regex to handle multiple ** patterns and edge cases
    // Match **text** but allow for nested or incomplete patterns
    const parts: Array<{ type: "bold" | "text"; content: string }> = [];
    let currentIndex = 0;
    const regex = /\*\*([^*]+?)\*\*/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push({
          type: "text",
          content: content.substring(currentIndex, match.index),
        });
      }
      // Add the bold text
      parts.push({
        type: "bold",
        content: match[1], // The text inside **
      });
      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(currentIndex),
      });
    }

    // If no matches found, return original content
    if (parts.length === 0) {
      return <span className="whitespace-pre-wrap">{content}</span>;
    }

    // Render parts
    return (
      <>
        {parts.map((part, idx) => {
          if (part.type === "bold") {
            return (
              <strong key={idx} className="text-blue-600 font-bold">
                {part.content}
              </strong>
            );
          }
          return (
            <span key={idx} className="whitespace-pre-wrap">
              {part.content}
            </span>
          );
        })}
      </>
    );
  };

  if (indexStatus === "building" || indexStatus === "not_started") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang lập chỉ mục giáo trình...</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chatbot AI - Giáo trình Tư tưởng Hồ Chí Minh
          </h1>
          <p className="text-gray-600">
            Đặt câu hỏi về nội dung trong giáo trình Tư tưởng Hồ Chí Minh
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Lỗi:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">Chào mừng đến với Chatbot AI!</p>
                <p>Hãy đặt câu hỏi về giáo trình Tư tưởng Hồ Chí Minh</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <div
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div>
                        {message.role === "assistant" 
                          ? renderMessageContent(message.content)
                          : <span className="whitespace-pre-wrap">{message.content}</span>}
                      </div>
                      {message.timestamp && (
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sources for assistant messages */}
                  {message.role === "assistant" &&
                    message.sources &&
                    message.sources.length > 0 && (
                      <div className="mt-2 ml-0">
                        <button
                          onClick={() => toggleSource(index)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <svg
                            className={`w-3 h-3 transition-transform ${
                              expandedSources.has(index) ? "rotate-90" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          Nguồn ({message.sources.length})
                        </button>
                        {expandedSources.has(index) && (
                          <div className="mt-2 ml-4 space-y-2 text-xs text-gray-600">
                            {message.sources.map((source, srcIdx) => (
                              <div
                                key={srcIdx}
                                className="bg-gray-50 p-2 rounded border border-gray-200"
                              >
                                <div className="font-medium text-gray-700">
                                  [{srcIdx + 1}] {source.title}
                                  {source.chapter && ` (Chương ${source.chapter})`}
                                </div>
                                <div className="text-gray-500 mt-1">
                                  Dòng {source.startLine + 1}-{source.endLine + 1} • Score:{" "}
                                  {source.score.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn về giáo trình..."
              rows={3}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isLoading || !isIndexReady()}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !isIndexReady()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang gửi..." : "Gửi"}
              </button>
              <button
                onClick={handleClearChat}
                disabled={messages.length === 0}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Xóa
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Nhấn Enter để gửi, Shift+Enter để xuống dòng
          </p>
        </div>
      </div>
    </div>
  );
}
