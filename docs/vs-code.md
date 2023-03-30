
# VS-Code

## Fonts

- <https://devfonts.gafi.dev/>

## themes

- <https://vscodethemes.com/>

## Keyboard shortcuts for :sunglasses: Linux

| command             | details                                     |
| ------------------- | ------------------------------------------- |
| `Ctrl+Shift+P, F1`  | Show Command Palette                        |
| `Ctrl+P`            | Quick Open, Go to File                      |
| `Ctrl+Shift+N`      | New window/instance                         |
| `Ctrl+W`            | Close window/instance                       |
| `Ctrl+,`            | User Settings                               |
| `Alt+ ↓ / ↑`        | Move line down/up                           |
| `Ctrl+ ↑ / ↓`       | Scroll line up/down                         |
| `Ctrl+Shift+K`      | Delete line                                 |
| `Ctrl+Enter`        | Insert line above                           |
| `Ctrl+Shift+Enter`  | Insert line below                           |
| `Ctrl+Shift+\`      | Jump to matching bracket                    |
| `Ctrl+]`            | Indent line                                 |
| `Ctrl+[`            | Outdent line                                |
| `Ctrl+K M`          | Change file language                        |
| `Home`              | Go to beginning of line                     |
| `Ctrl+ Home`        | Go to beginning of file                     |
| `End`               | Go to end of line                           |
| `Ctrl+ End`         | Go to end of file                           |
| `Alt+ PgUp`         | Scroll page up                              |
| `Alt+ PgDn`         | Scroll page down                            |
| `Ctrl+Shift+ [`     | Fold region                                 |
| `Ctrl+Shift+ ]`     | unfold region                               |
| `Ctrl+Shift+A`      | Toggle block comment                        |
| `Alt+Click`         | Insert cursor*                              |
| `Ctrl+U`            | Undo last cursor operation                  |
| `Shift+Alt+ ↑ / ↓`  | Insert cursor above/below                   |
| `Ctrl+L`            | Select current line                         |
| `Ctrl+Shift+L`      | Select all occurrences of current selection |
| `Ctrl+F2`           | Select all occurrences of current word      |
| `F11`               | Toggle full screen                          |
| `Ctrl+Shift+E`      | Show Explorer / Toggle focus                |
| `Ctrl+Shift+F`      | Show Search                                 |
| `Ctrl+Shift+G`      | Show Source Control                         |
| `Ctrl+Shift+D`      | Show Debug                                  |
| `Ctrl+Shift+X`      | Show Extensions                             |
| `Ctrl+Shift+H`      | Replace in files                            |
| `Ctrl+Tab`          | Open next                                   |
| `Ctrl+Shift+Tab`    | Open previous                               |
| `Ctrl+K P`          | Copy path of active file                    |
| `Ctrl+K R`          | Reveal active file in Explorer              |
| `Ctrl+Shift+C`      | Open new command prompt/terminal            |
| `Ctrl+Shift+V`      | Open Markdown preview                       |
| `Ctrl+Shift+B`      | Run Build Task                              |
| `Ctrl+H`            | Replace                                     |
| `Shift+F5`          | Stop                                        |
| `Ctrl+D`            | Add selection to next Find match            |
| `Ctrl+T`            | Show all Symbols                            |
| `Ctrl+P`            | Go to File                                  |
| `Ctrl+\`            | Split editor                                |
| `Shift+ Home`       | Scroll to top                               |
| `Shift+ End`        | Scroll to bottom                            |
| ctrl + alt + arrow  | add cursor                                  |
| shift + arrow       | box selection                               |
| ctrl + shift + L    | select all occurrence                       |
| alt + shift + arrow | copy line                                   |
| f2                  | rename function with usage                  |
| ctrl + shift + ]    | code folding                                |
| ctrl + \            | spilt view                                  |

:::info
The `Alt+Click` gesture may not work on some Linux distributions.
You can change the modifier key for the Insert cursor command to
`Ctrl+Click` with the `editor.multiCursorModifier` setting.
:::

## Linux Extension

### To backup your extensions

```bash
code --list-extensions > ext.txt
```

```txt
adpyke.codesnap
AESSoft.aessoft-class-autocomplete
akamud.vscode-theme-onedark
akamud.vscode-theme-onelight
alefragnani.project-manager
amandeepmittal.pug
anteprimorac.html-end-tag-labels
bierner.color-info
bierner.emojisense
bierner.markdown-footnotes
bierner.markdown-mermaid
bierner.markdown-preview-github-styles
bmewburn.vscode-intelephense-client
bradlc.vscode-tailwindcss
chouzz.vscode-better-align
christian-kohler.npm-intellisense
christian-kohler.path-intellisense
DavidAnson.vscode-markdownlint
dbaeumer.vscode-eslint
deerawan.vscode-faker
deque-systems.vscode-axe-linter
DigitalBrainstem.javascript-ejs-support
donjayamanne.githistory
dsznajder.es7-react-js-snippets
EditorConfig.EditorConfig
emmanuelbeziat.vscode-great-icons
esbenp.prettier-vscode
firsttris.vscode-jest-runner
foxundermoon.shell-format
GraphQL.vscode-graphql
GraphQL.vscode-graphql-execution
GraphQL.vscode-graphql-syntax
jock.svg
kisstkondoros.vscode-codemetrics
kisstkondoros.vscode-gutter-preview
lokalise.i18n-ally
mads-hartmann.bash-ide-vscode
mgmcdermott.vscode-language-babel
mikestead.dotenv
MisterMunchkin.simple-markdown-snippets
mrmlnc.vscode-autoprefixer
mrmlnc.vscode-scss
ms-vscode.vscode-typescript-next
nhoizey.gremlins
Orta.vscode-jest
pflannery.vscode-versionlens
PKief.material-icon-theme
planbcoding.vscode-react-refactor
pmneo.tsimporter
pranaygp.vscode-css-peek
redhat.fabric8-analytics
Remisa.shellman
richie5um2.vscode-sort-json
rifi2k.format-html-in-php
ritwickdey.LiveServer
sburg.vscode-javascript-booster
SonarSource.sonarlint-vscode
standard.vscode-standard
streetsidesoftware.code-spell-checker
TabNine.tabnine-vscode
TakumiI.markdowntable
timonwong.shellcheck
tomoki1207.pdf
Tyriar.sort-lines
unifiedjs.vscode-mdx
VisualStudioExptTeam.intellicode-api-usage-examples
VisualStudioExptTeam.vscodeintellicode
WallabyJs.quokka-vscode
webhint.vscode-webhint
wix.glean
wix.vscode-import-cost
xabikos.JavaScriptSnippets
yzane.markdown-pdf
yzhang.markdown-all-in-one
Zignd.html-css-class-completion
```

## Installing VSCode Extension From a List

### Linux

```bash
#!/usr/bin/env bash
cat $1 | while read extension || [[ -n $extension ]];
do
  code --install-extension $extension --force
done
```

### window

```powershell
Get-Content $args[0] | ForEach-Object {code --install-extension $_}
```

## Setting

### Linux

```json
{
  "[css]": {
    "diffEditor.codeLens": false,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[markdown]": {
    "editor.defaultFormatter": "yzhang.markdown-all-in-one"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "cSpell.language": "en,ar",
  "code-runner.runInTerminal": true,
  "compile-hero.generate-minified-css": true,
  "compile-hero.generate-minified-html": true,
  "css.enabledLanguages": [
    "html"
  ],
  "css.format.spaceAroundSelectorSeparator": true,
  "css.lint.boxModel": "warning",
  "css.lint.duplicateProperties": "error",
  "css.lint.float": "warning",
  "css.lint.hexColorLength": "warning",
  "css.lint.idSelector": "warning",
  "css.lint.ieHack": "warning",
  "css.lint.importStatement": "warning",
  "css.lint.important": "warning",
  "css.lint.universalSelector": "warning",
  "css.lint.unknownVendorSpecificProperties": "warning",
  "css.lint.zeroUnits": "warning",
  "css.trace.server": "verbose",
  "debug.allowBreakpointsEverywhere": true,
  "diffEditor.codeLens": true,
  "doxdocgen.generic.authorEmail": "mohamedtaysser983@gmail.com",
  "doxdocgen.generic.authorName": "Mohammed Taysser",
  "doxdocgen.generic.useGitUserEmail": true,
  "doxdocgen.generic.useGitUserName": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  "editor.columnSelection": false,
  "editor.cursorBlinking": "expand",
  "editor.find.autoFindInSelection": "multiline",
  "editor.fontFamily": "'Cascadia Code', Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.formatOnPaste": false,
  "editor.formatOnSave": false,
  "editor.formatOnType": false,
  "editor.guides.bracketPairs": true,
  "editor.guides.bracketPairsHorizontal": "active",
  "editor.guides.highlightActiveIndentation": true,
  "editor.insertSpaces": false,
  "editor.language.brackets": [],
  "editor.linkedEditing": true,
  "editor.mouseWheelZoom": true,
  "editor.quickSuggestions": {
    "comments": "on",
    "other": "on",
    "strings": "on"
  },
  "editor.renderControlCharacters": false,
  "editor.renderWhitespace": "boundary",
  // "editor.fontFamily": "'Droid Sans Mono',\"monospace\", monospace, 'Droid Sans Fallback'",
  "editor.rulers": [
    80,
    120
  ],
  "editor.scrollbar.horizontalScrollbarSize": 10,
  "editor.scrollbar.verticalScrollbarSize": 10,
  "editor.smoothScrolling": true,
  "editor.snippetSuggestions": "top",
  "editor.suggest.preview": true,
  "editor.suggestSelection": "first",
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "emmet.preferences": {},
  "emmet.showSuggestionsAsSnippets": true,
  "emmet.triggerExpansionOnTab": true,
  "eslint.alwaysShowStatus": true,
  "eslint.format.enable": true,
  "eslint.lintTask.enable": true,
  "eslint.probe": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html",
    "vue",
    "markdown",
    "css",
    "js",
    "pug",
    "scss",
    "sass",
    "jsx"
  ],
  "explorer.compactFolders": false,
  "files.associations": {
    "**/*.html": "html",
    "**/requirements{/**,*}.{txt,in}": "pip-requirements",
    "*.{css}": "tailwindcss"
  },
  "files.autoSave": "afterDelay",
  "files.insertFinalNewline": true,
  "git.alwaysShowStagedChangesResourceGroup": true,
  "git.autofetch": true,
  "git.enableSmartCommit": true,
  "gremlins.showInProblemPane": true,
  "gulp.autoDetect": "on",
  "html-css-class-completion.enableEmmetSupport": true,
  "html-css-class-completion.includeGlobPattern": "**/*.{css,html,pug.scss,.sass}",
  "html.completion.attributeDefaultValue": "singlequotes",
  "html.format.indentInnerHtml": true,
  "html.format.templating": true,
  "html.trace.server": "messages",
  "javascript.inlayHints.parameterNames.enabled": "all",
  "js/ts.implicitProjectConfig.checkJs": true,
  "markdown-pdf.breaks": true,
  "markdown-pdf.convertOnSave": false,
  "markdown-pdf.executablePath": "/snap/bin/chromium",
  "markdown-pdf.highlightStyle": "github.css",
  "markdown-pdf.type": [
    "pdf",
    "html",
    "png",
    "jpeg"
  ],
  "markdown.validate.enabled": true,
  "markdownlint.config": {
    "MD024": {
      "siblings_only": true
    }
  },
  "material-icon-theme.saturation": 1,
  "material-icon-theme.showUpdateMessage": true,
  "notebook.cellToolbarLocation": {
    "default": "right",
    "jupyter-notebook": "left"
  },
  "prettier.jsxSingleQuote": true,
  "prettier.prettierPath": "/usr/local/lib/node_modules/prettier",
  "prettier.resolveGlobalModules": true,
  "prettier.useTabs": true,
  "python.analysis.completeFunctionParens": true,
  "python.autoComplete.addBrackets": true,
  "python.defaultInterpreterPath": "/usr/bin/python3.9",
  "python.formatting.provider": "autopep8",
  "python.languageServer": "Pylance",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.pythonPath": "/usr/bin/python3.9",
  "scss.lint.duplicateProperties": "warning",
  "scss.lint.float": "warning",
  "scss.lint.idSelector": "warning",
  "scss.lint.ieHack": "warning",
  "scss.lint.important": "warning",
  "scss.lint.universalSelector": "warning",
  "scss.lint.unknownVendorSpecificProperties": "warning",
  "scss.lint.zeroUnits": "warning",
  "scss.showErrors": true,
  "search.showLineNumbers": true,
  "sonarlint.ls.javaHome": "/usr/lib/jvm/java-11-openjdk-amd64",
  "sonarlint.output.showAnalyzerLogs": true,
  "sonarlint.output.showVerboseLogs": true,
  "tabnine.experimentalAutoImports": true,
  "telemetry.telemetryLevel": "error",
  "terminal.integrated.cursorBlinking": true,
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.fontFamily": "monospace",
  "terminal.integrated.fontWeightBold": "bold",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "vsintellicode.modify.editor.suggestSelection": "automaticallyOverrodeDefaultValue",
  "workbench.colorCustomizations": {
    "editorBracketHighlight.foreground1": "#E6E6E6",
    "editorBracketHighlight.foreground2": "#FF75B5",
    "editorBracketHighlight.foreground3": "#19f9d8",
    "editorBracketHighlight.foreground4": "#B084EB",
    "editorBracketHighlight.foreground5": "#45A9F9",
    "editorBracketHighlight.foreground6": "#FFB86C",
    "editorBracketHighlight.unexpectedBracket.foreground": "#FF2C6D",
    "editorBracketPairGuide.activeBackground1": "#FFB86C",
    "editorBracketPairGuide.activeBackground2": "#FF75B5",
    "editorBracketPairGuide.activeBackground3": "#45A9F9",
    "editorBracketPairGuide.activeBackground4": "#B084EB",
    "editorBracketPairGuide.activeBackground5": "#E6E6E6",
    "editorBracketPairGuide.activeBackground6": "#19f9d8",
    "editorRuler.foreground": "#4093ff"
  },
  "workbench.editor.autoLockGroups": {},
  "workbench.editor.highlightModifiedTabs": true,
  "workbench.editor.pinnedTabSizing": "shrink",
  "workbench.editorAssociations": {
    "*.ipynb": "jupyter-notebook"
  },
  "workbench.iconTheme": "material-icon-theme",
  "workbench.settings.useSplitJSON": true,
  "php.validate.executablePath": "/usr/bin/php",
  "workbench.colorTheme": "Atom One Dark",
  "window.confirmBeforeClose": "always",
  "prettier.singleQuote": true,
  "tailwindCSS.emmetCompletions": true,
  "html-css-class-completion.HTMLLanguages": [
    "html",
    "vue",
    "razor",
    "blade",
    "handlebars",
    "twig",
    "django-html",
    "php",
    "markdown",
    "erb",
    "ejs",
    "svelte",
    "pug"
  ],
  "remote.extensionKind": {
    "pub.name": [
      "ui"
    ]
  },
  "http.proxyAuthorization": null,
  "versionlens.suggestions.showOnStartup": true
}
```

## Extension Setting

### Live Sass Compile

```json
"liveSassCompile.settings.autoprefix": [
  "> 1%",
  "last 2 versions"
],
"liveSassCompile.settings.formats": [
  {
    "format": "compressed",
    "extensionName": ".min.css",
    "savePath": "~"
  },
  {
    "format": "expanded",
    "extensionName": ".css",
    "savePath": "~"
  }
]
```

### highlight-matching-tag

```json
"highlight-matching-tag.styles": {
  "opening": {
    "left": {
      "custom": {
        "borderWidth": "0 0 0 3px",
        "borderStyle": "solid",
        "borderColor": "yellow",
        "borderRadius": "0px"
      }
    },
    "right": {
      "custom": {
        "borderWidth": "0 3px 0 0",
        "borderStyle": "solid",
        "borderColor": "yellow",
        "borderRadius": "0px"
      }
    }
  }
},
"highlight-matching-tag.highlightSelfClosing": true,
"highlight-matching-tag.enabled": true,
"highlight-matching-tag.showPath": true,
"highlight-matching-tag.noDefaultEmptyElements": true,
"highlight-matching-tag.highlightFromContent": true,
```

## User Keyboard Shortcut

```json
[
    // Wrap Emmet
    {
        "key": "ctrl+shift+w",
        "command": "editor.emmet.action.wrapWithAbbreviation",
        "when": "editorHasSelection",
    },
    // Transform
    {
        "key": "ctrl+shift+u",
        "command": "editor.action.transformToUppercase",
        "when": "editorHasSelection"
    },
    {
        "key": "ctrl+shift+l",
        "command": "editor.action.transformToLowercase",
        "when": "editorHasSelection"
    },
    // Comments
    {
        "key": "ctrl+numpad_divide",
        "command": "editor.action.commentLine",
        "when": "editorTextFocus && !editorReadonly"
    },
    {
        "key": "ctrl+/",
        "command": "editor.action.commentLine",
        "when": "editorTextFocus && !editorReadonly"
    },
    // Terminal
    {
        "key": "ctrl+`", //ctrl+shift+` (new terminal)
        "command": "workbench.action.terminal.focus",
        "when": "editorTextFocus"
    },
    {
        "key": "ctrl+`",
        "command": "workbench.action.focusActiveEditorGroup",
        "when": "terminalFocus"
    },
    {
        "key": "alt+`",
        "command": "workbench.action.toggleMaximizedPanel",
    },
    {
        "key": "ctrl+alt+`",
        "command": "workbench.action.terminal.toggleTerminal"
    },
    {
        "key": "escape", //or ctrl+d
        "command": "workbench.action.terminal.kill",
        "when": "terminalFocus"
    },
    {
        "key": "ctrl+\\",
        "command": "workbench.action.terminal.split",
        "when": "terminalFocus"
    },
    {
        "key": "alt+pageup", //alt+left (on split)
        "command": "workbench.action.terminal.focusNext",
        "when": "terminalFocus"
    },
    {
        "key": "alt+pagedown", //alt+right (on split)
        "command": "workbench.action.terminal.focusPrevious",
        "when": "terminalFocus"
    },
]
```
