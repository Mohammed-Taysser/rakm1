
title newTitle				// change cmd title
explorer				// open current path in window explorer
command | clip				// copy output of command to clipboard

command /?				// show all details about this command
dir					// list current folder content
dir path\name				// list current path\name content
cd \					// move to root path
d:					// change partition path to 'D:\'
cls					// clear window

ipconfig				// get network ip
osk 					// open on screen keyboard
tasklist				// show current running tasks
mspaint 				// open microsoft paint
command && command 			// run two command in the same time
systeminfo				// show system info
ping url				// check if the website work or not

mkdir name "name 1" 			// make new folders one named name and the other called name 1
mkdir path\name				// make new folder named name at the path folder
move  name newName			// change folder name to newName
move  path\name	newName 		// change folder name to newName at the path folder
xcopy sourse destination /e		// copy folder and sub folder
rmdir name /s				// remove folder
rmdir name 				// remove empty folder

echo string > named.txt			// store string in name.txt, remove content
echo string >> named.txt		// store string in name.txt, append content
type file.txt				// show file content
more file.txt				// show file content
more f1.txt f2.txt 			// show files content
findstr word path\name			// search for word in name