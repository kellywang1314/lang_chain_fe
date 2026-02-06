import { Helmet } from '@modern-js/runtime/head';
import styles from './index.module.scss';

const agents = [
  {
    id: 'chat',
    title: '智能对话助手',
    description: '具备上下文记忆能力的 AI 助手，可以陪你聊天、解答问题，支持清除记忆重新开始。',
    path: '/chat',
    icon: '💬',
    theme: 'chat',
  },
  {
    id: 'search',
    title: 'AI 联网搜索',
    description: '实时连接互联网，获取最新资讯和知识。AI 会自动整理搜索结果，生成精准的答案。',
    path: '/web-search',
    icon: '🔍',
    theme: 'search',
  },
  {
    id: 'translate',
    title: '智能多语翻译',
    description: '支持多种语言互译，能够理解上下文语境，提供比传统机器翻译更自然、准确的结果。',
    path: '/translate',
    icon: '🌐',
    theme: 'translate',
  },
  {
    id: 'image',
    title: '图片文字提取',
    description: '强大的 OCR 能力，只需上传图片，即可快速识别并提取其中的所有文字信息。',
    path: '/image-read',
    icon: '📷',
    theme: 'image',
  },
];

const IndexPage = () => {
  return (
    <div className={styles.container}>
      <Helmet>
        <title>LangChain AI Agents</title>
      </Helmet>

      <header className={styles.header}>
        <h1>
          Explore <span>AI Agents</span>
        </h1>
        <p>
          这里汇集了多种强大的 AI 能力，选择一个 Agent 开始体验吧。
        </p>
      </header>

      <div className={styles.grid}>
        {agents.map((agent) => (
          <a key={agent.id} href={agent.path} className={styles.card}>
            <div className={`${styles.icon} ${styles[agent.theme]}`}>
              {agent.icon}
            </div>
            <h2>{agent.title}</h2>
            <p>{agent.description}</p>
            <div className={styles.footer}>
              立即体验
              <span className={styles.arrow}>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default IndexPage;
