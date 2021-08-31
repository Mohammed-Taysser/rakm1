
# note from ITI

## other

- `show ip route`
- `ipconfig /all`
- `show ip dhcp pool`
- `show ip dhcp binding`
- `ip route 192.168.1.0 255.255.255.0 serial 0/0/1`
- `ip route 192.168.1.0 255.255.255.0 60.0.0.2`

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

## connect with `we`

    interface serial 0/0/0

    ip address 41.0.0.1 255.255.255.252

    no shutdown

    do wr
