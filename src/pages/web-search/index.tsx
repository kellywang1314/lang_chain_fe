/* 联网搜索: 通义千问模型 */
import { useState } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';

interface ApiResponse {
  query: string;
  agentOutput: string;
  model: string;
}

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('/dashscope/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('Search API Response:', data);

      if (data.agentOutput) {
        setOutput(data.agentOutput);
      } else {
        setError('未收到有效的回答内容');
      }

    } catch (err) {
      console.error('Search Error:', err);
      setError(err instanceof Error ? err.message : '搜索请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Web Search</title>
      </Helmet>

      <h1 className={styles.title}>AI Web Search</h1>

      <div className={styles.searchBox}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="请输入搜索内容..."
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? '思考中...' : '提问'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading && <div className={styles.loading}>正在联网搜索与思考...</div>}

      {output && (
        <div className={styles.outputContainer}>
          <ReactMarkdown>{output}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
