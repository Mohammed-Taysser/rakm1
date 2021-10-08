
# Network + Cyber Security Essional

## Other

- `show ip route`
- `show ip dhcp pool`
- `show ip dhcp binding`
- `show mac address-table`
- `show vlan`
- `show spanning-tree`

### window Terminal

- `ipconfig /all`
- `arp -a`
- `ping 2001:abcd:1999:more::1`

## Open Router Port With Configure

    enable

    configure terminal

    interface gigabitEthernet 0/0

    ip address 192.168.30.1 255.255.255.0

    no shutdown

## Create DHCP Server

    ip dhcp pool alex

    network 192.168.30.0 255.255.255.0

    default-router 192.168.30.1

    dns-server  8.8.8.8

## Connect To External Network Like `we`

    interface serial 0/0/0

    ip address 41.0.0.1 255.255.255.252

    no shutdown

    do wr

## Static Route

    ip route 192.168.1.0 255.255.255.0 serial 0/0/1

    ip route 192.168.1.0 255.255.255.0 60.0.0.2

## vlan

### Create vlan

    vlan 10

    name sales

    exit

### Add pc To vlan

    interface fastEthernet 0/1

    switchport access vlan 10

    # range select
    interface range fastEthernet 0/1-3

    # range and single select
    interface range fastEthernet 0/1, fastEthernet 0/6-8

### Switch Port To Trunk

    interface fastEthernet 0/2

    switchport mode trunk

### Change Priority

    spanning-tree vlan 1 priority 4096

## ip V6

### on router

    ipv6 unicast-routing

    interface gigabitEthernet 0/0

    ipv6 enable

    ipv6 address 2001:abcd:5522:af11::1/64

    no shutdown

## Management Protocol

### SNMP

set password for use

    snmp-server community password_123 rw

### NTP

    ntp server 192.168.16.52

    # mean we will use authentication to change time
    ntp authenticate

    # it take 30 sec to synchronize in all the network
    ntp authentication-key 1 md5 password_123

    do show clock

### telnet

    # 5 virtual command line (from 0 to 4 is 5)
    line vty 0 4

    # use the username and password
    login locale

    exit

    # 0 : no permission, 1 : less permission, 15 : all permission
    username admin privilege 15 password password_123

### CDP

    show cdp neighbors

### banner

> **motd** : message of the day

    banner motd # message to appear #

# MS Course

## to setup the main server

1. turn off the firewall (localserver on left)
2. add static ip to the server (open network sharing on click network icon on task bar)
   1. 192.168.1.100
   2. 255.255.255.0
   3. 192.168.1.1
   4. 127.0.0.1
3. restart the server
4. add new role (dashboard on left)
   1. check that the static ip for server are chosen
   2. check active directory domain server
   3. press ad freather
   4. prees install
5. restart the server
6. on notification you will find a prompit click it
7. choose `add a new forest` and type the domain name
8. contine the steps it's easy

## on windows 10

1. add static ip
   1. 192.168.1.200
   2. 255.255.255.0
   3. 192.168.1.1
   4. 192.168.1.100
2. pc > properties > remote setting > change name

# redhat

## startup

    cmd option arg_1 arg_2

    ls -a[all fle even hidden] -l[long details] -h[human readable size]
    dir
    pwd
    clear
    su
    date
    cal
    who
    whoami
    whereis
    echo
    history
    man -f[file source] -k[search for keyword]
    password [change password in root mode]
    touch file1 file2

    cp -r source destination      [copy]
    mv    file_name     [cut or rename]
    rm    file_name     [remove]
    cat   file_name     [show, change file content]
    more  file_name     [show file content]
    less  file_name     [show file content]
    mkdir dir_name      [make dir]
    rmdir -r dir_name   [remove dir]

    tail -n 3           [print last n line]
    head -n 3           [print first n line]

    pinfo               only in redhat  like man

## `/` root dir

    /bin/   : essential running command
    /sbin/  : system command (storage, ...)
    /boot/  : necessary files for booting
    /lib/   : needed library for system
    /lib64/ : needed library for 64-bit system
    /tmp/   : temporary files
    /var/   : changeable files size (log, ...)
    /home/  : user home dir (dir for each user)
    /root/  : root home dir
    /etc/   : system configuration files
    /dev/   : devices on system

## vim

                                                                         k
      Move around:  Use the cursor keys, or "h" to go left,            h   l
                    "j" to go down, "k" to go up, "l" to go right.       j
    Close this window:  Use ":`q<Enter>`".
    Get out of Vim:  Use ":qa!`<Enter>`" (careful, all changes are lost!).

    Jump to a subject:  Position the cursor on a tag (e.g. bars) and hit CTRL-].
    With the mouse:  ":set mouse=a" to enable the mouse (in xterm or GUI).
                        Double-click the left mouse button on a tag, e.g. bars.
            Jump back:  Type CTRL-O.  Repeat to go further back.

    Get specific help:  It is possible to go directly to whatever you want help
                        on, by giving an argument to the :help command.
                        Perpend something to specify the context:  help-context

    Command-line command        Esc
    Insert mode command         i
    Insert mode + new line      o
    delete line                 dd
    delete char                 x
    cut line                    c
    copy line                   yy
    undo                        y
    last line                   G
    first line                  g
    quit                        :q
    quit and save               :wq
    Regular expression          /   + enter
    perform copy with n number     n y

    See help-summary for more contexts and an explanation.


    Search for help:  Type ":help word", then hit CTRL-D to see matching
                        help entries for "word".
                        Or use ":helpgrep word". :helpgrep

    Getting started:  Do the Vim tutor, a 30-minute interactive course for the
                        basic commands, see vimtutor.
                        Read the user manual from start to end: usr_01.txt

    Vim stands for Vi IMproved.  Most of Vim was made by Bram Moolenaar, but only
    through the help of many others.  See credits.

### redierct

an example is `log` file

    ls >  ls.txt     # replace
    ls >> ls.txt     # append

### pip line `|`

take the output of command one and use it as input for command two

### other type pr terminal

    bash    the default one, to use `bash`
    shell   to use `sh`

### grouping

    cmd ; cmd ; cmd .....

### wildcard

    one char
    file?
    file1 file2 file3 file4

    all char
    file*
    file1 file2 file3 file4

    all char
    file[1-3]
    file1 file2 file3

## users

    useradd
    usermod
    userdel

    # change sell
    # list all shell : cat /etc/sells
    usermod -s /bin/sh username
    usermod -c 'comment as full name' -u 2000 -e '2021-10-20' username

    # -L : lock user
    # -U : unlock user

    # delete user without it's home dir
    userdel  username
    ## it's home dir still
    ls -ls /home/username
    ### to remove it
    rm -rf /home/username

    # delete user with home dir
    userdel -r username

    groupadd

    # add user to primary group
    useradd -g pr_group username

    groupmod
    groupdel

    # delete user from all group and add him to new secandary group
    usermod -G new_group username

    # append user to a new secandary group
    usermod -aG new_group username

## files

    /etc/passwd

    cat /etc/passwd
        ....
        # username x:password  1005:UID    1007:Group_ID   home dir    bash used
        username:x:1005:1007::/home/username:/bin/bash
        ....

    /etc/shadow

    cat /etc/shadow

    # if password start with ! mean user is locked

    # set password
    passwd username

    /etc/group

    cat /etc/shadow

    group_name:x:1005:username

## permission

![linux-permission](../assets/images/linux_permission.png)

first char is file type (file is `-`, dir is `d`)

    chmod u=rw file     # user
    chmod g=rw file     # group
    chmod o=rw file     # other

    r = 4       w = 2       x = 1
    rw = 6      rx = 5      wx = 3      rwx = 7

    chmod 764 file      # u:rwx     g=rw    o=r
    chmod 000 file      # no permission

    chmod a+w file      # a:all     +: add      -:remove
    chomd u+w file

    # for dir
    chmod -R 755 data/

    # for change owner
    chown mohammed data/

    # for change group
    chgrp iti data/

    # change owner & group in one line
    chown mohammed:iti data/
    
    chown -R mohammed:iti data/

## process

    ps -aux         # snapshot of process
    ps -aux | grep service_id
    pstree          # tree of process and it's dependinies
    top             # snyn process snapshots

    kill -15 process_id     # terminate
    kill -9 process_id      # kill if not response

    firefox&                # work in background
    fg 1                    # back to work in terminal 1 is job number
    jobs                    # show working job in background
    nohub cmd               # work cmd even terminal is close (deamon)

## services

    tty
    who                 # logined user
    webmin
    systemctl   action  service_name        # see manual
    service
    systemctl list-unit-files -t servic     # current working services
    systemctl status sshd
    systemctl enable sshd
    systemctl reload sshd
    systemctl restart sshd
    systemctl is-enabled sshd

    runlevel        # GUI or terminal used

    init 3          # CLI, 5 is GUI

    systemctl get-default runlevel                 # which level is used
    systemctl set-default runlevel3-target         # no GUI
    systemctl isolate runlevel3-target             # toggle GUI by CLI tempolrary
    systemctl isolate runlevel6-target  == init 6 == reboot

## secret key

    ssh-keygen

    # an output
    SHA256:mx82mdDS/AvoTB28cCV7r43wvfY3vY0JEJrVLSUhHmo student@lab.example.com

    # location
    /home/student/.ssh/id_rsa.pub

    # transfare
    ssh-copy-id -i /home/student/.ssh/id_rsa.pub student@192.168.29.129

    # login
    ssh student@192.168.29.129

    ## or
    ssh -v student@192.168.29.129

    ## or
    ssh -l student 192.168.29.129

    # remove the key
    rm -rf .ssh/id_rsa*

## work with compress

    # arcaide
    tar -cf /root/etc.tar /etc/     # f[file] c[create] v[vision]

    # compress
    gzip file
    bzip2 file
    xz file

    # uncopress
    bzip2 -d file.bz2
    gzip -d file.gz

    tar -xf etc.tar     # x[extract]

    ## arcide and compress at the same time

    tar -cJvf /root/etc.tar.xz    # compress using z[gzip] j[bzip2] J[xz]

## transfer over network

    ## secure copy
    scp etc-backup.tgz student@192.168.29.129/data/backup    # file
    scp -r etc-backup.tgz student@192.168.29.129/data/backup # dir

    ## not encrypted transfear
    rsync -avz /etc  /data/    
    rsync -avz /etc  student@192.168.29.129/data/ 

## logs

    ## show log
    less /var/log/messages

    ## write log
    ### rsyslog configration and paths
    vat /etc/rsyslog.conf

    systemctl status rsyslog-service

    journalctl          # logs from start pc


## network

    ifconfig
    lspci
    lspci -v
    
    ## GUI  => network manager
    ## TEXT => nntui
    ## CLI  => mmcli
    mmcli connection show
    mmcli connection edit eth1

    ## reload / restart network service
    mmcli connection reload
    systemctl reload NetworkManager
    ifdown eth1 ; ifup eth1             # only interface eth1

    ### configration file
    ls /etc/sysconfig/network-scripts
    cat /etc/sysconfig/network-scripts/ifctg-eth1

    ## change ip temporiary (only not write on setting)
    ipconfig eth2 192.168.10.10 netwmask 255.255.255.0

    route -n

    ## DNS
    vim /etc/resolve.conf

    ## hosts
    vim /etc/hosts

## install programs



diff between arcide and compress

password  ||  -p redhat


## exam

1- Configure your Host Name, IP Address, Gateway and DNS.

Host name: station1.example.com

IP Address:XXX.XXX.XXX.100/24 

Gateway:XXX.XXX.XXX.1

DNS1:8.8.8.8

DNS1:8.8.4.4

where x is your vmware  subnet .

    cat /etc/sysconfig/network-scripts/ifcfg-ens33

2- Create a directory under /home named admins. Its respective group is requested to be the admin group. The group users could read and write, while other users are not allowed to access it. 

    cd /home/
    mkdir admins ; chgrp admin admins ; chmod 560 admins/

3- Create a directory named /common. Allow john and davis to share documents in the /common directory using a group called team. Both of them can read, write and remove documents from the other in this directory but any user not member of the group can’t.

    mkdir common ; groupadd team ; chgrp team common ; chmod 560 common
    usermod -aG team john
    usermod -aG team davis
    chmod 060 common/
    

4- Find the files owned by john, and redirect the output to /root/find.txt

    find -user  john > /root/find.txt

5- Find out all the columns that contains the string seismic within /usr/share/dict/words, then copy all these columns to /root/lines.txt 

    cat /usr/share/dict/words  | grep seismic > /root/lines.txt

6- Create a user harry  uid is 3400. Password is redhat

    useradd -u 3400 harry
    id -u harry
    passwd harry

7- Create a backup file named /root/backup.tar.bz2, contains the content of /etc , tar must use bzip2 to compress.

    tar -cjvf /root/backup.tar.bz2 /etc/

8- Add a repository for YUM with name   custom_repo which can be found via URL http://mirror.centos.org/centos/7/os/x86_64/

    touch /etc/yum.repos.d/custom_repo.repo
    gedit /etc/yum.repos.d/custom_repo.repo
    yum search httpd

9- install httpd and vsftpd  packages  then ensure both  services will start after  the reboot 

    yum search httpd
    yum search vsftpd

    yum install vsftpd.x86_64
    yum install httpd.x86_64

    systemctl start vsftpd
    systemctl status vsftpd

    systemctl start httpd
    systemctl status httpd


10- Create a soft link from /etc/hosts to /root/softlink 

    ln -s /etc/hosts /root/softlink
