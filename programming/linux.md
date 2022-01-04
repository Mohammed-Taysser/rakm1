
# simply ubuntu

## after install

1. update system `control Center > System > Update Manager`
2. add drivers `control Center > Hardware > Additional Drivers`
3. remove startup applications `control Center > Personal > startup applications`
4. [ubuntu tweak](http://ubuntu-tweak.com/)

## app

- thunderbird  : email app
- LibreOffice
- Brasero      : burn CD

## browser & internet

- firefox developer
- brave
- chromium
- telegram

## paint app

- gimp
- pinta
- Flameshot     `sudo snap install flameshot`

### converter

- [`ffmpeg`](https://itsfoss.com/ffmpeg/) CLI sound converter
- [`PDF Mix Tool`](https://www.scarpetta.eu/pdfmixtool/#download) pdf arrange pages
- [`Xnconvert`](https://www.xnview.com/en/xnconvert/) image converter

## system add

- gnome-tweaks      `sudo apt install gnome-tweaks`
- menu editor
- dconfig editor
- gpart

## programming

- visual studio code
- xampp
- postgresql
- kwite
- DB brower
- filezella
- zeal
- firewall
- postman
- packet tracer

## virtualization

- virtual box
- team viewer

## pdf

- xournal++

## video and audio

- vlc
- losslesscut
- Handbrake
- openshot
- Kdenlive
- shortcut

## Screenshot and screen recording tools

- kazam
- obs

## Downloading tools

- youtube-dl
- free download manager
- transmission : like turrent

# how to

## open xampp

```shell
sudo apachectl stop

sudo /opt/lampp/manager-linux-x64.run
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

# themes

for terminal

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
  heroku
)
```

# course 1

    nano
    cat
    ls -alt
    cp
    mv *.md
    cat file.md | grep 'name' -i[case insensitive]
    wc      # line number    word count     char count
    cat name.txt | sort > new.md        # sort alphabet
    uniq file       # unique lines only
    dort file | uniq
    sed 's/old/new' file > gg.md    # replace old by new word in file
    whoami
    adduser username
    lsof
    ifconfig
    tcpdump
    top
    htop
    netstat

    ctrl + alt + t      # open terminal