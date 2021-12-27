
# vs-code notes

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

## linux setting

```json
{
    "files.autoSave": "afterDelay",
    "editor.wordWrap": "on",
    "editor.snippetSuggestions": "top",
    "editor.codeActionsOnSave": {
        "source.fixAll": true
    },
    "editor.mouseWheelZoom": true,
    "editor.quickSuggestions": true,
    "editor.smoothScrolling": true,
    "[javascript]": {
        "editor.defaultFormatter": "vscode.typescript-language-features"
    },
    "[html]": {
        "editor.defaultFormatter": "vscode.html-language-features"
    },
    "css.lint.idSelector": "warning",
    "css.lint.ieHack": "warning",
    "emmet.showSuggestionsAsSnippets": true,
    "emmet.triggerExpansionOnTab": true,
    "python.languageServer": "Pylance",
    "python.pythonPath": "/usr/bin/python3.9",
    "python.formatting.provider": "autopep8",
    "editor.columnSelection": false,
    "editor.find.autoFindInSelection": "multiline",
    "php.validate.run": "onType",
    "editor.renderControlCharacters": false,
    "sonarlint.rules": {
        "Web:TableWithoutCaptionCheck": {
            "level": "off"
        },
        "python:S5754": {
            "level": "off"
        },
        "python:S2208": {
            "level": "off"
        }
    },
    "editor.suggestSelection": "first",
    "vsintellicode.modify.editor.suggestSelection": "automaticallyOverrodeDefaultValue",
    "cSpell.userWords": [
        "Lotfy",
        "Taysser",
        "arange",
        "cursorcolor",
        "flexbox",
        "gmail",
        "isalpha",
        "isnumeric",
        "kwargs",
        "kwlist",
        "maxlength",
        "mixins",
        "numpy",
        "pafy",
        "psycopg",
        "pyplot",
        "queryset",
        "struct",
        "tabindex",
        "typeof",
        "unstyled",
        "urlpatterns",
        "xhttp",
        "xlabel",
        "ylabel",
        "youtube"
    ],
    "python.autoComplete.addBrackets": true,
    "code-runner.runInTerminal": true,
    "code-runner.executorMap": {
        "javascript": "node",
        "java": "cd $dir && javac $fileName && java $fileNameWithoutExt",
        "c": "cd $dir && gcc $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt",
        "cpp": "cd $dir && g++ $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt",
        "objective-c": "cd $dir && gcc -framework Cocoa $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt",
        "php": "php",
        "python": "python -u",
        "perl": "perl",
        "perl6": "perl6",
        "ruby": "ruby",
        "go": "go run",
        "lua": "lua",
        "groovy": "groovy",
        "powershell": "powershell -ExecutionPolicy ByPass -File",
        "bat": "cmd /c",
        "shellscript": "bash",
        "fsharp": "fsi",
        "csharp": "cd $dir && dotnet run $fileName",
        "vbscript": "cscript //Nologo",
        "typescript": "ts-node",
        "coffeescript": "coffee",
        "scala": "scala",
        "swift": "swift",
        "julia": "julia",
        "crystal": "crystal",
        "ocaml": "ocaml",
        "r": "Rscript",
        "applescript": "osascript",
        "clojure": "lein exec",
        "haxe": "haxe --cwd $dirWithoutTrailingSlash --run $fileNameWithoutExt",
        "rust": "cd $dir && rustc $fileName && $dir$fileNameWithoutExt",
        "racket": "racket",
        "scheme": "csi -script",
        "ahk": "autohotkey",
        "autoit": "autoit3",
        "dart": "dart",
        "pascal": "cd $dir && fpc $fileName && $dir$fileNameWithoutExt",
        "d": "cd $dir && dmd $fileName && $dir$fileNameWithoutExt",
        "haskell": "runhaskell",
        "nim": "nim compile --verbosity:0 --hints:off --run",
        "lisp": "sbcl --script",
        "kit": "kitc --run",
        "v": "v run",
        "sass": "sass --style expanded",
        "scss": "scss --style expanded",
        "less": "cd $dir && lessc $fileName $fileNameWithoutExt.css",
        "FortranFreeForm": "cd $dir && gfortran $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt",
        "fortran-modern": "cd $dir && gfortran $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt",
        "fortran_fixed-form": "cd $dir && gfortran $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt",
        "fortran": "cd $dir && gfortran $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt"
    },
    "editor.formatOnPaste": false,
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "editor.formatOnSave": false,
    "terminal.integrated.cursorStyle": "line",
    "terminal.integrated.cursorBlinking": true,
    "css.enabledLanguages": [
        "html"
    ],
    "[json]": {
        "editor.defaultFormatter": "vscode.json-language-features"
    },
    "[jsonc]": {
        "editor.defaultFormatter": "vscode.json-language-features"
    },
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
        },
    ],
    "js/ts.implicitProjectConfig.checkJs": true,
    "[css]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "cSpell.enableFiletypes": [
        "jupyter",
        "sass"
    ],
    "editor.cursorBlinking": "expand",
    "editor.fontFamily": "'Droid Sans Mono',\"monospace\", monospace, 'Droid Sans Fallback'",
    "editor.fontLigatures": true,
    "html.format.endWithNewline": true,
    "jupyter.interactiveWindowMode": "perFile",
    "editor.formatOnType": false,
    "python.analysis.completeFunctionParens": true,
    "php.validate.executablePath": "/usr/bin/php",
    "editor.linkedEditing": true,
    "debug.allowBreakpointsEverywhere": true,
    "workbench.editorAssociations": {
        "*.ipynb": "jupyter-notebook"
    },
    "git.enableSmartCommit": true,
    "workbench.editor.pinnedTabSizing": "shrink",
    "python.defaultInterpreterPath": "/usr/bin/python3.9",
    "terminal.integrated.fontFamily": "monospace",
    "editor.tokenColorCustomizations": null,
    "emmet.includeLanguages": {
        "django-html": "html",
        "aspnetcorerazor": "html"
    },
    "files.associations": {
        "**/*.html": "html",
        // "**/templates/**/*.html": "django-html",
        "**/templates/**/*": "django-txt",
        "**/requirements{/**,*}.{txt,in}": "pip-requirements"
    },
    "material-icon-theme.saturation": 1,
    "material-icon-theme.folders.theme": "specific",
    "material-icon-theme.activeIconPack": "angular",
    "sonarlint.ls.javaHome": "/usr/lib/jvm/java-14-openjdk-amd64",
    "git.autofetch": true,
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
    ],
    "liveSassCompile.settings.autoprefix": [
        "> 1%",
        "last 2 versions"
    ],
    "material-icon-theme.showUpdateMessage": true,
    "telemetry.telemetryLevel": "error",
    "markdown-pdf.executablePath": "/snap/bin/chromium",
    "markdown-pdf.highlightStyle": "github.css",
    "eslint.alwaysShowStatus": true,
    "compile-hero.generate-minified-css": true,
    "compile-hero.generate-minified-html": true,
    "html.completion.attributeDefaultValue": "singlequotes",
    "workbench.colorTheme": "Atom One Dark",
    "workbench.iconTheme": "material-icon-theme",
    "explorer.compactFolders": false,
    "editor.rulers": [120],
    "workbench.colorCustomizations": {
      "editorRuler.foreground": "#4093ff"
    },
}
```

## windows settings
