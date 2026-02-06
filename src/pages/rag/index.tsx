import { useState, useRef } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  sources?: string[];
}

const TABS = [
  { id: 'text', label: '添加文本' },
  { id: 'file', label: '上传文件 (PDF/TXT)' },
] as const;

const RagPage = () => {
  // Knowledge Base State
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Q&A State
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  // --- Knowledge Base Handlers ---

  const handleAddText = async () => {
    if (!textInput.trim()) return;
    setIsUploading(true);
    setUploadStatus(null);

    try {
      const res = await fetch('/dashscope/rag/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });

      if (!res.ok) throw new Error(res.statusText);

      setTextInput('');
      setUploadStatus({ type: 'success', msg: '文本已成功添加到知识库' });
    } catch (err) {
      setUploadStatus({ type: 'error', msg: '添加失败，请重试' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/dashscope/rag/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      setSelectedFile(null);
      setUploadStatus({ type: 'success', msg: `文件上传成功，已切分为 ${data.chunks} 个片段` });
    } catch (err) {
      setUploadStatus({ type: 'error', msg: '文件上传失败' });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus(null);
    }
  };

  // --- Q&A Handlers ---

  const handleQuery = async () => {
    if (!query.trim()) return;

    const userQ = query;
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: userQ }]);
    setIsQuerying(true);

    try {
      const res = await fetch('/dashscope/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQ }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();

      setChatHistory(prev => [...prev, {
        role: 'ai',
        content: data.answer,
        sources: data.sources
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: '抱歉，查询出错了。' }]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>RAG Knowledge Base</title>
      </Helmet>

      <h1 className={styles.title}>RAG 知识库问答</h1>

      <div className={styles.layout}>
        {/* 左侧：知识库管理 */}
        <div className={styles.leftPanel}>
          <div className={styles.card}>
            <h2>知识库管理 (当前为内存模式，重启丢失)</h2>

            <div className={styles.tabHeader}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? styles.active : ''}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'text' ? (
              <div className={styles.textInputArea}>
                <textarea
                  placeholder="请输入要存入知识库的文本内容..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                />
                <button
                  className={styles.actionButton}
                  onClick={handleAddText}
                  disabled={isUploading || !textInput.trim()}
                >
                  {isUploading ? '添加中...' : '添加到知识库'}
                </button>
              </div>
            ) : (
              <div className={styles.fileUploadAreaWrapper}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  accept=".pdf,.txt,.md"
                  style={{ display: 'none' }}
                />
                <div
                  className={styles.fileUploadArea}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p>{selectedFile ? selectedFile.name : '点击选择文件'}</p>
                  <span>支持 PDF, TXT, Markdown</span>
                </div>
                <button
                  className={styles.actionButton}
                  onClick={handleFileUpload}
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? '上传处理中...' : '上传并建立索引'}
                </button>
              </div>
            )}

            {uploadStatus && (
              <div className={`${styles.statusMessage} ${styles[uploadStatus.type]}`}>
                {uploadStatus.msg}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：问答 */}
        <div className={styles.rightPanel}>
          <div className={styles.card}>
            <h2>知识库问答</h2>

            <div className={styles.chatHistory}>
              {chatHistory.length === 0 && (
                <div style={{ textAlign: 'center', color: '#999', marginTop: 100 }}>
                  向我提问，我会基于左侧知识库的内容回答
                </div>
              )}

              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`${styles.messageItem} ${styles[msg.role]}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className={styles.sources}>
                      <h4>参考来源片段：</h4>
                      {msg.sources.map((src, i) => (
                        <div key={i} className={styles.sourceItem}>{src}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isQuerying && (
                <div className={`${styles.messageItem} ${styles.ai}`}>
                  思考中...
                </div>
              )}
            </div>

            <div className={styles.queryInput}>
              <input
                type="text"
                placeholder="请输入你的问题..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuery()}
              />
              <button onClick={handleQuery} disabled={isQuerying || !query.trim()}>
                提问
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RagPage;
