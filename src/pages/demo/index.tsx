import { Helmet } from '@modern-js/runtime/head';
import styles from './index.module.scss';

/**
 * Demo 页面
 * 路由路径: /demo
 */
const Index = () => (
  <div className={styles.containerBox}>
    <Helmet>
      <link
        rel="icon"
        type="image/x-icon"
        href="https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/favicon.ico"
      />
    </Helmet>
    <main>
      <div className={styles.title}>
        Welcome to
        <img
          className={styles.logo}
          src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/modern-js-logo.svg"
          alt="Modern.js Logo"
        />
        <p className={styles.name}>Modern.js</p>
      </div>
      <p className={styles.description}>
        当前页面位于 <code className={styles.code}>src/pages/demo/index.tsx</code>
      </p>
      <div className={styles.grid}>
        <a
          href="https://modernjs.dev/guides/get-started/introduction.html"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.card}
        >
          <h2>
            Guide
            <img
              className={styles.arrowRight}
              src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/arrow-right.svg"
              alt="Guide"
            />
          </h2>
          <p>Follow the guides to use all features of Modern.js.</p>
        </a>
        <a
          href="https://modernjs.dev/tutorials/foundations/introduction.html"
          target="_blank"
          className={styles.card}
          rel="noreferrer"
        >
          <h2>
            Tutorials
            <img
              className={styles.arrowRight}
              src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/arrow-right.svg"
              alt="Tutorials"
            />
          </h2>
          <p>Learn to use Modern.js to create your first application.</p>
        </a>
        <a
          href="https://modernjs.dev/configure/app/usage.html"
          target="_blank"
          className={styles.card}
          rel="noreferrer"
        >
          <h2>
            Config
            <img
              className={styles.arrowRight}
              src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/arrow-right.svg"
              alt="Config"
            />
          </h2>
          <p>Find all configuration options provided by Modern.js.</p>
        </a>
        <a
          href="https://github.com/web-infra-dev/modern.js"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.card}
        >
          <h2>
            GitHub
            <img
              className={styles.arrowRight}
              src="https://lf3-static.bytednsdoc.com/obj/eden-cn/zq-uylkvT/ljhwZthlaukjlkulzlp/arrow-right.svg"
              alt="Github"
            />
          </h2>
          <p>View the source code on GitHub; feel free to contribute.</p>
        </a>
      </div>
    </main>
  </div>
);

export default Index;
