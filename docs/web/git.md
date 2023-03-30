
# Git & Github

A dead simple git cheatsheet

## Branches

| command                        | info                                    |
| ------------------------------ | --------------------------------------- |
| `git branch`                   | List all local branches.                |
| `git branch -a`                | List remote and local branches.         |
| `git checkout -b branch_name`  | Create a local branch and switch to it. |
| `git checkout branch_name`     | Switch to an existing branch.---        |
| `git push origin branch_name`  | Push branch to remote.                  |
| `git branch -m new_name`       | Rename current branch.                  |
| `git branch -d branch_name`    | Delete a local branch.                  |
| `git push origin :branch_name` | Delete a remote branch.                 |
| `git branch -D branch_name`    | Force delete a local branch             |

## Logs

| command                     | info                                              |
| --------------------------- | ------------------------------------------------- |
| `git log --oneline`         | Show commit history in single lines.              |
| `git log -2`                | Show commit history for last N commits.           |
| git log -S 'keyword'        | Show commits that introduced a specific keyword   |
| `git log -p -2`             | Show commit history for last N commits with diff. |
| `git diff`                  | Show all local file changes in the working tree.  |
| git log --author="username" | Show all commits of a specific user               |
| `git diff README`           | Show changes made to a file.                      |
| `git blame README`          | Show who changed what & when in a file.           |
| `git remote show origin`    | Show remote branches and their mapping to local.  |
| `git remote -v`             | To know any remoteRepo                            |

## Cleanup

| command               | info                                          |
| --------------------- | --------------------------------------------- |
| `git clean -f`        | Delete all untracked files.                   |
| `git clean -df`       | `Delete all untracked files and directories.` |
| `git checkout -- .`   | Undo local modifications to all files.        |
| git reset HEAD README | Unstage a file.                               |

## Tags

| command                                | info                                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| `git pull --tags`                      | Get remote tags.                                                                        |
| `git checkout tag_name`                | Switch to an existing tag.                                                              |
| `git tag`                              | List all tags.                                                                          |
| `git tag -n`                           | List all tags with their messages (tag message or commit message if tag has no message) |
| `git tag -a tag_name -m "tag message"` | Create a new tag.                                                                       |
| `git push --tags`                      | Push all tags to remote repo.                                                           |

## Stashes

| command                                    | info                                         |
| ------------------------------------------ | -------------------------------------------- |
| `git stash save "stash name" && git stash` | Save changes to a stash.                     |
| `git stash list`                           | List all stashes.                            |
| `git stash pop`                            | Apply a stash and delete it from stash list. |
| `git reset -- README ,CHECKOUT`            | For removing files from staging area         |
| `git restore --staged README`              | For removing files from staging area         |
| `git mv readme README`                     | Rename File Or Dir From Staged Area          |

## Startup

| command                        | info                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `git status`                   | To see your state after editing on files                                       |
| `git push origin main`         | To load files to remote Repo                                                   |
| `git commit -m 'message here'` | Commit with message                                                            |
| `git rm  README`               | erase a file from working directory                                            |
| `git pull`                     | Get Changes From Repo To Locale                                                |
| `git restore README`           | If you erased a file from working directory by mistake and want to retrieve it |

## Utils

| command                                     | info                             |
| ------------------------------------------- | -------------------------------- |
| `git --version`                             | show current git version         |
| `git init`                                  | initialize git repo              |
| `git clone "url_to_github_project"`         | For clone project from github    |
| `git config --global user.email 'mo@mo.mo'` | configure git for all folders    |
| `git config user.email 'mo@mo.mo'`          | configure git for current folder |
| `git config user.email`                     | get configure                    |
| `git help commit`                           | get git help                     |

## Search

| command            | info                                        |
| ------------------ | ------------------------------------------- |
| `git grep "Hello"` | A text search on all files in the directory |

## How To

### Add Contributors From Github

1. from settings
2. options
3. Manage access
4. invite a collaborator

### Erase A File From Both The Working Directory Remote Repo

```shell
git rm fileName

git commit -m "description"

git push "remote repo name" "branch name"
```

### Writing `.gitignore`

comment like `python` with `#`

```.gitignore
home.html           # ignore any html file with home name
src/*               # folder and it's content
!src/script.js      # folder and it's content except script.js
*.zip               # any file with zip extension
```
