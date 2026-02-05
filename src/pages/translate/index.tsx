import { useState } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';

const LANGUAGES = [
  { code: 'en', name: '英语' },
  { code: 'zh', name: '简体中文' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '韩语' },
  { code: 'fr', name: '法语' },
  { code: 'de', name: '德语' },
  { code: 'es', name: '西班牙语' },
];

const TranslatePage = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('/dashscope/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input,
          targetLanguage: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Translate API Response:', data);

      // 适配 API 返回结构：优先取 translatedText
      const resultText = data.translatedText || data.output || data.result || '';

      if (resultText) {
        setOutput(resultText);
      } else {
        setError('翻译结果为空');
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '翻译请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>AI Translator</title>
      </Helmet>

      <h1 className={styles.title}>AI 智能翻译</h1>

      <div className={styles.controls}>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              目标语言: {lang.name}
            </option>
          ))}
        </select>

        <button onClick={handleTranslate} disabled={loading || !input.trim()}>
          {loading ? '翻译中...' : '开始翻译'}
        </button>
      </div>

      <div className={styles.translationArea}>
        <div className={styles.inputBox}>
          <header>源文本</header>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入要翻译的内容..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleTranslate();
              }
            }}
          />
        </div>

        <div className={`${styles.outputBox} ${loading ? styles.loading : ''}`}>
          <header>译文 ({LANGUAGES.find(l => l.code === targetLang)?.name})</header>
          <div className={styles.content}>
            {loading ? (
              <span>正在思考与翻译...</span>
            ) : output ? (
              <ReactMarkdown>{output}</ReactMarkdown>
            ) : (
              <span style={{ color: '#ccc' }}>翻译结果将显示在这里</span>
            )}
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default TranslatePage;
