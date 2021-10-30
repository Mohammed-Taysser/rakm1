
# What Is Git

## search for

- [https://github.com/Mohammed-Taysser/just-learn-github/settings/pages](https://github.com/Mohammed-Taysser/just-learn-github/settings/pages)
- [https://pages.github.com/](https://pages.github.com/)

> git is version control system

add new git

```shell
 1999  echo "# ultimate-frontend-course" >> README.md
 2000  git init
 2001  git add README.md 
 2002  git commit -m 'init commint'
 2003  git status 
 2004  git branch -M main
 2005  git branch 
 2006  git remote add origin https://github.com/Mohammed-Taysser/ultimate-frontend-course.git
 2007  git push -u origin main
 ```

## Basic Git commands

- `git init` initializes a brand new Git repository and begins tracking an existing directory.
    It adds a hidden subfolder within the existing directory that houses the internal data structure required for version control.

- `git clone` creates a local copy of a project that already exists remotely.
     The clone includes all the project’s files, history, and branches.

- `git add` stages a change. Git tracks changes to a developer’s codebase, but it’s necessary to stage and take a snapshot of the changes to include them in the project’s history.

- `git commit` saves the snapshot to the project history and completes the change-tracking process.

- `git status` shows the status of changes as untracked, modified, or staged.

- `git branch` shows the branches being worked on locally.

- `git merge` merges lines of development together. This command is typically used to combine changes made on two distinct branches.
     For example, a developer would merge when they want to combine changes from a feature branch into the main branch for deployment.

- `git pull` updates the local line of development with updates from its remote counterpart.
    Developers use this command if a teammate has made commits to a branch on a remote, and they would like to reflect those changes in their local environment.

- `git push` updates the remote repository with any commits made locally to a branch.

## GitHub and the command line

### Example: Contribute to an existing repository

```shell
# download a repository on GitHub.com to our machine

git clone https://github.com/me/repo.git


# change into the `repo` directory
cd repo


# create a new branch to store any new changes
git branch my-branch



# switch to that branch (line of development)
git checkout my-branch



# make changes, for example, edit `file1.md` and `file2.md` using the text editor



# stage the changed files
git add file1.md file2.md



# take a snapshot of the staging area (anything that's been added)
git commit -m "my snapshot"



# push changes to github
git push --set-upstream origin my-branch
```

### Example: Start a new repository and publish it to GitHub

```shell
# create a new directory, and initialize it with git-specific functions
git init my-repo

# change into the `my-repo` directory
cd my-repo

# create the first file in the project
touch README.md

# git isn't aware of the file, stage it
git add README.md

# take a snapshot of the staging area
git commit -m "add README to initial commit"

# provide the path for the repository you created on github
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git

# push changes to github
git push --set-upstream origin main
```

### Example: contribute to an existing branch on GitHub

```shell
# assumption: a project called `repo` already exists on the machine, and a new branch has been pushed to GitHub.com since the last time changes were made locally

# change into the `repo` directory
cd repo

# update all remote tracking branches, and the currently checked out branch
git pull

# change into the existing branch called `feature-a`
git checkout feature-a

# make changes, for example, edit `file1.md` using the text editor

# stage the changed file
git add file1.md

# take a snapshot of the staging area
git commit -m "edit file1"

# push changes to github
git push
```

- `git add .`
- `git add file_name`
- `git status`
- `git clone git_url`
- `git checkout --orphan gh-pages`  create gh-page branch and choose it

## course 1

- `git --version`
- `git init`
- `git status`
- `git add file_name.extension`
- `git add .`
- `git restore --staged name.txt`
- `git commit -m 'initial commit'`
  - `git config --global user.email 'mohamedtaysser112@yahoo.com'`
  - `git config --global user.name 'mohammed-taysser'`
- `git log` list all commits with it's id
- `git checkout commit_id`  return to it's state (it's like we are in commit_id and any commit after that will delete (like back in time))

## search

- `git commit -help`    for flag and option

# All git commands of github ordered 🔥

## 👍 conclusion for git commands 👍

### show current git version

```shell
git --version
```

### show configuration of git

```shell
git config --list
```

### initialize git repo

```shell
git init
```

### For clone project from github 🔽

``` Shell
git clone "url_to_github_project"
```

### To see your state after editing on files ⬇️

``` Shell
git status 
```

### To see your changes on files ⬇️

``` Shell
git diff             # the different between repo and working area
```

### Stages of moving files from your device to remote repo ⬇️

``` shell
git add *  or git add .
git add 'file_name' 'file_name'

git commit -am "description"
git push
```

### configure git for all folders

```shell
git config --global user.email 'mo@mo.mo'
git config --global user.name 'mohammed-taysser'
```

### configure git for current folder

```shell
git config user.email 'mo@mo.mo'
git config user.name 'mohammed-taysser'
```

### get configure

```shell
git config user.email
```

### get git help

```shell
git --help

git help commit
```

### For removing files from staging area ⬇️

```shell
git reset -- 'name of file' ,'name of another file '
git restore --staged file_name.txt
```

### For loading files to local repo ⬇️

``` shell
git commit -am "description"
          or 
git commit -m "description"
```

### To know any branch ⬇️

```shell
git branch
    or
git branch --list
```

### create new branch ⬇️

```shell
git branch new_name
```

### remove branch ⬇️

```shell
git branch -d branch_name
git push origin :branch_name
```

### switch to branch ⬇️

```shell
git checkout branch_name
```

### rename exist branch ⬇️

```shell
git branch old_branch_name new_branch_name
```

### create branch and switch to it ⬇️

```shell
git checkout -b branch_name
```

### create branch , switch and push to it ⬇️

```shell
git checkout -b branch_name

git push --set-upstream origin more
```

### show all commits by date

```shell
git log
    or on short
git log --oneline
```

### To know any remoteRepo ⬇️

```shell
git remote -v
```

### To load files to remote Repo ⬇️

```shell
git push 'remote name' 'branch name' 
git push origin main
```  

### how To add Contributors from github  ⬇️

```shell
     from settings
         options 
             Manage access
                invite a collaborator
```  

### how To pull updating files from Remote Repo ⬇️

 ```shell

 1] git fetch origin main
 2] git stash save "description"
 3] git merge

 ```

### how To pull updating files from Remote Repo with new branch ⬇️

 ```shell
 1] git fetch origin main
 2] git merge
 ```

by `branch_name`

```shell
 1] git fetch origin main branch_name:branch_name
 2] git merge
 ```

### how To pull updating files from Remote Repo in one line command ⬇️

``` shell
git pull origin main
```

### Stages of moving files from remote Repo to your device ⬇️

``` shell
remote repo 
     git fetch
        local repo
            git stash save "description"
                staging area
                     git merge
                        working directory
```

### If you want to erase a file from working directory  ⬇️

```shell
git  rm  file_name.extension
```

### merge branch with main

you should be in `main` branch

```shell
git merge branch_name

git push
```

if error are appear then deal with changes in editor then

```shell
git add .
git commit -m 'message'
git push
```

### get changes from repo to locale

```shell
git pull
```

### To erase a file from both the working directory remote Repo ⬇️

```shell
 1] git rm "file name"
 2] git commit "description"
 3] git push "remote repo name" "branch name"
```

### If you erased a file from working directory and you want erase it from remote Repo ⬇️

```shell
 1] git add/rm "file name"
 2] git commit "description"
 3] git push "remote repo name" "branch name"
```

### If you erased a file from working directory by mistake and want to retrieve it ⬇️

```shell
git restore file_name.extension
    or
git checkout file_ame
```

### To go back from stage area to working directory ⬇️

```shell
git restore --staged file_name.extension
```

### back to previous specified commit ⬇️

```shell
git revert commit_id

git status
git push
```

if we know number of previous commit

```shell
git revert HEAD~commit_number

# remember to fix the conflict

git status
git push
```

# writing `.gitignore`

comment like `python` with `#`

```gitgnore
home.html           # ignore any html file with home name
src/*               # folder and it's content
!src/script.js      # folder and it's content except script.js
*.zip               # any file with zip extension
```

## remove cache about file or dir

```sell
git rm --cached script.js
```

## remove file or dir from staged area and from working area

```sell
git rm -f script.js
```

## remove file or dir from staged area

```sell
git rm --cached script.js
```

## rename file or dir from staged area

```sell
# not recommend
git rm old_file.js
git add new_file.js

# the right way
git mv old_name.html new_name.html
```

## Amazing Github Repository

## Jobs

- <https://github.com/t9tio/open-source-jobs>
- <https://github.com/lukasz-madon/awesome-remote-job>

### Learn

- <https://github.com/ossu/computer-science>
- <https://github.com/kamranahmedse/developer-roadmap>
- <https://github.com/bnb/awesome-developer-streams>
- <https://github.com/orsanawwad/awesome-roadmaps>
- <https://github.com/microsoft/Data-Science-For-Beginners>
- <https://github.com/skywind3000/awesome-cheatsheets>
- <https://github.com/orgs/learn-anything/repositories>
- <https://github.com/prakhar1989/awesome-courses>
- <https://github.com/getify/You-Dont-Know-JS>
- <https://github.com/azl397985856/leetcode/blob/master/README.en.md>
- <https://github.com/microsoft/Web-Dev-For-Beginners>
- <https://github.com/microsoft/ML-For-Beginners>
- <https://github.com/microsoft/IoT-For-Beginners>
- <https://github.com/learn-anything/books>
- <https://github.com/dipakkr/A-to-Z-Resources-for-Students>
- <https://github.com/lauragift21/awesome-learning-resources>
- <https://github.com/trimstray/the-book-of-secret-knowledge>
- <https://github.com/Developer-Y/cs-video-courses>
- <https://github.com/karlhorky/learn-to-program>
- <https://github.com/amitness/learning>
- <https://github.com/EbookFoundation/free-programming-books>
- <https://github.com/danistefanovic/build-your-own-x>
- <https://github.com/zero-equals-false/awesome-programming-books>
- <https://github.com/lauragift21/awesome-learning-resources>
- <https://github.com/sindresorhus/awesome>
- <https://github.com/MunGell/awesome-for-beginners>
- <https://github.com/karan/Projects>
- <https://github.com/practical-tutorials/project-based-learning>
- <https://github.com/freeCodeCamp/freeCodeCamp>
- <https://github.com/andrew--r/channels>
- <https://github.com/JoseDeFreitas/awesome-youtubers>

## Editor

- [x] <https://github.com/mehcode/awesome-atom>
- [x] <https://github.com/viatsko/awesome-vscode>

## PWA

- <https://github.com/hemanth/awesome-pwa>
- <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps>

## python

- <https://github.com/zhiwehu/Python-programming-exercises>
- <https://github.com/hastagAB/Awesome-Python-Scripts>
- <https://github.com/ml-tooling/best-of-web-python>
- <https://github.com/avinashkranjan/Amazing-Python-Scripts>
- <https://free4arab.net/courses/python-security/lessons/hashlib/>

## JS learn

- <https://github.com/you-dont-need/You-Dont-Need-JavaScript>
- <https://github.com/denysdovhan/wtfjs>
- <https://github.com/mbeaudru/modern-js-cheatsheet>
- <https://github.com/30-seconds/30-seconds-of-code>
- <https://github.com/micromata/awesome-javascript-learning>
- <https://github.com/braziljs/js-the-right-way>
- <https://github.com/metagrover/ES6-for-humans>
- <https://github.com/kingzez/write-readable-javascript-code>
- <https://github.com/verekia/js-stack-from-scratch>
- <https://github.com/olawanlejoel/Awesome-Javascript>
- <https://github.com/knaxus/problem-solving-javascript>
- <https://danlevy.net/you-may-not-need-axios/>

### JS packages

- <https://github.com/Marak/faker.js>               fake data
- <https://github.com/zenorocha/clipboard.js>       copy to clipboard
- <https://github.com/naptha/tesseract.js>          image to text
- <https://github.com/usablica/intro.js>            guide for user
- <https://github.com/sampotts/plyr>                video player
- <https://github.com/goldfire/howler.js>           audio player
- <https://benweet.github.io/stackedit.js/>         markdown editor
- <https://github.com/codex-team/editor.js>         block styled editor
- <https://github.com/fvilers/tiny-editor>          text editor, vanilla JS
- <https://jamesooi.design/Croppr.js/>              vanilla JS image cropper
- <https://github.com/carbon-design-system/carbon-charts>
- <https://introjs.com/docs>                        step-by-step hint
- <https://www.chartjs.org/docs/latest/>
- <https://github.com/AllThingsSmitty/must-watch-javascript>

### CSS package

- <https://github.com/lokesh-coder/pretty-checkbox>
- <https://github.com/troxler/awesome-css-frameworks>
- <https://github.com/miniMAC/magic>                CSS3 Animations
- <https://github.com/AllThingsSmitty/css-protips>
- <https://github.com/l-hammer/You-need-to-know-css>
- <https://github.com/AllThingsSmitty/must-watch-css>
- <https://chartscss.org/>
- <https://github.com/FancyGrid/awesome-grid>

## React JS

- <https://github.com/testing-library/react-testing-library>
- <https://github.com/kentcdodds/testing-react-apps>
- <https://github.com/brillout/awesome-react-components>

## Jest JS

- [x] <https://github.com/sapegin/jest-cheat-sheet>

### Gulp

- [X] <https://github.com/kogakure/gulp-tutorial>
- [x] <https://github.com/alferov/awesome-gulp>
- [x] <https://github.com/Platform-CUF/use-gulp>

### Frontend Development

- [x] <https://github.com/thedaviddias/Resources-Front-End-Beginner>
- [x] <https://github.com/dypsilon/frontend-dev-bookmarks>
- [x] <https://github.com/qazbnm456/awesome-web-security>
- [x] <https://github.com/FallibleInc/security-guide-for-developers>
- [x] <https://github.com/thedaviddias/Front-End-Design-Checklist>
- ~~<https://github.com/andrew--r/frontend-case-studies>~~
- [x] <https://github.com/moklick/frontend-stuff>
- ~~<https://github.com/kdeldycke/awesome-falsehood>~~
- [x] <https://github.com/LeCoupa/awesome-cheatsheets>
- ~~<https://github.com/sindresorhus/awesome-npm>~~
- ~~<https://github.com/awesome-css-group/awesome-css>~~
- ~~<https://github.com/goabstract/Awesome-Design-Tools>~~
- ~~<https://github.com/micromata/awesome-css-learning>~~
- ~~<https://github.com/aniftyco/awesome-tailwindcss>~~
- ~~<https://github.com/nas5w/100-days-of-code-frontend>~~
- <https://github.com/sindresorhus/promise-fun>
- <https://andreasbm.github.io/web-skills/>
- <https://github.com/aloisdg/awesome-regex>
- ~~<https://github.com/neiesc/awesome-minimalist>~~
- ~~<https://github.com/dustinspecker/awesome-eslint>~~
- ~~<https://github.com/ripienaar/free-for-dev>~~

### Hacking

- <https://github.com/Hack-with-Github/Awesome-Hacking>
- <https://github.com/swisskyrepo/PayloadsAllTheThings>
- <https://github.com/carpedm20/awesome-hacking>
- <https://github.com/OWASP/CheatSheetSeries>
- <https://github.com/enaqx/awesome-pentest>
- <https://github.com/ktecv2000/How-to-play-CTF>
- <https://github.com/blaCCkHatHacEEkr/PENTESTING-BIBLE>
- <https://github.com/Escapingbug/awesome-browser-exploit>
- <https://github.com/OWASP/wstg>

### linux

- <https://github.com/trimstray/the-practical-linux-hardening-guide>
- <https://github.com/dylanaraps/pure-bash-bible>
- <https://github.com/denysdovhan/bash-handbook>
- <https://github.com/ImStillDeadinside/LinuxCheatSheet>
- <https://github.com/jlevy/the-art-of-command-line>
- <https://github.com/inputsh/awesome-linux>

### interview

- <https://github.com/Olshansk/interview>
- <https://github.com/sudheerj/reactjs-interview-questions>
- <https://github.com/h5bp/Front-end-Developer-Interview-Questions>
- <https://github.com/DopplerHQ/awesome-interview-questions>
- <https://github.com/yangshun/front-end-interview-handbook>
- <https://github.com/InterviewMap/CS-Interview-Knowledge-Map>
- <https://github.com/NotFound9/interviewGuide>
- <https://github.com/khan4019/front-end-Interview-Questions>
- <https://github.com/forthespada/InterviewGuide>
- <https://github.com/paddingme/Front-end-Web-Development-Interview-Question>
- <https://github.com/JaeYeopHan/Interview_Question_for_Beginner>
- <https://github.com/sudheerj/javascript-interview-questions>
- <https://github.com/joho/awesome-code-review>
- <https://github.com/chassing/linux-sysadmin-interview-questions>
- <https://github.com/arialdomartini/Back-End-Developer-Interview-Questions>
- <https://github.com/jwasham/coding-interview-university>
- <https://github.com/DopplerHQ/awesome-interview-questions>

## Make Badge For README

- <https://github.com/chetanraj/awesome-github-badges>
- <https://dev.to/envoy_/150-badges-for-github-pnk>
- <https://badgen.net/>
- <https://github.com/Ileriayo/markdown-badges>
- <https://github.com/aleen42/badges>
- <https://shields.io/>
- <https://github.com/puf17640/git-badges>
- <https://github.com/matiassingers/awesome-readme>
- <https://www.makeuseof.com/badges-that-will-supercharge-your-github-repository/>
- <https://github.com/anuraghazra/github-readme-stats>
- <https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge>

### skills

- <https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white>
- <https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white>
- <https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white>
- <https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white>
- <https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white>
- <https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white>
- <https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white>
- <https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white>
- <https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB>
- <https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white>
- <https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white>
- <https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white>
- <https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white>
- <https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white>
- <https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white>
- <https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white>

### Maintained

- <https://img.shields.io/badge/Maintained%3F-yes-green.svg>

### Website Stats

- <https://img.shields.io/website-up-down-green-red/http/monip.org.svg>
website:<http://monip.org>
- <https://img.shields.io/website-up-down-green-red/http/cv.lbesson.qc.to.svg>
Website: <http://cv.lbesson.qc.to/>

### GitHub Stats

- <https://img.shields.io/github/license/{username}/{repo-name}.svg>

- <https://img.shields.io/github/realese/{username}/{repo-name}.svg>

- <https://img.shields.io/github/commits-since/{username}/{repo-name}/{version}.svg>

- <https://img.shields.io/github/downloads/{username}/{repo-name}/total.svg>

- <https://img.shields.io/github/forks/{username}/{repo-name}.svg>

- <https://img.shields.io/github/stars/{username}/{repo-name}.svg>

- <https://img.shields.io/github/watchers/{username}/{repo-name}.svg>

- <https://img.shields.io/github/followers/{username}.svg?style=social&label=Follow&maxAge=2592000>

- <https://img.shields.io/github/issues/{username}/{repo-name}.svg>

- <https://img.shields.io/github/issues-closed/{username}/{repo-name}.svg>

- <https://img.shields.io/github/issues-pr/{username}/{repo-name}.svg>

- <https://img.shields.io/github/issues-pr-closed/{username}/{repo-name}.svg>

- <https://badge-size.herokuapp.com/{username}/{repo}/{branch}/{filename}>

- <https://github-readme-stats.vercel.app/api?username={username}&theme=blue-green>

- <https://github-readme-stats.vercel.app/api?username={username}&theme=blue-green>

- <https://github-readme-stats.vercel.app/api/top-langs/?username={username}&theme=blue-green>

- <https://starchart.cc/{username}/{repo}.svg>

## About GitHub

- <https://profile-summary-for-github.com/search>
- <https://aykutsarac.github.io/github-rater/>
- <https://github.com/tiimgreen/github-cheat-sheet>
- <https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages>

## API

- <https://github.com/public-apis/public-apis>
- <https://developers.google.com/youtube/v3/getting-started>
- <https://github.com/Kikobeats/awesome-api>
- <https://github.com/TonnyL/Awesome_APIs>
- <https://console.cloud.google.com/apis/dashboard?pli=1&project=first-one-309709>
- <https://lingva.ml/en/ar>
- <https://libretranslate.com/>
- <https://github.com/TheDavidDelta/lingva-translate>
- <https://docs.github.com/en/developers/overview/about-githubs-apis>

## Privacy

- <https://github.com/pluja/awesome-privacy>
- <https://github.com/vaib25vicky/awesome-mobile-security>

## Data Structure & algorithms

- <https://github.com/tayllan/awesome-algorithms>
- <https://github.com/trekhleb/javascript-algorithms>
- <https://github.com/TheAlgorithms/Python>
- <https://github.com/labuladong/fucking-algorithm/tree/english>
- <https://github.com/felipernb/algorithms.js>
- <https://github.com/DovAmir/awesome-design-patterns>
- <https://www.toptal.com/developers/sorting-algorithms>

## window

- <https://github.com/Awesome-Windows/Awesome>

## Ajax

- <https://github.com/metafizzy/infinite-scroll>
- <https://github.com/wendux/Ajax-hook>
