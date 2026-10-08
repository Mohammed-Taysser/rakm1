import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { usePluginData } from '@docusaurus/useGlobalData';
import { INTERVIEW_GROUPS, type TopicGroup } from '@site/src/data/interview';
import type { InterviewStats } from '@site/plugins/interview-stats';
import styles from './index.module.css';

/** Stroke icons (24×24) keyed by group label. */
const GROUP_ICONS: Record<string, ReactNode> = {
  'Core language & frontend': (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  'Backend & APIs': (
    <>
      <rect x="3" y="3" width="18" height="7" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
      <line x1="7" y1="6.5" x2="7.01" y2="6.5" />
      <line x1="7" y1="17.5" x2="7.01" y2="17.5" />
    </>
  ),
  Data: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  'Architecture & quality': (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  'Web platform': (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </>
  ),
  'Infrastructure & operations': (
    <>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </>
  ),
  'Security & fintech': <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  'Interview day': <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
};

const STEPS = [
  {
    title: 'Quick revision checklist',
    text: 'Every topic opens with a checklist of what you should be able to explain, so weak spots surface in minutes.',
  },
  {
    title: 'Basic → Intermediate → Advanced',
    text: 'Questions are layered by depth. Each has a model answer, and most come with runnable code.',
  },
  {
    title: 'Tips & red flags',
    text: "The interviewer's angle, likely follow-ups, and the mistakes that cost offers.",
  },
];

function Icon({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      {children}
    </svg>
  );
}

/** A real question from the pack, shown as a preview of the format. */
function SampleQuestion() {
  return (
    <Link to="/interview-prep/react-core" className={styles.sample} aria-label="Open React Core">
      <div className={styles.sampleHeader}>
        <span className={styles.sampleTopic}>React Core</span>
        <span className={styles.levels}>
          <span className={clsx(styles.level, styles.levelActive)}>Basic</span>
          <span className={styles.level}>Intermediate</span>
          <span className={styles.level}>Advanced</span>
        </span>
      </div>
      <p className={styles.sampleQuestion}>
        <span className={styles.sampleQ}>Q10</span> Why is using the array index as a key a problem?
      </p>
      <p className={styles.sampleAnswer}>
        <strong>A:</strong> When the list reorders, filters or inserts items, indices shift. The key no longer maps to
        the same data, so React reuses the wrong component instances and state leaks across rows.
      </p>
      <pre className={styles.sampleCode}>
        <code>
          <span className={styles.tokMuted}>{'// ✗ state follows the position'}</span>
          {'\n{items.map((item, i) => <Row key={i} />)}\n'}
          <span className={styles.tokMuted}>{'// ✓ state follows the data'}</span>
          {'\n{items.map((item) => <Row key={item.id} />)}'}
        </code>
      </pre>
      <p className={styles.sampleTip}>
        <strong>Tip:</strong> Index keys are fine only for static, append-only lists with no item state. Say that
        caveat to show precision.
      </p>
    </Link>
  );
}

function GroupCard({ label, topics, stats }: Readonly<TopicGroup & { stats: InterviewStats['topics'] }>) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>
          <Icon>{GROUP_ICONS[label]}</Icon>
        </span>
        <Heading as="h3" className={styles.cardTitle}>
          {label}
        </Heading>
      </div>
      <ul className={styles.cardList}>
        {topics.map((topic) => (
          <li key={topic.id}>
            <Link to={`/interview-prep/${topic.id}`}>
              <span>{topic.label}</span>
              {stats[topic.id] && <span className={styles.meta}>{stats[topic.id].minutes} min</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home(): ReactNode {
  const { topics, totals } = usePluginData('interview-stats') as InterviewStats;

  return (
    <Layout
      title="Full-stack interview prep"
      description="Rakm1 — interview prep and engineering reference for full-stack JavaScript teams.">
      <header className={styles.hero}>
        <div className={clsx('container', styles.heroInner)}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Team reference · Full-stack JavaScript</p>
            <Heading as="h1" className={styles.title}>
              Walk into the interview <span className={styles.accent}>already prepared.</span>
            </Heading>
            <p className={styles.lead}>
              Rakm1 is a question bank built on five years of shipping React, Node and NestJS products. It covers
              everything from closures to system design, with model answers, code and the interviewer's angle.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/interview-prep/javascript-core">
                Start with JavaScript Core
              </Link>
              <Link className="button button--secondary button--outline button--lg" to="/interview-prep/coverage-gaps">
                See what's next
              </Link>
            </div>
            <dl className={styles.stats}>
              <div>
                <dt>Topics</dt>
                <dd>{totals.topics}</dd>
              </div>
              <div>
                <dt>Questions</dt>
                <dd>{totals.questions.toLocaleString('en-US')}+</dd>
              </div>
              <div>
                <dt>Reading</dt>
                <dd>~{totals.hours} h</dd>
              </div>
            </dl>
          </div>
          <SampleQuestion />
        </div>
      </header>

      <main>
        <section className={clsx('container', styles.section)} aria-labelledby="tracks">
          <div className={styles.sectionHead}>
            <Heading as="h2" id="tracks" className={styles.sectionTitle}>
              Eight tracks, one stack
            </Heading>
            <p className={styles.sectionLead}>Pick a track, or go top to bottom for full coverage.</p>
          </div>
          <div className={styles.grid}>
            {INTERVIEW_GROUPS.map((group) => (
              <GroupCard key={group.label} {...group} stats={topics} />
            ))}
          </div>
        </section>

        <section className={styles.band} aria-labelledby="format">
          <div className={clsx('container', styles.section)}>
            <div className={styles.sectionHead}>
              <Heading as="h2" id="format" className={styles.sectionTitle}>
                How every topic is built
              </Heading>
            </div>
            <ol className={styles.steps}>
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                  <Heading as="h3" className={styles.stepTitle}>
                    {step.title}
                  </Heading>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={clsx('container', styles.section)}>
          <div className={styles.cta}>
            <div>
              <Heading as="h2" className={styles.ctaTitle}>
                Know where the gaps are
              </Heading>
              <p>
                AI/LLM engineering, HTML &amp; CSS, frontend machine coding and web performance are next, ranked by
                what 2026 interviews ask.
              </p>
            </div>
            <Link className={clsx('button button--lg', styles.ctaButton)} to="/interview-prep/coverage-gaps">
              View coverage gaps
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
