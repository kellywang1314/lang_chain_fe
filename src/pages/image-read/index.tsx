import { useState, useRef } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import ReactMarkdown from 'react-markdown';
import { convertFileToBase64 } from '../../utils/help';
import styles from './index.module.scss';

const ImageReadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];


      // 简单验证
      if (!file.type.startsWith('image/')) {
        setError('请上传图片文件 (JPG, PNG, GIF 等)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('图片大小不能超过 5MB');
        return;
      }

      setSelectedFile(file);
      // 为本地的文件对象（如用户选中的图片）创建一个 临时的、浏览器可访问的 URL 字符串
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setOutput(''); // 清空上次结果
    }
  };


  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const base64Image = await convertFileToBase64(selectedFile);
      const response = await fetch('/dashscope/image-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          prompt: "请提取图片中的所有文字，并保持原有的格式。",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Image Read API Response:', data);

      // 适配返回结构：优先使用 answerLines，其次是 answer
      let resultText = '';
      if (Array.isArray(data.answerLines)) {
        resultText = data.answerLines.join('\n');
      } else if (data.answer) {
        resultText = data.answer;
      } else {
        // 兼容其他可能的字段
        resultText = data.text || data.output || data.content || (data.agentOutput ? data.agentOutput : '');
      }

      if (resultText) {
        setOutput(resultText);
      } else {
        setError('未能识别出文字');
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '识别请求失败');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Image to Text</title>
      </Helmet>

      <h1 className={styles.title}>AI 图片文字提取</h1>

      <div className={styles.mainContent}>
        {/* 左侧：上传区 */}
        <div className={styles.uploadSection}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div
            className={styles.dropZone}
            onClick={triggerFileInput}
          >
            {previewUrl ? (
              <div className={styles.preview}>
                <img src={previewUrl} alt="Preview" />
              </div>
            ) : (
              <>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L12 8" stroke="#4ecaff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11L12 8 15 11" stroke="#4ecaff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 16H16" stroke="#4ecaff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z" stroke="#ddd" strokeWidth="2"/>
                </svg>
                <p>点击上传或拖拽图片到这里</p>
                <span style={{ fontSize: '12px', color: '#999' }}>支持 JPG, PNG (最大 5MB)</span>
              </>
            )}
          </div>

          <button
            className={styles.uploadButton}
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
          >
            {loading ? '正在识别...' : '开始提取文字'}
          </button>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        {/* 右侧：结果区 */}
        <div className={styles.resultSection}>
          <div className={styles.outputBox}>
            <h3>识别结果</h3>
            <div className={styles.content}>
              {loading ? (
                <div className={styles.loading}>
                  <span>AI 正在分析图片内容...</span>
                </div>
              ) : output ? (
                <ReactMarkdown>{output}</ReactMarkdown>
              ) : (
                <div className={styles.placeholder}>
                  暂无识别结果
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageReadPage;
