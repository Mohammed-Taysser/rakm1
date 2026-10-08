import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import interviewStatsPlugin from './plugins/interview-stats';

const config: Config = {
  title: 'Rakm1',
  tagline: 'Interview prep and engineering reference for full-stack JavaScript.',
  favicon: 'img/favicon.svg',

  url: 'https://mohammed-taysser.github.io',
  baseUrl: '/rakm1/',
  organizationName: 'Mohammed-Taysser',
  projectName: 'rakm1',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  future: {
    v4: true,
    faster: true,
  },

  markdown: {
    // .md files are parsed as plain CommonMark, so years of old notes with raw
    // `<`, `{` and HTML render without being rewritten as MDX.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    },
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [interviewStatsPlugin],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: '/',
        docsDir: 'docs',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'Rakm1',
      logo: {
        alt: 'Rakm1 logo',
        src: 'img/logo.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'interview', position: 'left', label: 'Interview Prep' },
        { to: '/interview-prep/coverage-gaps', position: 'left', label: 'Coverage Gaps' },
        {
          href: 'https://github.com/Mohammed-Taysser/rakm1',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Study',
          items: [
            { label: 'Interview Prep', to: '/interview-prep/javascript-core' },
            { label: 'Coverage gaps', to: '/interview-prep/coverage-gaps' },
          ],
        },
        {
          title: 'Source',
          items: [{ label: 'GitHub', href: 'https://github.com/Mohammed-Taysser/rakm1' }],
        },
      ],
      copyright: `Rakm1 · maintained by Mohammed Taysser · ${new Date().getFullYear()}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['bash', 'json', 'yaml', 'sql', 'nginx', 'docker', 'graphql', 'scss', 'pug', 'diff', 'ini'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
