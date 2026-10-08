import fs from 'node:fs/promises';
import path from 'node:path';
import type { LoadContext, Plugin } from '@docusaurus/types';

export type TopicStats = { questions: number; minutes: number };
export type InterviewStats = {
  topics: Record<string, TopicStats>;
  totals: { topics: number; questions: number; hours: number };
};

const WORDS_PER_MINUTE = 200;
const QUESTION_HEADING = /^#{2,4} +Q\d+[:.]/gm;

/**
 * Counts questions and reading time in the served interview-prep files at build
 * time, so the homepage numbers never drift from the pack. Reads the same files
 * the docs plugin serves (01–99, never the private 00 brief).
 */
export default function interviewStatsPlugin(context: LoadContext): Plugin<InterviewStats> {
  const dir = path.join(context.siteDir, 'docs', 'interview-prep');

  return {
    name: 'interview-stats',

    getPathsToWatch() {
      return [path.join(dir, '[0-9][0-9]-*.md')];
    },

    async loadContent() {
      const files = (await fs.readdir(dir)).filter((f) => /^(?!00)\d{2}-.+\.md$/.test(f));
      const topics: Record<string, TopicStats> = {};
      let questions = 0;
      let words = 0;

      for (const file of files) {
        const text = await fs.readFile(path.join(dir, file), 'utf8');
        const fileWords = text.split(/\s+/).filter(Boolean).length;
        const fileQuestions = text.match(QUESTION_HEADING)?.length ?? 0;
        topics[file.replace(/^\d{2}-/, '').replace(/\.md$/, '')] = {
          questions: fileQuestions,
          minutes: Math.max(1, Math.round(fileWords / WORDS_PER_MINUTE)),
        };
        questions += fileQuestions;
        words += fileWords;
      }

      return {
        topics,
        totals: { topics: files.length, questions, hours: Math.round(words / WORDS_PER_MINUTE / 60) },
      };
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
}
