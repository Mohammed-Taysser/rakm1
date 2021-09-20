
# What Is Git

> git is version control system

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
