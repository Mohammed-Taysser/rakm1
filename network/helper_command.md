

> user mode   >> privileged mode    >>  configuration mode

> go | exist to privileged mode
    enable      
    disable

> go | exit from configuration mode

    configure
    exit

## set host name

    hostname mohammed

## set password

    enable password 123456789      # show password while writing it
    enable secret   123456789      # don't show password while writing it


## other command

- reload                # reload the server (in user mode)
- copy run start        # save config   (in user mode)
- show  running-config  # show recent commands


## disable any command

    no command_name

    no enable password