
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
2. pc>properities > remote setting > change name
