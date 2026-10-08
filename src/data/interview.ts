/**
 * Interview-prep topic groups, shared by the sidebar and the homepage.
 *
 * Files keep their numeric prefixes on disk (01-javascript-core.md); doc ids drop
 * them. Labels are set here because the files' H1s are long ("React Advanced
 * (Performance, Internals & Patterns) (44 questions)") and must not be edited.
 */
export type Topic = { id: string; label: string };
export type TopicGroup = { label: string; topics: Topic[] };

export const INTERVIEW_GROUPS: TopicGroup[] = [
  {
    label: 'Core language & frontend',
    topics: [
      { id: 'javascript-core', label: 'JavaScript Core' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'react-core', label: 'React Core' },
      { id: 'react-advanced', label: 'React Advanced' },
      { id: 'state-management', label: 'State Management' },
      { id: 'nextjs-ssr', label: 'Next.js & SSR' },
    ],
  },
  {
    label: 'Backend & APIs',
    topics: [
      { id: 'nodejs-runtime', label: 'Node.js Runtime' },
      { id: 'express', label: 'Express' },
      { id: 'nestjs', label: 'NestJS' },
      { id: 'rest-api-design', label: 'REST API Design' },
      { id: 'auth-security', label: 'Auth & Security' },
      { id: 'graphql', label: 'GraphQL' },
    ],
  },
  {
    label: 'Data',
    topics: [
      { id: 'mongodb-mongoose', label: 'MongoDB & Mongoose' },
      { id: 'sql-postgres-prisma', label: 'SQL, Postgres & Prisma' },
      { id: 'redis-jobs-caching', label: 'Redis, Caching & Jobs' },
      { id: 'realtime-websockets', label: 'Real-time & WebSockets' },
    ],
  },
  {
    label: 'Architecture & quality',
    topics: [
      { id: 'testing', label: 'Testing' },
      { id: 'architecture-patterns', label: 'Architecture Patterns' },
      { id: 'design-patterns', label: 'Design Patterns' },
      { id: 'system-design', label: 'System Design' },
      { id: 'message-brokers-microservices', label: 'Message Brokers' },
    ],
  },
  {
    label: 'Web platform',
    topics: [
      { id: 'web-browser-fundamentals', label: 'Web & Browser' },
      { id: 'accessibility-a11y', label: 'Accessibility' },
    ],
  },
  {
    label: 'Infrastructure & operations',
    topics: [
      { id: 'devops-git', label: 'DevOps & Git' },
      { id: 'nginx-advanced', label: 'Nginx' },
      { id: 'monitoring-observability', label: 'Observability' },
    ],
  },
  {
    label: 'Security & fintech',
    topics: [
      { id: 'security-deep-dive', label: 'Security Deep-Dive' },
      { id: 'fintech-financial-domain', label: 'Fintech Domain' },
    ],
  },
  {
    label: 'Interview day',
    topics: [
      { id: 'coding-dsa', label: 'Coding & DSA' },
      { id: 'behavioral-hr', label: 'Behavioral & HR' },
      { id: 'project-deep-dives', label: 'Project Deep-Dives' },
      { id: 'real-world-scenarios', label: 'Real-World Scenarios' },
      { id: 'predicted-interview-questions', label: 'Predicted Questions' },
    ],
  },
];

export const TOPIC_COUNT = INTERVIEW_GROUPS.reduce((n, g) => n + g.topics.length, 0);
