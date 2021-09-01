
# note from ITI Course

## other

- `show ip route`
- `ipconfig /all`
- `show ip dhcp pool`
- `show ip dhcp binding`

## open router port with configure

    enable

    configure terminal

    interface gigabitEthernet 0/0

    ip address 192.168.30.1 255.255.255.0

    no shutdown

## create DHCP server

    ip dhcp pool alex

    network 192.168.30.0 255.255.255.0

    default-router 192.168.30.1

    dns-server  8.8.8.8

## connect to external network like `we`

    interface serial 0/0/0

    ip address 41.0.0.1 255.255.255.252

    no shutdown

    do wr

## static route

    ip route 192.168.1.0 255.255.255.0 serial 0/0/1
    
    ip route 192.168.1.0 255.255.255.0 60.0.0.2
