import { useState, useRef, useEffect } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '你好！我是你的 AI 助手，有什么可以帮你的吗？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('session-1'); // 默认 Session ID
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/dashscope/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: userMessage,
          sessionId: sessionId,
          model: 'qwen-plus', // 可选
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`);
      }

      const data = await response.json();
      const aiAnswer = data.answer || '抱歉，我没有听懂。';

      setMessages(prev => [...prev, { role: 'ai', content: aiAnswer }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: '🚫 发送失败，请稍后重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearMemory = async () => {
    if (!confirm('确定要清除当前会话的记忆吗？')) return;

    try {
      await fetch('/dashscope/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      setMessages([{ role: 'ai', content: '记忆已清除，我们可以重新开始了。' }]);
    } catch (error) {
      alert('清除失败');
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>AI Chat</title>
      </Helmet>

      <header className={styles.header}>
        <h1>智能对话助手</h1>
        <div className={styles.controls}>
          <input
            type="text"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            placeholder="Session ID"
            title="会话 ID，用于保持上下文"
          />
          <button onClick={handleClearMemory}>清除记忆</button>
        </div>
      </header>

      <div className={styles.chatArea} ref={chatAreaRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.messageRow} ${styles[msg.role]}`}>
            <div className={styles.avatar}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className={styles.bubble}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.messageRow} ${styles.ai}`}>
             <div className={styles.avatar}>🤖</div>
             <div className={styles.bubble}>
               <span className={styles.loading}>正在思考...</span>
             </div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="输入消息，按 Enter 发送..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          发送
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
