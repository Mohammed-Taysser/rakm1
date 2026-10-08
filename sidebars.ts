import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import { INTERVIEW_GROUPS } from './src/data/interview';

const sidebars: SidebarsConfig = {
  interview: [
    ...INTERVIEW_GROUPS.map((group, i) => ({
      type: 'category' as const,
      label: group.label,
      collapsed: i !== 0,
      items: group.topics.map((t) => ({ type: 'doc' as const, id: `interview-prep/${t.id}`, label: t.label })),
    })),
    'coverage-gaps',
  ],
};

export default sidebars;
