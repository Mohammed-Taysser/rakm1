// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Rakm1',
	tagline: 'Rakm1 is cool',
	favicon: 'img/favicon.ico',

	// Set the production url of your site here
	url: 'https://Mohammed-Taysser.github.io',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'Mohammed-Taysser', // Usually your GitHub org/user name.
	projectName: 'rakm1', // Usually your repo name.

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internalization, you can use this field to set useful
	// metadata like html lang. For example, if your site is Chinese, you may want
	// to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
				},
				blog: false,
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			}),
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			// Replace with your project's social card
			image: 'img/docusaurus-social-card.jpg',

			navbar: {
				title: 'Rakm1',
				logo: {
					alt: 'Rakm1 favicon',
					src: 'img/favicon.png',
				},
				items: [
					{
						type: 'docSidebar',
						sidebarId: 'tutorialSidebar',
						position: 'left',
						label: 'Tutorial',
					},
					{
						href: 'https://github.com/mohammed-Taysser/notes',
						label: 'GitHub',
						position: 'right',
					},
				],
			},
			footer: {
				copyright: `Copyright © 2023-${new Date().getFullYear()} Rakm1, All Right Reseved.`,
			},
			prism: {
				theme: lightCodeTheme,
				darkTheme: darkCodeTheme,
				additionalLanguages: ['pug'],
			},
		}),
	plugins: [],
	themes: ['@docusaurus/theme-live-codeblock'],
};

module.exports = config;
