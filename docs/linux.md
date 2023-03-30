
# Simply Ubuntu

## After Install

1. update system `control Center > System > Update Manager`
2. add drivers `control Center > Hardware > Additional Drivers`
3. remove startup applications `control Center > Personal > startup applications`
4. install both of `nodejs`, `npm`, `java-jdk`

## An Alternative for gnome extension

- <https://www.youtube.com/watch?v=4kYDtM_RnuI>

## App

- [LibreOffice](https://www.libreoffice.org/download/download/)

## Browser & Internet

- [firefox developer](https://www.mozilla.org/en-US/firefox/developer/)
- [tor](https://itsfoss.com/install-tar-browser-linux/)
  - [linuxize](https://linuxize.com/post/how-to-install-tor-browser-on-ubuntu-20-04/)
- [brave](https://itsfoss.com/brave-web-browser/)
- [chromium](https://itsfoss.com/install-chromium-ubuntu/)
  - [linuxize](https://linuxize.com/post/how-to-install-chromium-web-browser-on-ubuntu-20-04/)
- [telegram](https://desktop.telegram.org/)
- [zoom](https://itsfoss.com/zoom-ubuntu/)
- discord

## Paint App

- [gimp](https://www.gimp.org/downloads/)
- [pinta](https://itsfoss.com/pinta-1-6-ubuntu-linux-mint/)
- [Flameshot](https://flameshot.org/#download)     `sudo snap install flameshot`

### Converter

- [`ffmpeg`](https://itsfoss.com/ffmpeg/) CLI sound converter
- [`PDF Mix Tool`](https://www.scarpetta.eu/pdfmixtool/#download) pdf arrange pages
- [`Xnconvert`](https://www.xnview.com/en/xnconvert/) image converter

## System Add

- [gnome-tweaks](https://itsfoss.com/gnome-tweak-tool/)
- menu editor (alacarte `sudo apt-get install alacarte`)
- dconfig editor (`sudo apt install dconf-editor`)
- gpart (`sudo apt install gparted`)

## Programming

- [visual studio code](https://code.visualstudio.com/Download)
- kwite (`sudo apt-get install kwrite`)
- DB brower [sqlitebrowser](https://sqlitebrowser.org/dl/)
- zeal (`sudo apt-get install zeal`)
- postman (`sudo snap install postman`)
- [firewall](https://itsfoss.com/set-up-firewall-gufw/)
- [filezella](https://itsfoss.com/filezilla-ubuntu/)
- xampp
- postgresql
- packet tracer

### Additional

- node
- npm
- yarn (`npm install -g yarn`)

## Virtualization

- [virtual box](https://www.virtualbox.org/wiki/Downloads)
- [team viewer](https://www.teamviewer.com/en/download/linux/)

## Pdf

- [xournal++](https://github.com/xournalpp/xournalpp/releases)
  - ```sudo apt install texlive```
  - <https://linuxconfig.org/how-to-install-latex-on-ubuntu-20-04-focal-fossa-linux>

## Video And Audio

- [vlc](https://www.videolan.org/vlc/)
- [losslesscut](https://github.com/mifi/lossless-cut/releases)
- [Handbrake](https://handbrake.fr/downloads.php)
- [openshot](https://www.openshot.org/download/)
- shortcut

## Screenshot And Screen Recording Tools

- [obs](https://obsproject.com/download)

## Downloading Tools

- [free download manager](https://www.freedownloadmanager.org/download.htm)
- transmission : like turrent

## Github

- <https://github.com/trimstray/the-practical-linux-hardening-guide>
- <https://github.com/dylanaraps/pure-bash-bible>
- <https://github.com/denysdovhan/bash-handbook>
- <https://github.com/ImStillDeadinside/LinuxCheatSheet>
- <https://github.com/jlevy/the-art-of-command-line>
- <https://github.com/inputsh/awesome-linux>
- <https://github.com/awesome-lists/awesome-bash>
- <https://github.com/alebcay/awesome-shell>
- <https://github.com/unixorn/awesome-zsh-plugins>

## Programming Startup

### Install `npm` packages

```shell
npm i -g eslint prettier pug sass typescript
```

# How To

## open xampp

```shell
sudo apachectl stop

sudo /opt/lampp/manager-linux-x64.run
```

## update npm

```shell
sudo npm install -g npm
```

## install guest tools (virtual box)

```shell
sudo apt update && sudo apt install -y linux-header-$(uname -r)

sudo apt-get install -y virtualbox-guest-xll


httrack install
sudo apt-get install httrack
```

## open pycharm

```shell
# in bin folder
sh pycharm.sh
```

# paths

## firefox cookie

```shell
/home/linuxroot/.mozilla/firefox/i4j66yab.dev-edition-default
```

# terminal themes

- <https://github.com/ohmyzsh/ohmyzsh>

```json
plugins=(
  git
  colorize
  dash
  emoji
  npm
  vscode
  dotenv
  gulp
  iterm2
)
```

# add ssh to github

```shell
# 1. generate ssh key
ssh-keygen -t rsa -b 4096 -C 'mohamedtaysser112@yahoo.com'


# 2. take copy and add it to github (under https://github.com/settings/keys)
cat /home/mohammed/.ssh/id_rsa.pub

# 3. test the key
ssh -T git@github.com

# 4. add the key
ssh-add /home/mohammed/.ssh/id_rsa
```

if there error like

```shell
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/home/mohammed/.ssh/id_rsa.pub' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
```

use the following or try to add password

```shell
chmod 400 ~/.ssh/id_rsa
```

# gnome extensions

- <https://itsfoss.com/best-gnome-extensions/>
- <https://linuxhint.com/25_best_gnome_extensions/>

# utilities

- <https://itsfoss.com/free-up-space-ubuntu-linux/>
- <https://dev.to/harrsh2124/how-to-setup-firefox-developer-edition-on-ubuntu-4inp>
- <https://askubuntu.com/questions/426750/how-can-i-update-my-nodejs-to-the-latest-version>

# Learn

- <https://linuxhandbook.com/linux-directory-structure/>
