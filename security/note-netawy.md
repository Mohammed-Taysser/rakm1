
# Technawi Notes (CEH v9)

## Course Content 📔

1. Introduction To Ethical Hacking (Basic & Essential)
2. Building Your Testing Lab
3. Foot printing & Reconnaissance
4. Scanning Network
5. Enumeration
6. System Hacking
7. Malware Threats
8. Sniffing
9. Social Engineering
10. Denial Of Service
11. Session Hijacking
12. Hacking Web Server
13. Hacking Web Application
14. SQL Injection
15. Hacking Wireless Network
16. Hacking Mobile Platform
17. Evading Ids, Firewalls & Honeypots
18. Cloud Computing
19. Cryptography
20. Buffer Overflow

# Introduction To Ethical Hacking 👾

**Information Security** is a state of well-being of information and infrastructure in which the possibility of theft, tempering and disruption of information and service is kept low or tolerable

## Elements Of Information Security

1. Confidentiality (only authorized people can seen content or enter system)
2. Integrity       (only authorized people can seen update or edit content)
3. Availability
4. Authenticity
5. Non Repudiation   (non-denial)

## Strength Of System

for example: two way authentication that need to enter email & password then send code to email and enter it which reduce usability of the application

![strength of system](../assets/images/strength_of_system.png)

## Essential Terminology

1. Hack Value       (the value or benefits of hack system)
2. Vulnerability    (weak point)
3. Exploit          (code or way use to hack system)
4. Payload          (code or method)
5. Zero Day Attack  (vulnerability not fixed yet)
6. Daisy Chaining   (used hacked information to hack another system 😜)
7. Doxing           (collect information about organization from social media)
8. Bot

## Information Security Threats & Attacks

    Attack = Motive + Method + Vulnerability

### Top Information Security Attack Vectors

- Cloud Computing Threats
- Advanced Persistent Threats
- Malwares
- Mobile Threats
- Botnet (install bot on many devices)
- Insider Attacks (inside organization)

### Information Security Category 💀

1. Network Threats (like know network device that work, sniffing)
2. Host Threats    (stole session, send malware)
3. Applications Threats (web attack, buffer overflow)

## Type Of Attack On System

1. Os Attack (uninstall updated)
2. Mis Configurations Attack (admin, admin)
3. Applications Level Attack
4. Shrink Warp Code Attack (use code already written like framework, library)

## Information Warfare

concept involving the use and management of information and communication technology in pursuit of a competitive advantage over opponent

can be explain as the war between companies, countries and more that seeks to use the best of information, any of them has defensive team to protect and offensive team to attack

-----

## Hacking Concepts

- **hacking** process of exploiting vulnerability to gain unauthorized access to system or resources
- **hacker** highly skilled computer expert capable of breaking into computer systems and networks using bugs and exploits

### Hacker Classifications

1. White Hat Hackers
2. Black Hat Hackers
3. Gray Hat Hacker
4. Suicide Hackers
5. Script Kiddies
6. Cyber Terrorists (politics)
7. State Sponsored
8. Hacktivist (active online, searching for hack for any goals)

### Hacking Phases

1. Reconnaissance | Footprint (active phase or passive phase)
2. Scanning And Enumeration
3. Gaining Access (now we are hack)
4. Maintaining Access (like back door)
5. Covering Tracks (remove any evidence that system is hack)

## Ethical Hacking

term used to describe hacking performed by company or individual to help identify potential threats on a computer or network

it focus on simulating techniques used by attackers to verify the existence of exploitable vulnerabilities in the target system

it necessary because it allow to counter attacks from malicious hackers by following the methods used by them to hack the system

## Vulnerability Assessment

process that define, identifies and classifies the security logs in a computer, network or a communication infrastructure

### Types Of Vulnerability Assessment

1. Active Assessments (use tools to get information about working devices)
2. Passive Assessments(use tools to get the information transmitted on network)
3. Host Base Assessments (software install o device to get information about it)
4. Internal Assessments (finding Vulnerability inside organization)
5. External Assessments (finding Vulnerability outside organization)
6. Application Assessments (scan any application for Vulnerability)
7. Network Assessments
8. Wireless Network Assessments

### Vulnerability Assessment Phases

1. Acquisition (find a previous Vulnerability)
2. Identification (meeting with employee)
3. Analyzing
4. Evaluation (determine how to use Vulnerability and it's serious)
5. Reporting

## Vulnerability Research

process by which security flaws in technology are identified and helps to identify and eliminate security flaws that might overwise be exploited by malicious hackers. it can but doesn't allow involve reverse engineering, code analysis, static analysis, ...

### Vulnerability Classified Base On

1. Severity Level   [how it serious Height, Low, Medium]
2. Exploit Range    [working area Local | Remote]

## Penetration Testing

simulated attack on a computer system that looks for security weakness, potentially gaining access to the computer's feathers and data

### Penetration Testing Classes

1. White Box (know all information about target organization)
2. Gray Box  (know some information about target organization)
3. Black Box (don't know any information about target organization)

### Penetration Testing Phases

1. Pre Attack
2. Attack
3. Post Attack

## Security Audit

Ensure that the company or organization follows the general safety standards

### Penetration Testing  Methodology

1. OWASP
2. OSSTMM
3. ISSSAF
4. EC-Council LPT

## Information Security Controls

### Information Assurance (IA)

assurance that the information and information's systems is protected during usage, processing, storage and transmission

### Information Security Management Program

program design to enable any business to reduce the risk

### Threads Modeling

risk assessment approach for analyzing security of an application by capturing and analyzing all information that effect the security of an application

### Enterprise Information Security Architecture (EISA)

aet of requirements, process, principles and models that determine the structure and behavior of information system

### Network Security Zoning

allows an organization to manage a secure environment by selecting the appropriate security levels for different zones of internet and internet networks also it helps to mentor and control inbound and outbound traffic

![Network Security Zoning](../assets/images/network_security_zone.png)

### Information Security Policy

define the basic security requirements and rules to be implements in order to protect and secure in formation security

### Physical Security

first layer od protection in any organization and it involves protection of organizational assets from both environmental (fire) and man made threats (war)

### Incident Management

set of defined process to identify, analyse prioritize and resolve security incidents to restore normal service operations as quickly as possible and to prevent future recurrence of the incident

# Building Your Testing Lab 💻

    watch videos 😜

# Foot printing & Reconnaissance 👀

## Module Content

- Footprinting Concepts
- Footprinting Methodology
- Footprinting Tools
- Footprinting Countermeasuers
- Footprinting Pentesting

## What Is Footprinting

also know as Reconnaissance, the technique used for gathering information about computer systems an d the entities they belong to.

to get information, hacker might use various tools and technology. this information is very useful to hacker who trying to crack a whole system

Footprinting can reveal system vulnerabilities and improve the ease with which they can be exploit like social engineering

consider the **most important phase** of ethical hacking as:

- allow attacker know about security posture for target
- reduce attacker focus area
- allow attacker to identify vulnerabilities
- allow attacker to draw the map for the target network infrastructure

### Footprinting Types

- **Passive Footprinting** : collect information without direct interacting with the target
- **Active Footprinting** : collect information by interacting with the target with any mean

### Footprinting Objects

help attackers to collect information suck as:

- Network Information (ip's, OS)
- System Information (working services)
- Organization Information (phones, address)

### OSINT

stands for `open source intelligence` which reefer to any unclassified information and includes anything freely or publicly available on the web

sources includes:

- Social Networks
- Forums
- Business Website
- Blogs
- Videos
- New Sources

OSINT is one of many INTs (intelligence) disciplines employed by government intelligence agents such as:

- HUMINT (human intelligence: gathering intelligence by interacting with people)
- SIGINT (signal intelligence: gathering data from sensors)
- GEOINT (geospatial intelligence : gathering data from satellites)

## Footprinting Methodology

- Search Engin Footprinting
- Advanced Google Hacking
- Social Network Footprinting
- Website Footprinting
- Email Footprinting
- Competitive Intelligence
- WHOIS Footprinting
- DNS Footprinting
- Network Footprinting
- Social Engineering Footprinting

## Search Engin Footprinting

data collected such that:

- Technology Platforms
- Employee Details
- Login Pages
- Intranet Portals

### general examples

- [wikipedia](https://en.wikipedia.org/wiki/Main_Page)
- [google](https://www.google.com/)
- [bing](https://www.bing.com/)
- [netcraft](https://www.netcraft.com/)
- [shodan](https://www.shodan.io/)

### jops examples

- [bayt](https://www.bayt.com/en/egypt/)
- [linkedin](https://www.linkedin.com/)

### people example

- [linkedin](https://www.linkedin.com/)
- [pipl](https://pipl.com/)

### geolocation

- google map
- wikipedia
- bing map

### finance services

- google finance
- yahoo finance

### advanced google hacking

see googling file 😉

GHDB [google hacking database]

- [hackers for charity](https://hackersforcharity.org/)
- [exploit-db](https://www.exploit-db.com/)

## Website Footprinting

collect data such that:

- used software & it's version
- used OS
- suv directory & parameters
- filename, paths, database fields name or query
- scripting platform & CMS details
- contact details

### Attacker can use

- Burp suit
- zaproxy
- paros proxy
- firebug
- wappalzer

**Mirroring** the target like [HTTrack](https://www.httrack.com/) (website copier) into local system giving the attacker the opportunity to browse it offline so attacker can find the directory structure for the website and search for valuable data from the copy.

HTTrack found as CLI tool on kali linux

also attacker can:

- examine html source code to find data like comment, address
- examine cookies to find data on them
- use web spiders (GSA email spider, [web data extractor](http://www.webextractor.com/)) to perform automate searches on the target website and collect data like employee names and more for social engineering
- use internet archives to see archived versions like [archive.org](https://archive.org/)

## Email Footprinting

analyze email header like:

- [ip address location](https://www.ipaddresslocation.org/)
- [ip location](https://www.iplocation.net/)

## Competitive Intelligence

process of identify, gathering, analyzing, verifying and using information about competitive from resources such as internet

sources:

- company website and employment ads
- search engin
- press releases and annual reports
- journals, conference and newsletters
- social engineering
- customer & vendor reviews

## WHOIS Footprinting

query and respond protocol that is widely used for querying databases that stor the registered users or assignees of internet resource such as domain name, IP address block or autonomous system. but it also used for a wider range of other information

WHOIS database are maintained by **Regional Internet Register** (RIR) and contact personal information of domain owners

WHOIS query return:

- Domain Name Details (email, address)
- Contact Details Of Domain Owner
- Domain Name Services
- NetRange
- Domain Name Creation Date & Expiry Date
- Domain Name Last Update

also `whois`, `nslookup`, `dig` available as CLI in kali linux

an example is [whois domain tools](https://whois.domaintools.com/)

## DNS Footprinting

domain name servers are the internet equivalent of phone book. they maintain a directory of domain names and translate them to internet protocol (IP) address

it provide an important information about location and type of servers

attacker can gather DNS information to determine key host in the network and can perform social engineering attacks

see [network-tools webwiz](https://network-tools.webwiz.net/) form ore tools

## Network Footprinting

network range information assists attacker to crate a map of the target, also find IP range using ARIN [whois database search tool](https://www.whois.com/whois/arin.net)

traceroute (CLI tool) works on the concept of ICMP protocol and use TTL field in the header of ICMP packets to discover the routers on the path to target host

attacker conduct traceroute to extract information about:

- network topology
- trusted routers
- firewall location

## Social Engineering Footprinting

the art od exploiting human behavior to extract confidential information. it depend on the act that people are unaware of their valuable information and are careless about protect it do attacker attempt to gather:

- credit card details & SSN
- usernames & passwords
- security product i use
- OS & software version
- network layout information
- IP address & name of servers

### Social Engineering Techniques

- Eavesdropping
- Shoulder Surfing
- Dumpster Diving
- Impersonation

## Footprinting Tools

watch videos for more details 😜

- maltego (on kali linux)
- fierce (on kali linux)
- FOCA (has GUI in windows)
- recon-NG
- dnsrecon (on kali linux)
- dnsmap (on kali linux)
- dnstracer (on kali linux)
- dnsenum (on kali linux)
- dnswalk (on kali linux)
- metagoofil
- the harvester (on kali linux)
- Dmitry (on kali linux)
- [sublist3r](https://github.com/aboul3la/Sublist3r)

stop 20
