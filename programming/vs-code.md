
# vs-code notes

## Fonts

see `Cascadia Code` on  [devfonts](https://devfonts.gafi.dev/)

## themes

- <https://vscodethemes.com/>

## Keyboard shortcuts for :sunglasses: Linux

- box selection                 shift + arrow
- add cursor                    ctrl + alt + arrow
- select all occurrence         ctrl + shift + L
- copy line                     alt + shift + arrow
- rename function with usage    f2
- code folding                  ctrl + shift + ]
- spilt view                    ctrl + \

command | details
-----| -----
`Ctrl+Shift+P, F1` | Show Command Palette
`Ctrl+P`           | Quick Open, Go to File
`Ctrl+Shift+N`     | New window/instance
`Ctrl+W`           | Close window/instance
`Ctrl+,`           | User Settings
`Alt+ ↓ / ↑`       | Move line down/up
`Ctrl+ ↑ / ↓`      | Scroll line up/down
`Ctrl+Shift+K`     | Delete line
`Ctrl+Enter`       | Insert line above
`Ctrl+Shift+Enter` | Insert line below
`Ctrl+Shift+\`     | Jump to matching bracket
`Ctrl+]`           | Indent line
`Ctrl+[`           | Outdent line
`Ctrl+K M`         | Change file language
`Home`             | Go to beginning of line
`Ctrl+ Home`       | Go to beginning of file
`End`              | Go to end of line
`Ctrl+ End`        | Go to end of file
`Alt+ PgUp`        | Scroll page up
`Alt+ PgDn`        | Scroll page down
`Ctrl+Shift+ [`    | Fold region
`Ctrl+Shift+ ]`    | unfold region
`Ctrl+Shift+A`     | Toggle block comment
`Alt+Click`        | Insert cursor*
`Ctrl+U`           | Undo last cursor operation
`Shift+Alt+ ↑ / ↓` | Insert cursor above/below
`Ctrl+L`           | Select current line
`Ctrl+Shift+L`     | Select all occurrences of current selection
`Ctrl+F2`          | Select all occurrences of current word
`F11`              | Toggle full screen
`Ctrl+Shift+E`     | Show Explorer / Toggle focus
`Ctrl+Shift+F`     | Show Search
`Ctrl+Shift+G`     | Show Source Control
`Ctrl+Shift+D`     | Show Debug
`Ctrl+Shift+X`     | Show Extensions
`Ctrl+Shift+H`     | Replace in files
`Ctrl+Tab`         | Open next
`Ctrl+Shift+Tab`   | Open previous
`Ctrl+K P`         | Copy path of active file
`Ctrl+K R`         | Reveal active file in Explorer
`Ctrl+Shift+C`     | Open new command prompt/terminal
`Ctrl+Shift+V`     | Open Markdown preview
`Ctrl+Shift+B`     | Run Build Task
`Ctrl+H`           | Replace
`Shift+F5`         | Stop
`Ctrl+D`           | Add selection to next Find match
`Ctrl+T`           | Show all Symbols
`Ctrl+P`           | Go to File
`Ctrl+\`           | Split editor
`Shift+ Home`      | Scroll to top
`Shift+ End`       | Scroll to bottom

**note** The Alt+Click gesture may not work on some Linux distributions.
You can change the modifier key for the Insert cursor command to
`Ctrl+Click` with the `editor.multiCursorModifier` setting.

## Linux extension

![extension-1](../assets/images/vscode-extension/extension-1)
![extension-2](../assets/images/vscode-extension/extension-2)
![extension-3](../assets/images/vscode-extension/extension-3)

## linux setting

```json
{
  "code-runner.runInTerminal": true,
  "compile-hero.generate-minified-css": true,
  "compile-hero.generate-minified-html": true,
  "cSpell.language": "en,ar",
  "css.format.spaceAroundSelectorSeparator": true,
  "css.lint.boxModel": "warning",
  "css.lint.duplicateProperties": "error",
  "css.lint.float": "warning",
  "css.lint.hexColorLength": "warning",
  "css.lint.idSelector": "warning",
  "css.lint.ieHack": "warning",
  "css.lint.important": "warning",
  "css.lint.importStatement": "warning",
  "css.lint.universalSelector": "warning",
  "css.lint.unknownVendorSpecificProperties": "warning",
  "css.lint.zeroUnits": "warning",
  "css.trace.server": "verbose",
  "debug.allowBreakpointsEverywhere": true,
  "diffEditor.codeLens": true,
  "doxdocgen.generic.authorName": "Mohammed Taysser",
  "doxdocgen.generic.useGitUserEmail": true,
  "doxdocgen.generic.useGitUserName": true,
  "editor.bracketPairColorization.enabled": true,
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
  "editor.linkedEditing": true,
  "editor.mouseWheelZoom": true,
  "editor.quickSuggestions": true,
  "editor.renderControlCharacters": false,
  "editor.renderWhitespace": "boundary",
  "editor.smoothScrolling": true,
  "editor.snippetSuggestions": "top",
  "editor.suggest.preview": true,
  "editor.suggestSelection": "first",
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "emmet.showSuggestionsAsSnippets": true,
  "emmet.triggerExpansionOnTab": true,
  "eslint.alwaysShowStatus": true,
  "eslint.format.enable": true,
  "eslint.lintTask.enable": true,
  "explorer.compactFolders": false,
  "files.autoSave": "afterDelay",
  "files.insertFinalNewline": true,
  "git.alwaysShowStagedChangesResourceGroup": true,
  "git.autofetch": true,
  "git.enableSmartCommit": true,
  "gremlins.showInProblemPane": true,
  "gulp.autoDetect": "on",
  "html-css-class-completion.enableEmmetSupport": true,
  "html-css-class-completion.includeGlobPattern": "**/*.{css,html.scss,.sass}",
  "html.completion.attributeDefaultValue": "singlequotes",
  "html.format.endWithNewline": true,
  "html.format.templating": true,
  "html.trace.server": "messages",
  "javascript.inlayHints.parameterNames.enabled": "all",
  "js/ts.implicitProjectConfig.checkJs": true,
  "jupyter.interactiveWindowMode": "perFile",
  "markdown-pdf.breaks": true,
  "markdown-pdf.convertOnSave": false,
  "markdown-pdf.executablePath": "/snap/bin/chromium",
  "markdown-pdf.highlightStyle": "github.css",
  "material-icon-theme.saturation": 1,
  "material-icon-theme.showUpdateMessage": true,
  "php.validate.executablePath": "/usr/bin/php",
  "php.validate.run": "onType",
  "prettier.jsxSingleQuote": true,
  "prettier.singleQuote": true,
  "python.analysis.completeFunctionParens": true,
  "python.autoComplete.addBrackets": true,
  "python.defaultInterpreterPath": "/usr/bin/python3.9",
  "python.formatting.provider": "autopep8",
  "python.languageServer": "Pylance",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.pythonPath": "/usr/bin/python3.9",
  "scss.lint.compatibleVendorPrefixes": "warning",
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
  "sonarlint.output.showAnalyzerLogs": true,
  "sonarlint.output.showVerboseLogs": true,
  "telemetry.telemetryLevel": "error",
  "terminal.integrated.cursorBlinking": true,
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.fontFamily": "monospace",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "vsintellicode.modify.editor.suggestSelection": "automaticallyOverrodeDefaultValue",
  "workbench.colorTheme": "Atom One Dark",
  "workbench.editor.highlightModifiedTabs": true,
  "workbench.editor.pinnedTabSizing": "shrink",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.settings.useSplitJSON": true,
  // "editor.fontFamily": "'Droid Sans Mono',\"monospace\", monospace, 'Droid Sans Fallback'",
  "editor.rulers": [
    80,
    120
  ],
  "css.enabledLanguages": [
    "html"
  ],
  "[json]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "diffEditor.codeLens": false
  },
  "workbench.editorAssociations": {
    "*.ipynb": "jupyter-notebook"
  },
  "files.associations": {
    "**/*.html": "html",
    "**/requirements{/**,*}.{txt,in}": "pip-requirements"
  },
  "sonarlint.ls.javaHome": "/usr/lib/jvm/java-14-openjdk-amd64",
  "notebook.cellToolbarLocation": {
    "default": "right",
    "jupyter-notebook": "left"
  },
  "[markdown]": {
    "editor.defaultFormatter": "yzhang.markdown-all-in-one"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features"
  },
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
  "markdown-pdf.type": [
    "pdf",
    "html",
    "png",
    "jpeg"
  ],
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "workbench.colorCustomizations": {
    "editorRuler.foreground": "#4093ff",
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
  },
  "todo-tree.general.tags": [
    "NOTE",
    "TODO",
    "FIXME",
    "MARK",
    "[ ]",
    "[x]"
  ],
  "todo-tree.highlights.defaultHighlight": {
    "type": "tag",
    "fontWeight": "normal",
    "foreground": "#000000",
    "opacity": 90,
  },
  "todo-tree.highlights.customHighlight": {
    "NOTE": {
      "background": "#FFA500",
      "iconColour": "#FFA500",
      "icon": "file",
    },
    "TODO": {
      "background": "#FFD703",
      "iconColour": "#FFD703",
      "icon": "clippy",
    },
    "FIXME": {
      "background": "#FF01FF",
      "iconColour": "#FF01FF",
      "icon": "bug",
    },
    "MARK": {
      "background": "#157EFB",
      "iconColour": "#157EFB",
      "icon": "tag",
    },
    "[ ]": {
      "background": "#dc3545",
      "iconColour": "#dc3545",
      "icon": "square",
    },
    "[x]": {
      "background": "#28a745",
      "iconColour": "#28a745",
      "icon": "square-fill",
    }
  },
  "todo-tree.regex.regex": "(//|#|<!--|;|/\\*|^|^\\s*(-|\\d+.))\\s*($TAGS)",
  "markdownlint.config": {
    "MD024": {
      "siblings_only": true
    }
  },
  "editor.scrollbar.horizontalScrollbarSize": 10,
  "editor.scrollbar.verticalScrollbarSize": 10,
  "workbench.editor.autoLockGroups": {},
  "emmet.preferences": {},
  "eslint.nodePath": "",
}
```

## windows settings

# Useful notes

- <https://dev.to/robole/vs-code-you-dont-need-that-extension-part-2-34o3>

# Extension Playground

```text
TODO: todo task
FIXME: todo task
MARK: copy & past
NOTE: ex: don't remove
[ ]: pending task
[x]: done task
```

## Better comment

```json
"better-comments.tags": [
  {
    "tag": "!", // danger
    "color": "#dc3545",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "?", // primary
    "color": "#3498DB",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "&", // under line
    "color": "#6c757d",
    "strikethrough": true,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "^", // throw line
    "color": "#6c757d",
    "strikethrough": false,
    "underline": true,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "*", // sucsess
    "color": "#28a745",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "-", // info
    "color": "#17a2b8",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "%", // warning
    "color": "#ffc107",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  }
]
```

## Live Sass Compile

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

## highlight-matching-tag

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

# Keyboard Shortcut

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
