

> user mode   >> privileged mode    >>  configuration mode

> go | exist to privileged mode
    enable      
    disable

> go | exit from configuration mode

    configure
    exit


# user mode commands



# privileged mode commands

    - copy run start        # save config
    - reload                # reload the server
    - show running-config   # show recent commands
    - show ip arp           # show operation
    - show version
    - show flash            # show size and capacity of IOS
    - show history          # latest commands
    - backup and restore    copy source destination
      - copy flash tftp             # backup IOS
      - copy tftp flash             # restore IOS
      - delete flash:file_name      # delete IOS from flash
      - copy start tftp             # backup config file
      - copy tftp start             # restore config file
      - erase startup-config        # erase config file


# configuration mode commands

## set host name

    hostname mohammed

## set password

    - enable password root      # show password while writing it
    - enable secret   root      # don't show password while writing it


## set password for condole

    - line console 0                # enter console 0
    - password root                 # set password for this console
    - login                         # make any one use this password for login

## set IP for router

    - interface  Gig0/0/0               # enter port  Gig0/0/0
    - no shutdown                       # run port
    - ip address  10.0.0.1  255.0.0.0   # set ip and mask [already configure it manual]
    - line vty 0 4                      # open 4 port for communication
    - password root                     # set password
    - login

## password recovery

    - to access ROMAN, press ctrl + break
    - in ROMAN
      - config 0x2142
      - reset
    - in setup mode [configuration mode]
      - show start
      - copy start run      # to copy config file
      - then change the password or do any change
      - finally, run config-register 0x2102


## other

- service password-encryption       # encrypt any password for show
- banner  motd $ welcome hacker $   # set message in login
- do command                        # execute command from privileged mode in configuration mode




# on router

## configuration mode commands

  - boot system flash IOS_name          # boot from IOS on router
  - IOS_name tftp_ip_address            # boot from IOS on server



# for all modes

## disable any command

    no command_name

    no enable password