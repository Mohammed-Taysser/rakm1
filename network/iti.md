
# Note From ITI Course

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
