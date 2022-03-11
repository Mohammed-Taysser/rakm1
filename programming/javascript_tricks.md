
# Js Tricks

## Resources

- <https://1loc.dev/>
- <https://shortcode.dev/javascript-cheatsheet>

# JS DOM

## Ready Function

```js
window.onload = function () {
  document.body.classList.remove('load');
};

// recommended
window.addEventListener("DOMContentLoaded", () => {
  loadTheme(getCurrentTheme());
});
```

## prevent right click

```js
document.addEventListener('contextmenu', function(e){
  e.preventDefault();
})
```

## scroll To Top

```js
const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
};

scrollToTop(); // Smooth-scrolls to the top of the page

//  or
document.documentElement.scrollTo({
  top: 0,
  left:0,
  behavior: 'smooth'
});
```

## smooth Scroll

```js
const smoothScroll = (element) =>{
  document.querySelector(element).scrollIntoView({
    behavior: 'smooth'
  });
}

smoothScroll('#fooBar'); // scrolls smoothly to the element with the id fooBar
smoothScroll('.fooBar');
// scrolls smoothly to the first element with a class of fooBar
```

## Scroll to an element

```js
ele.scrollIntoView({ behavior: 'smooth' });
```

## Check if an element is a descendant of another

```js
const isDescendant = (child, parent) => parent.contains(child);
```

## Check if the touch events are supported

```js
const touchSupported = () => 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch);
```

## Check if user scrolls to the bottom of the page

```js
const isAtBottom = () => document.documentElement.clientHeight + window.scrollY >= document.documentElement.scrollHeight;
```

## Detect Internet Explorer browser 🥲

```js
const isIE = !!document.documentMode;
```

## Get all siblings of an element

```js
const siblings = (ele) => [].slice.call(ele.parentNode.children).filter((child) => child !== ele);
```

## Get the position of an element relative to the document

```js
const getPosition = (ele) => ((r = ele.getBoundingClientRect()), { left: r.left + window.scrollX, top: r.top + window.scrollY });

getPosition(document.body); // { left: 0, top: 0 }
```

## Get the selected text

```js
const getSelectedText = () => window.getSelection().toString();
```

## Insert given HTML after an element

```js
const insertHtmlAfter = (html, ele) => ele.insertAdjacentHTML('afterend', html);
```

## Insert given HTML before an element

```js
const insertHtmlBefore = (html, ele) => ele.insertAdjacentHTML('beforebegin', html);
```

## Redirect to another page

```js
const goTo = (url) => (location.href = url);
```

## Reload the current page

```js
const reload = () => location.reload();

// Or
const reload = () => (location.href = location.href);
```

## Toggle an element

```js
const toggle = (ele) => (ele.style.display = ele.style.display === 'none' ? 'block' : 'none');

// Or
const toggle = (ele) => (ele.hidden = !ele.hidden);
```

## Select the text of a textarea automatically

```js
ele.addEventListener('focus', function (e) {
    // Select the text
    e.target.select();
});
```

## Select the text content of an element

```js
const selectText = function (ele) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(ele);
    selection.removeAllRanges();
    selection.addRange(range);
};
```

## Replace broken images

```js
// Assume that I want to replace all images on the page
const images = document.querySelectorAll('img');

// Loop over them
[].forEach.call(images, function (ele) {
    ele.addEventListener('error', function (e) {
        e.target.src = '/path/to/404/image.png';
    });
});
```

## Remove all children of a node

```js
// 1. Empty the inner HTML (not recommended)
ele.innerHTML = '';

// Remove child nodes
while (node.firstChild) {
    node.removeChild(node.firstChild);
}
```

## Get the size of an image

```js
// Image is already loaded
const image = document.querySelector(...);
// Get the original size
const naturalWidth = image.naturalWidth;
const naturalHeight = image.naturalHeight;
// Get the scaled size
const width = image.width;
const height = image.height;

// Image is not loaded yet
const image = document.createElement('img');
image.addEventListener('load', function (e) {
    // Get the size
    const width = e.target.width;
    const height = e.target.height;
});
// Set the source
image.src = '/path/to/image.png';
```

### Use case

```html
<input type="file" id="avatar" />

<!-- Display the size -->
<div id="size" />
```

```js
const avatarEle = document.getElementById('avatar');
const sizeEle = document.getElementById('size');

avatarEle.addEventListener('change', function (e) {
    // Get the selected file
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('loadend', function (e) {
        const src = e.target.result;

        calculateSize(src).then(function (data) {
            const width = data.width;
            const height = data.height;

            sizeEle.innerHTML = `${width} x ${height}`;
        });
    });
});
```

## Get size of the selected file

```html
<input type="file" id="upload" />
<div id="size"></div>
```

```js
const fileEle = document.getElementById('upload');
const sizeEle = document.getElementById('size');

fileEle.addEventListener('change', function (e) {
    const files = e.target.files;
    if (files.length === 0) {
        // Hide the size element if user doesn't choose any file
        sizeEle.innerHTML = '';
        sizeEle.style.display = 'none';
    } else {
        // File size in bytes
        sizeEle.innerHTML = `${files[0].size} B`;

        // Display it
        sizeEle.style.display = 'block';
    }
});

// Display a readable size
// Convert the file size to a readable format
const formatFileSize = function (bytes) {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
};

// Display the file size
sizeEle.innerHTML = formatFileSize(files[0].size);
```

## Get siblings of an element

```js
// Get the previous sibling
const prev = ele.previousSibling;

// Get the next sibling
const next = ele.nextSibling;

// Get all siblings
// Get the parent node
const parent = ele.parentNode;
// Filter the children, exclude the element
const siblings = [].slice.call(parent.children).filter(function (child) {
    return child !== ele;
});
```

## Check if an element is visible in a scrollable container

```js
// The following functions return true if the ele element is visible in its scrollable container:
const isVisible = function (ele, container) {
    const eleTop = ele.offsetTop;
    const eleBottom = eleTop + ele.clientHeight;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;

    // The element is fully visible in the container
    return (
        (eleTop >= containerTop && eleBottom <= containerBottom) ||
        // Some part of the element is visible in the container
        (eleTop < containerTop && containerTop < eleBottom) ||
        (eleTop < containerBottom && containerBottom < eleBottom)
    );
};

// We also can perform the check based on the bounding rectangles of both element and container:
const isVisible = function (ele, container) {
    const { bottom, height, top } = ele.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return top <= containerRect.top ? containerRect.top - top <= height : bottom - containerRect.bottom <= height;
};
```

## Download a file

```html
<!-- 1. Use the download attribute -->
<a href="/path/to/file" download>Download</a>
```

```js
// 2. Trigger the click event
// Create a new link
const link = document.createElement('a');
link.download = 'file name';
link.href = '/path/to/file';
// Append to the document
document.body.appendChild(link);
// Trigger the click event
link.click();
// Remove the element
document.body.removeChild(link);

// 3. Download file with generated data
const data = JSON.stringify({ 'message': 'Hello Word' });
const blob = new Blob([data], { type: 'application/json' });
// Create new URL
const url = window.URL.createObjectURL(blob);
// Create a link and trigger the download
// Free the URL created above
window.URL.revokeObjectURL(url);
```

## Preview an image before uploading it

```html
<input type="file" id="fileInput" />
<img id="preview" />
```

```js
const fileEle = document.getElementById('fileInput');
const previewEle = document.getElementById('preview');
```

```js
// 1. Use the URL.createObjectURL() method
fileEle.addEventListener('change', function (e) {
    // Get the selected file
    const file = e.target.files[0];

    // Create a new URL that references to the file
    const url = URL.createObjectURL(file);

    // Set the source for preview element
    previewEle.src = url;
});
```

```js
// 2. Use the FileReader's readAsDataURL() method
fileEle.addEventListener('change', function (e) {
    // Get the selected file
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.addEventListener('load', function () {
        // Set the source for preview element
        previewEle.src = reader.result;
    });

    reader.readAsDataURL(file);
});
```

## counter on scroll

start count when element is in view and check if already count

```html
<span class="counter-number" data-counter="20000" data-is_count="false"> 1059</span>
```

```js
window.addEventListener('scroll', function () {

    document.querySelectorAll('.counter-number').forEach(counter => {
        if (isInViewport(counter) && counter.getAttribute('data-is_count') == 'false') {
            let frame = 0,
                countTo = parseInt(counter.getAttribute('data-counter'), 10);
            let counter_interval = setInterval(() => {
                frame++;
                let progress = (frame / 250) * (2 - (frame / 250));
                let currentCount = Math.round(countTo * progress);

                if (parseInt(counter.textContent, 10) !== currentCount) {
                    counter.textContent = currentCount;
                }

                if (frame === 250) {
                    clearInterval(counter_interval);
                }
            }, 20);

            counter.setAttribute('data-is_count', true);
        }
    })
});
const isInViewport = function (ele) {
    const rect = ele.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};
```

## Text Scramble

```pug
.text
```

```js
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

const phrases = ["find", "read", "BOOM!"];

const el = document.querySelector(".text");
const fx = new TextScramble(el);

let counter = 0;
const next_word = () => {
  fx.setText(phrases[counter]).then(() => {
    setTimeout(next_word, 1500);
  });
  counter = (counter + 1) % phrases.length;
};

next_word();
```

# Table

## Sort a table by clicking its headers

```html
<table class="table sort-table-by-click-header">
  <thead>
    <tr>
      <th data-type="number"><button class="table-header">#</button></th>
      <th><button class="table-header">First name</button></th>
      <th><button class="table-header">Last name</button></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Andrea</td>
      <td>Ross</td>
    </tr>
  </tbody>
</table>
```

```scss
.sort-table {
  border-collapse: collapse;
  font-family: Inter, sans-serif;
  border: 1px solid #ccc;
  th,
  td {
    border: 1px solid #ccc;
    padding: 0.5rem;
  }
  th {
    cursor: pointer;
    text-decoration: underline;

    .table-header {
      background-color: transparent;
      border: none;
      cursor: pointer;
    }
  }
}
```

```js
const tables_array = document.querySelectorAll('.sort-table-by-click-header');

Array.from(tables_array).forEach((table) => {
  const headers = table.querySelectorAll('th'),
    tableBody = table.querySelector('tbody'),
    rows = tableBody.querySelectorAll('tr');

  // Track sort directions
  const directions = Array.from(headers).map((header) => {
    return '';
  });

  // Loop over the headers
  headers.forEach((head, index) => {
    head.addEventListener('click', () => {
      sortColumn(index);
    });
  });

  function transform(index, content) {
    // Get the data type of column
    const type = headers[index].getAttribute('data-type');

    switch (type) {
      case 'number':
        return parseFloat(content);
      case 'string':
      default:
        return content;
    }
  }

  function sortColumn(index) {
    // Get the current direction
    const direction = directions[index] || 'asc';

    // A factor based on the direction
    const multiplier = direction === 'asc' ? 1 : -1;

    const newRows = Array.from(rows);

    newRows.sort((rowA, rowB) => {
      const cellA = rowA.querySelectorAll('td')[index].textContent;
      const cellB = rowB.querySelectorAll('td')[index].textContent;

      const a = transform(index, cellA);
      const b = transform(index, cellB);

      switch (true) {
        case a > b:
          return 1 * multiplier;
        case a < b:
          return -1 * multiplier;
        case a === b:
          return 0;
      }
    });

    // Remove old rows
    [].forEach.call(rows, (row) => {
      tableBody.removeChild(row);
    });

    // Reverse the direction
    directions[index] = direction === 'asc' ? 'desc' : 'asc';

    // Append new row
    newRows.forEach((newRow) => {
      tableBody.appendChild(newRow);
    });
  }
});
```

## Show or hide table columns (toggle)

```html
<div class="toggle-table-col-container">
  <table class="toggle-table-col">
    <thead>
      <tr>
        <th data-type="number">No.</th>
        <th>First name</th>
        <th>Last name</th>
        <th>Date of birth</th>
        <th>Address</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Andrea</td>
        <td>Ross</td>
        <td>1985-12-24</td>
        <td>95945 Rodrick Crossroad</td>
      </tr>
    </tbody>
  </table>

  <ul class="toggle-table-menu hidden">
  </ul>
</div>
```

```scss
.toggle-table-col-container {
  position: relative;
  font-family: Inter, sans-serif;

  .toggle-table-menu {
    position: absolute;

    list-style-type: none;
    margin: 0;
    padding: 0;

    background-color: #f7fafc;
    border: 1px solid #cbd5e0;
    border-radius: 0.25rem;
    padding: 0.5rem;

    &.hidden {
      display: none;
    }
  }
  .toggle-table-col {
    border-collapse: collapse;
    border: 1px solid #ccc;

    th,
    td {
      border: 1px solid #ccc;
      padding: 0.5rem;
    }
    th {
      user-select: none;
    }
  }
}
```

```js
const tables_container_array = document.querySelectorAll(
  '.toggle-table-col-container'
);

Array.from(tables_container_array).forEach((container) => {
  const table = container.querySelector('table'),
    headers = [].slice.call(table.querySelectorAll('th')),
    menu = container.querySelector('.toggle-table-menu'),
    tableBody = table.querySelector('tbody'),
    rows = tableBody.querySelectorAll('tr'),
    thead = table.querySelector('thead');

  // ----------------
  // - Build the menu
  // ----------------
  headers.forEach((th, index) => {
    // Build the menu item
    const li = document.createElement('li'),
      label = document.createElement('label'),
      checkbox = document.createElement('input'),
      text = document.createTextNode(th.textContent);

    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('checked', 'true');
    checkbox.setAttribute('data-column-index', index);

    checkbox.style.marginRight = '.25rem';

    label.appendChild(checkbox);
    label.appendChild(text);

    label.style.display = 'flex';
    label.style.alignItems = 'center';

    li.appendChild(label);
    menu.appendChild(li);

    // Handle the event
    checkbox.addEventListener('change', (e) => {
      e.target.checked ? showColumn(index) : hideColumn(index);
      menu.classList.add('hidden');
    });
  });

  // ------------------
  // - Toggle the menu
  // ------------------

  thead.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    const rect = thead.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    menu.style.top = `${y}px`;
    menu.style.left = `${x}px`;
    menu.classList.toggle('hidden');

    document.addEventListener('click', documentClickHandler);
  });

  // Hide the menu when clicking outside of it
  const documentClickHandler = function (e) {
    const isClickedOutside = !menu.contains(e.target);
    if (isClickedOutside) {
      menu.classList.add('hidden');
      document.removeEventListener('click', documentClickHandler);
    }
  };

  // ----------------------
  // - Toggle table columns
  // ----------------------
  const numColumns = headers.length;

  const cells = [].slice.call(table.querySelectorAll('th, td'));
  cells.forEach((cell, index) => {
    cell.setAttribute('data-column-index', index % numColumns);
  });

  // To hide all cells in given column, we find all cells based on the data-column-index attribute, and hide each of them:
  function hideColumn(index) {
    cells
      .filter((cell) => {
        return cell.getAttribute('data-column-index') === `${index}`;
      })
      .forEach((cell) => {
        cell.style.display = 'none';
        cell.setAttribute('data-shown', 'false');
      });
    // How many columns are hidden
    const numHiddenCols = headers.filter(function (th) {
      return th.getAttribute('data-shown') === 'false';
    }).length;
    if (numHiddenCols === numColumns - 1) {
      // There's only one column which isn't hidden yet
      // We don't allow user to hide it
      const shownColumnIndex = thead
        .querySelector('[data-shown="true"]')
        .getAttribute('data-column-index');

      const checkbox = menu.querySelector(
        `[type="checkbox"][data-column-index="${shownColumnIndex}"]`
      );
      checkbox.setAttribute('disabled', 'true');
    }
  }

  // By taking the advantage of using data attribute, it's so easy to show the column:
  function showColumn(index) {
    cells
      .filter((cell) => cell.getAttribute('data-column-index') === `${index}`)
      .forEach((cell) => {
        cell.style.display = '';
        cell.setAttribute('data-shown', 'true');
      });

    menu
      .querySelectorAll(`[type="checkbox"][disabled]`)
      .forEach(function (checkbox) {
        checkbox.removeAttribute('disabled');
      });
  }

  cells.forEach((cell, index) => {
    cell.setAttribute('data-column-index', index % numColumns);
    cell.setAttribute('data-shown', 'true');
  });
});
```

## [Export a table to csv](https://htmldom.dev/export-a-table-to-csv/)

```html
<table id="exportMe" class="table">
    <!-- ... -->
</table>
<button id="export">Export</button>
```

### Export the table cells to CSV

```js
const toCsv = function (table) {
    // Query all rows
    const rows = table.querySelectorAll('tr');

    return [].slice
        .call(rows)
        .map(function (row) {
            // Query all cells
            const cells = row.querySelectorAll('th,td');
            return [].slice
                .call(cells)
                .map(function (cell) {
                    return cell.textContent;
                })
                .join(',');
        })
        .join('\n');
};
```

### Download the CSV

```js
const download = function (text, fileName) {
    const link = document.createElement('a');
    link.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(text)}`);
    link.setAttribute('download', fileName);

    link.style.display = 'none';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
};

// The last thing is to connect all pieces together. We just need to handle the click event of the Export button:
const table = document.getElementById('exportMe');
const exportBtn = document.getElementById('export');

exportBtn.addEventListener('click', function () {
    // Export to csv
    const csv = toCsv(table);

    // Download it
    download(csv, 'download.csv');
});
```

# JS BOM

## Check Local-Storage Support

```js
function is_localStorage_support() {
  try {
    return 'localStorage' in window && window.localStorage !=== null;
  } catch (error) {
    return false;
  }
}
```

## Document Notification

```js
let old_title = document.title;
document.title += '(5)'
```

## Change the website favicon

```js
const setFavicon = function (url) {
    // Find the current favicon element
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
        // Update the new link
        favicon.href = url;
    } else {
        // Create new `link`
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = url;

        // Append to the `head` element
        document.head.appendChild(link);
    }
};

setFavicon('/path/to/user/profile/icon.ico');
```

## Use an emoji as the favicon

```js
const emojiFavicon = function (emoji) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.height = 64;
    canvas.width = 64;

    // Get the canvas context
    const context = canvas.getContext('2d');
    context.font = '64px serif';
    context.fillText(emoji, 0, 64);

    // Get the custom URL
    const url = canvas.toDataURL();

    // Update the favicon
    setFavicon(url);
};

// Usage
emojiFavicon('🎉');
```

## Print The Page

```js
window.print()
```

## Detect dark mode

```js
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## Clear all cookies

```js
const clearCookies = () => document.cookie.split(';').forEach((c) => (document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)));
```

## Convert cookie to object

```js
const cookies = document.cookie
    .split(';')
    .map((item) => item.split('='))
    .reduce((acc, [k, v]) => (acc[k.trim().replace('"', '')] = v) && acc, {});
```

# Colors

## RGB To HEX

```js
function RGBToHex (r, g, b) {
  return ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');
}

RGBToHex(255, 165, 1); // 'ffa501'
```

## Convert 3 digits color to 6 digits color

```js
const toFullHexColor = (color) =>
    `#${(color.startsWith('#') ? color.slice(1) : color)
        .split('')
        .map((c) => `${c}${c}`)
        .join('')}`;

toFullHexColor('123'); // '#112233'
toFullHexColor('#123'); // '#112233'
toFullHexColor('#abc'); // '#aabbcc'
```

## Convert RGB Color To HEX

```js
const rgbToHex = (red, green, blue) => `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;

// Or
const rgbToHex = (red, green, blue) => `#${[red, green, blue].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

rgbToHex(0, 255, 255); // '#00ffff'
```

## HEX To RGB

```js
function hexToRGB (hex) {
  let alpha = false, h = hex.slice(hex.startsWith('#') ? 1 : 0);
  if (h.length === 3) h = [...h].map(x => x + x).join('');
  else if (h.length === 8) alpha = true;
  h = parseInt(h, 16);
  return (
    'rgb' +
    (alpha ? 'a' : '') +
    '(' +
    (h >>> (alpha ? 24 : 16)) +
    ', ' +
    ((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) +
    ', ' +
    ((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
    (alpha ? `, ${h & 0x000000ff}` : '') +
    ')'
  );
};

hexToRGB('#27ae60ff'); // 'rgba(39, 174, 96, 255)'
hexToRGB('27ae60'); // 'rgb(39, 174, 96)'
hexToRGB('#fff'); // 'rgb(255, 255, 255)'
```

## Convert HEX To RGB

```js
const hexToRgb = (hex) =>
  hex
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16));

hexToRgb('#00ffff'); // [0, 255, 255]
hexToRgb('#0ff'); // [0, 255, 255]
```

# Components

## quantity button

```html
<div class="d-flex align-items-center qty-container">
    <button class="btn-qty btn-qty-down"> <i class="fas fa-minus"></i> </button>
    <input class="form-qty" type="number" name="quantity" value="1">
    <button class="btn-qty btn-qty-up"> <i class="fas fa-plus"></i> </button>
</div>
```

```scss
.qty-container .btn-qty {
  background: none;
  color: #042825;
  border: 1px solid #ced4da;
  height: 40px;
  width: auto;
  padding: 0 10px;
  font-size: 13px;
  cursor: pointer;
}

.qty-container .btn-qty.btn-qty-up {
  border-radius: 0 3px 3px 0;
}

.qty-container input.form-qty {
  -moz-appearance: textfield;
  height: 40px;
  border: none;
    border-top-color: currentcolor;
    border-top-style: none;
    border-top-width: medium;
    border-bottom-color: currentcolor;
    border-bottom-style: none;
    border-bottom-width: medium;
  background: #ffffff;
  text-align: center;
  width: 50px;
  border-top: 1px solid #ced4da;
  border-bottom: 1px solid #ced4da;
  color: #042825;
  vertical-align: middle;
}

.qty-container .btn-qty.btn-qty-down {
  border-radius: 3px 0px 0px 3px;
}
```

```js
let qty_container = document.querySelectorAll('.qty-container');
if(qty_container){
    Array.from(qty_container).forEach(item => {
        let qty_plus = item.querySelector('.btn-qty-up'), 
            qty_minus = item.querySelector('.btn-qty-down'),
            qty_input = item.querySelector('.form-qty');

            qty_minus.onclick = function(){
                if(qty_input.value > 1){
                    qty_input.value = parseInt(qty_input.value, 10) - 1;
                }
            }

            qty_plus.onclick = function(){
                if(qty_input.value >= 1){
                    qty_input.value = parseInt(qty_input.value, 10) + 1;
                }
            }
    });
}
```

## Date Counter

```js
// Targeted date
const countDownDate = new Date('Jun 2, 2025 23:59:59').getTime();

// Update the count down every 1 second
let x = setInterval(function () {
  // Get current date and time
  let now = new Date().getTime();

  // Time to the date
  let timeToDate = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  let days = Math.floor(timeToDate / (1000 * 60 * 60 * 24)),
    hours = Math.floor((timeToDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes = Math.floor((timeToDate % (1000 * 60 * 60)) / (1000 * 60)),
    seconds = Math.floor((timeToDate % (1000 * 60)) / 1000);

  // Display the result in the element with id="counter"
  document.getElementById('counter').innerHTML =
    days +
    '<small>d</small> ' +
    hours +
    '<small>h</small> ' +
    minutes +
    '<small>m</small> ' +
    seconds +
    '<small>s</small> ';
  // If the countdown is finished, display a message
  if (timeToDate < 0) {
    clearInterval(x);
    document.getElementById('counter').innerHTML = 'Countdown finished';
  }
}, 1000);
```

```html
<div id="counter"></div>
```

## text writer effect

```html
<div class="my-3" id="text_effect">
    <div class="form-group my-3">
        <label for="exampleFormControlTextarea1">write your text</label>
        <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
        <div class="small text-right mt-1">letter <span class="letter_left">0</span></div>
        <button class="btn btn-primary mt-3 done" disabled>Done</button>
    </div>
    <div class="output"></div>
</div>
```

```js
let text_area_input = document.querySelector('#text_effect textarea'), i=0;
let done_btn = document.querySelector('#text_effect .done'), output_write = document.querySelector('#text_effect .output');
text_area_input.oninput = function () {
    document.querySelector('#text_effect .letter_left').textContent = text_area_input.value.length ;
    if(text_area_input.value.length > 0){
        done_btn.disabled = false
    }else {
        done_btn.disabled = true
    }
}
done_btn.onclick = function(){
    text_area_input.disabled = true;
    done_btn.disabled = true
    output_write.textContent = '';
    let text_writer_interval = setInterval(() => {
        if (i > text_area_input.value.length - 1) {
            clearInterval(text_writer_interval);
            text_area_input.disabled = false;
            done_btn.disabled = false
            i = 0;
        }else {
            output_write.textContent += text_area_input.value[i];
            i++;
        }
    }, 100);
}
```

## close button

```html
<div class="section-close-button my-5 py-5">
    <div class="bg-light close-button transition cursor-pointer">
        <div class="bar transition bg-primary mb-2" style="height: 3px;width: 40px;"></div>
        <div class="bar transition bg-warning mb-2" style="height: 3px;width: 40px;"></div>
        <div class="bar transition bg-danger mb-2" style="height: 3px;width: 40px;"></div>
    </div>
</div>
```

```css
.section-close-button {
  width: 50px;
}
.section-close-button .close-button div:first-of-type.transform {
  transform: rotate(-45deg) translate(-10px, 10px);
}
.section-close-button .close-button div:nth-of-type(2).transform {
  opacity: 0;
}
.section-close-button .close-button div:last-of-type.transform {
  transform: rotate(45deg) translate(-5px, -5px);
}
```

```js
document.querySelector('.section-close-button').onclick = function () {
  document
    .querySelector('.section-close-button .close-button div')
    .classList.toggle('transform');
};
```

## spinner

```html
<div class="section-spinner">
    <div class="spinner position-relative">
        <div class="rounded-circle position-absolute circle"></div>
        <div class="rounded-circle position-absolute circle"></div>
        <div class="rounded-circle position-absolute circle"></div>
    </div>
</div>
```

```css
.section-spinner{
    height: 100px;
}
.section-spinner .spinner .circle {
  animation: rotate-spinner 0.2s linear infinite;
  -webkit-animation: rotate-spinner 0.2s linear infinite;
  border: 5px solid transparent;
}
.section-spinner .spinner .circle:first-of-type {
  border-top-color: dodgerblue;
  height: 50px;
  width: 50px;
  top: 50px;
  left: 50px;
  animation-duration: 0.85s;
}

.section-spinner .spinner .circle:nth-of-type(2) {
  border-top-color: lawngreen;
  height: 75px;
  width: 75px;
  top: 38px;
  animation-duration: 0.95s;
  left: 38px;
}
.section-spinner .spinner .circle:last-of-type {
  border-top-color: darkorange;
  animation-duration: 1.05s;
  height: 100px;
  width: 100px;
  top: 25px;
  left: 25px;
}

@keyframes rotate-spinner {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## input effect

```html
<div class="section-input-effect">
    <div class="position-relative">
        <input type="text" class="form-control effect" id="input-name-1" required>
        <label for="input-name-1">user name</label>
    </div>
</div>
```

```css
.section-input-effect .effect ~ label {
  position: absolute;
  left: 14px;
  width: 100%;
  pointer-events: none;
  top: 8px;
  font-size: 1rem;
  color: #aaa;
  transition: 0.3s;
}
.section-input-effect .effect:focus ~ label,
.section-input-effect .has-content.effect ~ label {
  top: -30px;
  left: 0;
  /* font-size: 0.9rem; */
  font-weight: 400;
  color: #212529;
  transition: 0.3s;
}
```

```js
$('.section-input-effect input.effect').focusout(function () {
    if ($(this).val() != '') {
        $(this).addClass('has-content');
    } else {
        $(this).removeClass('has-content');
    }
});
```

## Custom cursor (cursor follow)

```scss
.cursor,
.follow {
 position: absolute;
 pointer-events: none;
 width: 0.4rem;
 height: 0.4rem;
 transform: translate(-50%, -50%);
}

.cursor {
 padding: 0.1rem;
 background: black;
 border-radius: 50%;
}

@keyframes pulse {
 0% {
  opacity: 1;
  padding: 0.5rem;
 }

 100% {
  opacity: 0;
  padding: 1rem;
 }
}

.follow {
 padding: 0.5rem;
 border: 0.1rem solid black;
 transition: all 0.3s ease-out;
 border-radius: 100%;
 animation: pulse 1s infinite;
}
```

```js
document.body.style.cursor = "none";

let cursor = document.createElement("div"),
  follow = document.createElement("div");

cursor.classList.add("cursor");
follow.classList.add("follow");

document.body.appendChild(cursor);
document.body.appendChild(follow);

function move(obj, e) {
  obj.style = "";
  obj.style.top = e.clientY + "px";
  obj.style.left = e.clientX + "px";
}

if (cursor) {
  window.addEventListener("mousemove", function (event) {
    let e = event,
      t = e.target,
      f = follow,
      c = cursor;

    move(c, e);
    move(f, e);
  });
}
```

## Resize an image

```html
<!-- Assume that we want to resize an image to a given number of percentages. The image can be determined from a file input: -->
<input type="file" id="upload" />;
```

```js
const image = document.getElementById('upload').files[0];

// The following function scales an image file to ratio of percentages:
const resize = function (image, ratio) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        // Read the file
        reader.readAsDataURL(image);

        // Manage the `load` event
        reader.addEventListener('load', function (e) {
            // Create new image element
            const ele = new Image();
            ele.addEventListener('load', function () {
                // Create new canvas
                const canvas = document.createElement('canvas');

                // Draw the image that is scaled to `ratio`
                const context = canvas.getContext('2d');
                const w = ele.width * ratio;
                const h = ele.height * ratio;
                canvas.width = w;
                canvas.height = h;
                context.drawImage(ele, 0, 0, w, h);

                // Get the data of resized image
                'toBlob' in canvas
                    ? canvas.toBlob(function (blob) {
                          resolve(blob);
                      })
                    : resolve(dataUrlToBlob(canvas.toDataURL()));
            });

            // Set the source
            ele.src = e.target.result;
        });

        reader.addEventListener('error', function (e) {
            reject();
        });
    });
};

// In the sample code above, after drawing a new image, we have to check if the current browser supports the canvas' toBlob method. If not, we have to get the data URL from canvas.toDataURL() first, and then use the following function to convert it to a Blob:
const dataUrlToBlob = function (url) {
    const arr = url.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const str = atob(arr[1]);
    let length = str.length;
    const uintArr = new Uint8Array(length);
    while (length--) {
        uintArr[length] = str.charCodeAt(length);
    }
    return new Blob([uintArr], { type: mime });
};

// As soon as we have the Blob of the resized image, we can preview it on the front-end or send it to the back-end as a part of FormData:
// Resize image to 50%
resize(image, 0.5).then(function (blob) {
    // Preview
    // Assume that `previewEle` represents the preview image element
    previewEle.src = URL.createObjectURL(blob);
});


```

## Toggle password visibility

```html
<input type="password" id="password" />

<button id="toggle">Toggle</button>
```

```js
const passwordEle = document.getElementById('password');

document.getElementById('toggle').addEventListener('click', function () {
  const type = passwordEle.getAttribute('type');

  passwordEle.setAttribute('type', type === 'password' ? 'text' : 'password');
});
```

## scroll info element on click

```js
Array.from(document.querySelectorAll('#drop-menu a')).forEach((link) => {
  link.onclick = function(e){
    e.preventDefault();
    const href = e.target.getAttribute('href'),
      id = href.substr(1),
      target = document.getElementById(id);
      if(target){
        window.scrollBy({
          top: target.getBoundingClientRect().top - 200,
          behavior: 'smooth'
        });
      }
  };
});
```

```js
const DURATION = 800;

function scrollToTarget(target) {
  const top = target.getBoundingClientRect().top,
    startPos = window.pageYOffset,
    diff = top;

  let startTime = null,
    requestId;

  function loop(currentTime) {
    if (!startTime) {
      startTime = currentTime;
    }

    // Elapsed time in milliseconds
    const time = currentTime - startTime;

    const percent = Math.min(time / DURATION, 1);
    window.scrollTo(0, startPos + diff * percent);

    if (time < DURATION) {
      // Continue moving
      requestId = window.requestAnimationFrame(loop);
    } else {
      window.cancelAnimationFrame(requestId);
    }
  }

  requestId = window.requestAnimationFrame(loop);
}

const clickHandler = function (e) {
  // Prevent the default action
  e.preventDefault();

  // Get the `href` attribute
  const href = e.target.getAttribute('href');
  const id = href.substr(1);
  const target = document.getElementById(id);

  scrollToTarget(target);
};

[].slice.call(document.querySelectorAll('.navigation__item')).forEach((ele) => {
  ele.addEventListener('click', clickHandler);
});
```

## custom collapse

```html
<div class="custom-collapse-container">
  <button class='custom-collapse-btn'> title </button>
  <div class="custom-collapse-content"> </div>
</div>
```

```scss
.custom-collapse-container .custom-collapse-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
}
```

```js
document.querySelectorAll(".custom-collapse-container").forEach(container => {
  container.querySelector('.custom-collapse-btn').addEventListener("click", function (evt) {
    evt.preventDefault()
    const collapse_content = container.querySelector('.custom-collapse-content');
    if (collapse_content.style.maxHeight) {
      collapse_content.style.maxHeight = null;
    } else {
      collapse_content.style.maxHeight = collapse_content.scrollHeight + "px";
    }
  });
})
```

## Toggle Theme

```html
<button class="theme-change-btn" id='theme-change-btn' role="switch" aria-label="light/dark mode"></button>
```

```scss
.theme-change-btn {
  background-color: gold;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid gold;
  color: #fff;
  cursor: pointer;
}

:root {
  --text-light: hsl(255, 36%, 17%);
  --bg-light: hsl(0, 0%, 100%);
  --shadow-light: 20px 20px 50px hsl(255, 36%, 17%, 0.35),
    -30px -30px 50px hsl(26, 37%, 96%, 0.15);

  --text-dark: hsl(217, 54.2%, 88%);
  --bg-dark: hsl(218, 15.4%, 10.2%);
  --shadow-dark: 20px 20px 50px hsl(255, 36%, 17%, 0.35),
    -30px -30px 50px hsl(26, 37%, 26%, 0.15);
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: var(--text-dark);
    --bg: var(--bg-dark);
    --shadow: var(--shadow-dark);
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --text: var(--text-light);
    --bg: var(--bg-light);
    --shadow: var(--shadow-light);
  }
}

[color-scheme="dark"] {
  --text: var(--text-dark);
  --bg: var(--bg-dark);
  --shadow: var(--shadow-dark);
}

[color-scheme="light"] {
  --text: var(--text-light);
  --bg: var(--bg-light);
  --shadow: var(--shadow-light);
}
body {
  background-color: var(--bg);
}
```

```js
const theme_btn = document.querySelector("#theme-change-btn");

function getCurrentTheme() {
  let theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  localStorage.getItem("theme-color")
    ? (theme = localStorage.getItem("theme-color"))
    : null;
  return theme;
}

function loadTheme(theme) {
  const root = document.querySelector(":root");
  if (theme === "light") {
    theme_btn.textContent = `light`;
  } else {
    theme_btn.textContent = `dark`;
  }
  root.setAttribute("color-scheme", `${theme}`);
}

theme_btn.addEventListener("click", () => {
  let theme = getCurrentTheme();

  theme = theme === "dark" ? "light" : "dark";

  localStorage.setItem("theme-color", `${theme}`);
  loadTheme(theme);
});

window.addEventListener("DOMContentLoaded", () => {
  loadTheme(getCurrentTheme());
});
```

## password length checker

```html
<div id="js-password-input" class="password-input-container">
<input type="password">
<span id="js-show-hide-password" class="show-hide-password-btn">show</span>
</div>

<div id="js-password-strength" class="password-strength-container">
<span id="poor" class="poor-bar"></span>
<span id="weak" class="weak-bar"></span>
<span id="strong" class="strong-bar"></span>
</div>

<div id="js-password-info" class="password-result-message"></div>
```

```scss
.password-input-container {
  width: 30%;
  display: flex;
  position: relative;

  input[type="password"],
  input[type="text"] {
    width: 100%;
    padding: 10px;
    border: 1px solid lightgrey;
    font-size: 15px;
    padding-right: 50px;
  }

  .show-hide-password-btn {
    font-size: 12px;
    font-weight: 600;
    position: absolute;
    color: tomato;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    user-select: none;
  }
}

.password-strength-container {
  width: 30%;
  height: 5px;
  margin: 5px 0;
  display: none;

  span {
    position: relative;
    height: 100%;
    width: 100%;
    background: lightgrey;
    border-radius: 5px;

    &:nth-child(2) {
      margin: 0 3px;
    }

    &.active:before {
      position: absolute;
      content: "";
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border-radius: 5px;
    }

    &.poor-bar:before {
      background-color: #ff4757;
    }

    &.weak-bar:before {
      background-color: orange;
    }

    &.strong-bar:before {
      background-color: #23ad5c;
    }
  }

  .password-result-message {
    font-size: 15px;

    .poor-bar {
      color: red;
    }

    .weak-bar {
      color: orange;
    }

    .strong-bar {
      color: green;
    }
  }
}
```

```js
let password_input = document.querySelector('#js-password-input input[type="password"]'),
    password_strength = document.getElementById('js-password-strength'),
    poor_bar = document.querySelector('#js-password-strength .poor-bar'),
    weak_bar = document.querySelector('#js-password-strength .weak-bar'),
    strong_bar = document.querySelector('#js-password-strength .strong-bar'),
    password_info_message = document.getElementById('js-password-info');


password_input.oninput = function () {

    let poor_password = password_input.value.match(/[a-z]/),
    weak_password = password_input.value.match(/(?=.*?[0-9])/),
    strong_password = password_input.value.match(/(?=.*?[#?!@$%^&*-])/),
    whitespace = password_input.value.match(/^$|\s+/);

    if (password_input.value != "") {

    password_strength.style.display = "block";
    password_strength.style.display = "flex";
    password_info_message.style.display = "block";
    password_info_message.style.color = "black";

    if (whitespace) {
        password_info_message.textContent = "whites paces are not allowed";
    } else {
        check_poor_password(password_input.value.length, poor_password, weak_password, strong_password);
        check_weak_password(password_input.value.length, poor_password, weak_password, strong_password);
        check_strong_password(password_input.value.length, poor_password, weak_password, strong_password);
    }
    } else {
    password_strength.style.display = "none";
    password_info_message.style.display = "none";
    }
}

function check_poor_password(passwordLength, poorPassword, weakPassword, strongPassword) {

    if (passwordLength <= 5 && (poorPassword || weakPassword || strongPassword)) {
    poor_bar.classList.add("active");
    password_info_message.style.display = "block";
    password_info_message.style.color = "red";
    password_info_message.textContent = "Your password is too Poor";

    }
}

function check_weak_password(passwordLength, poorPassword, weakPassword, strongPassword) {
    if (passwordLength >= 8 && poorPassword && (weakPassword || strongPassword)) {
    weak_bar.classList.add("active");
    password_info_message.textContent = "Your password is Weak";
    password_info_message.style.color = "orange";

    } else {
    weak_bar.classList.remove("active");

    }
}

function check_strong_password(passwordLength, poorPassword, weakPassword, strongPassword) {

    if (passwordLength >= 10 && (poorPassword && weakPassword) && strongPassword) {
    poor_bar.classList.add("active");
    weak_bar.classList.add("active");
    strong_bar.classList.add("active");
    password_info_message.textContent = "Your password is strong";
    password_info_message.style.color = "green";
    } else {
    strong_bar.classList.remove("active");

    }
}


document.querySelector('#js-show-hide-password').onclick = function () {
    if (password_input.type == "password") {
    password_input.type = "text";
    this.textContent = "hide";
    } else {
    password_input.type = "password";
    this.textContent = "show";
    }
}
```

# Array

## different between `search` and `indexOf`

with search we can use regular expression but not start position unlike `indexOf` we can use start position but not regular expression

## shuffle array

```js
const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};

// or
const shuffle = (arr) =>
    arr
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value);

// Or
const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());


shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // [9, 1, 10, 6, 8, 5, 2, 3, 7, 4]
```

## Sort an array of numbers

```js
const sort = (arr) => arr.sort((a, b) => a - b);

sort([1, 5, 2, 4, 3]); // [1, 2, 3, 4, 5]
```

## search on array

includes(searchElement, fromIndex)

```js
const array1 = [1, 2, 3];

console.log(array1.includes(2));
// expected output: true
[1, 2, 3].includes(2)         // true
[1, 2, 3].includes(4)         // false
[1, 2, 3].includes(3, 3)      // false
[1, 2, 3].includes(3, -1)     // true
[1, 2, NaN].includes(NaN)     // true
["1", "2", "3"].includes(3)   // false
```

## min & max element on array

```js
Math.max.apply(null,arrayName) // max element on array
Math.maxapply(...arrayName)    // max element on array

Math.min.apply(null,arrayName) // min element on array
Math.minapply(...arrayName)    // min element on array
```

## Check if an array is empty

```js
const isEmpty = (arr) => !Array.isArray(arr) || arr.length === 0;

isEmpty([]); // true
isEmpty([1, 2, 3]); // false
```

## Clone an array

```js
const clone = (arr) => arr.slice(0);

// Or
const clone = (arr) => [...arr];

// Or
const clone = (arr) => Array.from(arr);

// Or
const clone = (arr) => arr.map((x) => x);

// Or
const clone = (arr) => JSON.parse(JSON.stringify(arr));

// Or
const clone = (arr) => arr.concat([]);
```

## Convert an array of strings to numbers

```js
const toNumbers = (arr) => arr.map(Number);

// Or
const toNumbers = (arr) => arr.map((x) => +x);

toNumbers(['2', '3', '4']); // [2, 3, 4]
```

## Count the occurrences of a value in an array

```js
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

// Or
const countOccurrences = (arr, val) => arr.filter((item) => item === val).length;

countOccurrences([2, 1, 3, 3, 2, 3], 2); // 2
countOccurrences(['a', 'b', 'a', 'c', 'a', 'b'], 'a'); // 3
```

## Count the occurrences of array elements

```js
const countOccurrences = (arr) => arr.reduce((prev, curr) => ((prev[curr] = ++prev[curr] || 1), prev), {});

countOccurrences([2, 1, 3, 3, 2, 3]); // { '1': 1, '2': 2, '3': 3 }
countOccurrences(['a', 'b', 'a', 'c', 'a', 'b']); // { 'a': 3, 'b': 2, 'c': 1 }
```

## Create an array of numbers in the given range

```js
const range = (min, max) => [...Array(max - min + 1).keys()].map((i) => i + min);

// Or
const range = (min, max) =>
    Array(max - min + 1)
        .fill(0)
        .map((_, i) => min + i);

// Or
const range = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

range(5, 10); // [5, 6, 7, 8, 9, 10]
```

## Generate an array of alphabet characters

```js
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Or
const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];

// Or
const alphabet = Array(26)
    .fill(0)
    .map((_, i) => String.fromCharCode(i + 97));

// Or
const alphabet = [...Array(26).keys()].map((i) => String.fromCharCode(i + 97));

// Or
const alphabet = [...Array(26)].map((_, i) => (i + 10).toString(36));

// Or
const alphabet = String.fromCharCode(
    ...' '
        .repeat(26)
        .split('')
        .map((_, i) => i + 97)
).split('');
```

## Get indices of a value in an array

```js
const indices = (arr, value) => arr.reduce((acc, v, i) => (v === value ? [...acc, i] : acc), []);

// Or
const indices = (arr, value) => arr.map((v, i) => (v === value ? i : false)).filter(Boolean);

indices(['h', 'e', 'l', 'l', 'o'], 'l'); // [2, 3]
indices(['h', 'e', 'l', 'l', 'o'], 'w'); // []
```

## Get the average of an array

```js
const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
```

## Flatten an array

```js
const flat = (arr) =>
    [].concat.apply(
        [],
        arr.map((a) => (Array.isArray(a) ? flat(a) : a))
    );

// Or
const flat = (arr) => arr.reduce((a, b) => (Array.isArray(b) ? [...a, ...flat(b)] : [...a, b]), []);

// Or
// See the browser compatibility at https://caniuse.com/#feat=array-flat
const flat = (arr) => arr.flat();
```

## Get the intersection of arrays

```js
const getIntersection = (a, ...arr) => [...new Set(a)].filter((v) => arr.every((b) => b.includes(v)));

getIntersection([1, 2, 3], [2, 3, 4, 5]); // [2, 3]
getIntersection([1, 2, 3], [2, 3, 4, 5], [1, 3, 5]); // [3]

const intersection = (arr, ...args) =>
  arr.filter(item => args.every(arr => arr.includes(item)))
intersection([2, 1], [2, 3])  // => [2]
```

## Get union of arrays

```js
const union = (...arr) => [...new Set(arr.flat())];
```

## Get the sum of an array of numbers

```js
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
```

## Get the unique values of an array

```js
const unique = (arr) => [...new Set(arr)];

// Or
const unique = (arr) => arr.filter((el, i, array) => array.indexOf(el) === i);

// Or
const unique = (arr) => arr.reduce((acc, el) => (acc.includes(el) ? acc : [...acc, el]), []);
```

## Merge two arrays

```js
// Merge but don't remove the duplications
const merge = (a, b) => a.concat(b);
const merge = (a, b) => [].concat(a, b);
// Or
const merge = (a, b) => [...a, ...b];

// Merge and remove the duplications
const merge = (a, b) => [...new Set(a.concat(b))];
// Or
const merge = (a, b) => [...new Set([...a, ...b])];
```

## Remove duplicate values in an array

```js
const removeDuplicate = (arr) => arr.filter((i) => arr.indexOf(i) === arr.lastIndexOf(i));

removeDuplicate(['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']); //  ['h', 'e', 'w', 'r', 'd']
```

# Date

## Format Duration (Millisecond)

```js
const formatDuration = ms => {
  if (ms < 0) ms = -ms;
  const time = {
    day: Math.floor(ms / 86400000),
    hour: Math.floor(ms / 3600000) % 24,
    minute: Math.floor(ms / 60000) % 60,
    second: Math.floor(ms / 1000) % 60,
    millisecond: Math.floor(ms) % 1000
  };
  return Object.entries(time)
    .filter(val => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
    .join(', ');
};

formatDuration(1001); // '1 second, 1 millisecond'
formatDuration(34325055574);
// '397 days, 6 hours, 44 minutes, 15 seconds, 574 milliseconds'
```

## format seconds

```js
const formatSeconds = s => {
  const [hour, minute, second, sign] =
    s > 0
      ? [s / 3600, (s / 60) % 60, s % 60, '']
      : [-s / 3600, (-s / 60) % 60, -s % 60, '-'];

  return (
    sign +
    [hour, minute, second]
      .map(v => `${Math.floor(v)}`.padStart(2, '0'))
      .join(':')
  );
};

formatSeconds(200); // '00:03:20'
formatSeconds(-200); // '-00:03:20'
formatSeconds(99999); // '27:46:39'
```

## Calculate the number of difference days between two dates

```js
const diffDays = (date, otherDate) => Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));

diffDays(new Date('2014-12-19'), new Date('2020-01-01')); // 1839
```

## Calculate the number of months between two dates

```js
const monthDiff = (startDate, endDate) => Math.max(0, (endDate.getFullYear() - startDate.getFullYear()) * 12 - startDate.getMonth() + endDate.getMonth());

monthDiff(new Date('2020-01-01'), new Date('2021-01-01')); // 12
```

## Convert a date to `YYYY-MM-DD` format

```js
// `date` is a `Date` object
const formatYmd = (date) => date.toISOString().slice(0, 10);

formatYmd(new Date()); // 2020-05-06
```

## Convert seconds `to hh:mm:ss` format

```js
// `s` is number of seconds
const formatSeconds = (s) => new Date(s * 1000).toISOString().substr(11, 8);

// Or
const formatSeconds = (s) => new Date(s * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];

// Or
const formatSeconds = (s) => [parseInt(s / 60 / 60), parseInt((s / 60) % 60), parseInt(s % 60)].join(':').replace(/\b(\d)\b/g, '0$1');

formatSeconds(200); // 00:03:20
formatSeconds(500); // 00:08:20
```

## Extract year, month, day, hour, minute, second and millisecond from a date

```js
// `date` is a `Date` object
const extract = (date) =>
    date
        .toISOString()
        .split(/[^0-9]/)
        .slice(0, -1);

// `extract` is an array of [year, month, day, hour, minute, second, millisecond]
```

## Get the current quarter of a date

```js
const getQuarter = (d = new Date()) => Math.ceil((d.getMonth() + 1) / 3);
```

## Get the tomorrow date

```js
const tomorrow = ((d) => new Date(d.setDate(d.getDate() + 1)))(new Date());

// Or
const tomorrow = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24);
```

## Get the yesterday date

```js
const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());

// Or
const yesterday = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24);
```

## Check if a date is between two dates

```js
// `min`, `max` and `date` are `Date` instances
const isBetween = (date, min, max) => date.getTime() >= min.getTime() && date.getTime() <= max.getTime();
```

## Check if a date is today

```js
// `date` is a Date object
const isToday = (date) => date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
```

# Function

## Create one time event handler

```js
const handler = (e) => {
  // Do something ...
  element.removeEventListener('click', handler);
};
element.addEventListener('click', handler);

// OR
const handler = function (e) {
    // The event handler
    // Do something ...

    // Remove the handler
    e.target.removeEventListener(e.type, handler);
};

ele.addEventListener('event-name', handler);
```

## Create Your Own Query Selector Shorthand

```js
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const mainContent = $('.main-content');
const externalLinks = $$('a[target="_blank"]');
```

## Prevent User From Leaving Page

```js
window.onbeforeunload = function(e) {
  window.open(document.URL,"_blank");
  return 'Dialog text here.';
};
```

## Execute a function once

```js
const once = (fn) =>
    (
        (ran = false) =>
        () =>
            ran ? fn : ((ran = !ran), (fn = fn()))
    )();
```

## Convert URL parameters to object

```js
const getUrlParams = (query) => Array.from(new URLSearchParams(query)).reduce((p, [k, v]) => Object.assign({}, p, { [k]: p[k] ? (Array.isArray(p[k]) ? p[k] : [p[k]]).concat(v) : v }), {});


getUrlParams(location.search); // Get the parameters of the current URL
getUrlParams('foo=Foo&bar=Bar'); // { foo: "Foo", bar: "Bar" }

// Duplicate key
getUrlParams('foo=Foo&foo=Fuzz&bar=Bar'); // { foo: ["Foo", "Fuzz"], bar: "Bar" }
```

## Check if an element is in the viewport

```js
const isInViewport = function (ele) {
    const rect = ele.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};
```

## Press Shift and Enter for a new line

```html
<textarea id="message"></textarea>
```

```js
const ele = document.getElementById('message');

ele.addEventListener('keydown', function (e) {
    // Get the code of pressed key
    const keyCode = e.which || e.keyCode;

    // 13 represents the Enter key
    if (keyCode === 13 && !e.shiftKey) {
        // Don't generate a new line
        e.preventDefault();

        // Do something else such as send the message to back-end
        // ...
    }
});
```

## Get type of a variable in string

```js
const getTypeOf = (obj) => Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1];


getTypeOf('hello world'); // String
getTypeOf(1000); // Number
getTypeOf(Infinity); // Number
getTypeOf(true); // Boolean
getTypeOf(Symbol()); // Symbol
getTypeOf(null); // Null
getTypeOf(undefined); // Undefined
getTypeOf({}); // Object
getTypeOf([]); // Array
getTypeOf(/[a-z]/g); // RegExp
getTypeOf(new Date(2021)); // Date
getTypeOf(new Error()); // Error
getTypeOf(function () {}); // Function
getTypeOf((a, b) => a + b); // Function
getTypeOf(async () => {}); // AsyncFunction
getTypeOf(document); // HTMLDocument
```

## check specified type

```js
// isObject
const isObject = a => a instanceof Object
// isArray
Array.isArray([1, 2, 3])
//  isBoolean
const isBoolean = arg => arg === !!arg
//  isDate
const isDate = d => d instanceof Date && !isNaN(d)
// isFinite
Number.isFinite(3)
isFinite(3)
// isInteger
Number.isInteger(3)
// isNaN
Number.isNaN(NaN)
isNaN(3)
// isNull
const isNull = val => val === null
// isNumber
const isNumber = a => typeof a === 'number'
// isString
const isString = a => typeof a === 'string'
```

## Logical xor operator

```js
// returns `true` if one of the arguments is truthy and the other is falsy

const xor = (a, b) => (a && !b) || (!a && b);

// Or
const xor = (a, b) => !(!a && !b) && !(a && b);

// Or
const xor = (a, b) => Boolean(!a ^ !b);
```

## English Digits To Arabic Digits

```js
function toIndiaDigits (num) {
  let id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, function (w) {
    return id[+w]
  });
}
```

## Copy text to the clipboard

```js
const copyToClipboard = (str) => {
  const textarea = document.createElement('textarea');
  textarea.value = str;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

// OR
// Create a fake textarea
const textAreaEle = document.createElement('textarea');

// Reset styles
textAreaEle.style.border = '0';
textAreaEle.style.padding = '0';
textAreaEle.style.margin = '0';

// Set the absolute position
// User won't see the element
textAreaEle.style.position = 'absolute';
textAreaEle.style.left = '-9999px';
textAreaEle.style.top = `${document.documentElement.scrollTop}px`;

// Set the value
textAreaEle.value = text;

// Append the textarea to body
document.body.appendChild(textAreaEle);

// Focus and select the text
textAreaEle.focus();
textAreaEle.select();

// Execute the "copy" command
try {
    document.execCommand('copy');
} catch (err) {
    // Unable to copy
} finally {
    // Remove the textarea
    document.body.removeChild(textAreaEle);
}
```

## Detect if the caps lock is on

```js
<input type="text" id="textbox" />
<div id="message" />
```

```js
// 1.Use the getModifierState() function
// The getModifierState() function returns the state of given modifier key. It can let us know if the CapsLock key is pressed by calling getModifierState('CapsLock') from the event object.
const textboxEle = document.getElementById('textbox');
const messageEle = document.getElementById('message');

textboxEle.addEventListener('keydown', function (e) {
    const capsLockOn = e.getModifierState('CapsLock');

    // Update the content of message
    messageEle.innerHTML = capsLockOn ? 'Caps lock is ON' : '';

    // Show or hide the message based on the CapsLock state
    messageEle.style.display = capsLockOn ? 'block' : 'none';
});

// 2. Support the Shift key
// The caps lock is treated as ON if users press
// an uppercase letter without Shift
// or an lowercase letter with Shift

const textboxEle = document.getElementById('textbox');
const messageEle = document.getElementById('message');

textboxEle.addEventListener('keypress', function (e) {
    const isMac = /Mac/.test(navigator.platform);

    const keyCode = e.keyCode || e.which;

    // Is the _Shift_ key pressed?
    const shiftKey = e.shiftKey || keyCode === 16;

    // Get the pressed character
    const s = String.fromCharCode(keyCode);
    const capsLockOn =
        (s.toUpperCase() === s && s.toLowerCase() !== s && !(shiftKey && isMac)) ||
        (s.toUpperCase() !== s && s.toLowerCase() === s && shiftKey);

    messageEle.innerHTML = capsLockOn ? 'Caps lock is ON' : '';
    messageEle.style.display = capsLockOn ? 'block' : 'none';
});
```

## Mouse Position

```js
window.addEventListener("mousemove", function(e){
  console.log("Mouse position: Y " + e.clientY, ", X " + e.clientY, );
});
```

## Offline Online Network

```js
window.addEventListener('online', ()=> console.log("online"));
window.addEventListener('offline', ()=> console.log("offline"));
```

## Check Internet

```js
navigator.onLine    // false || true
```

## Swap two variables

```js
[a, b] = [b, a];

// Or
a = [b, (b = a)][0];

// Or
a = ((x) => x)(b, (b = a));

// Or
// (only works with numbers)
a = b + ((b = a), 0);

a = b * ((b = a), 1);
```

## Serialize form data into a query string

```js
const serialize = function (formEle) {
    // Get all fields
    const fields = [].slice.call(formEle.elements, 0);

    return fields
        .map(function (ele) {
            const name = ele.name;
            const type = ele.type;

            // We ignore
            // - field that doesn't have a name
            // - disabled field
            // - `file` input
            // - unselected checkbox/radio
            if (!name || ele.disabled || type === 'file' || (/(checkbox|radio)/.test(type) && !ele.checked)) {
                return '';
            }

            // Multiple select
            if (type === 'select-multiple') {
                return ele.options
                    .map(function (opt) {
                        return opt.selected ? `${encodeURIComponent(name)}=${encodeURIComponent(opt.value)}` : '';
                    })
                    .filter(function (item) {
                        return item;
                    })
                    .join('&');
            }

            return `${encodeURIComponent(name)}=${encodeURIComponent(ele.value)}`;
        })
        .filter(function (item) {
            return item;
        })
        .join('&');
};
```

## Display a readable size(format File Size)

```js
const formatFileSize = function (bytes) {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
};
```

## Detect clicks outside of an element

```js
document.addEventListener('click', function (evt) {
    const isClickedOutside = !ele.contains(evt.target);

    // `isClickedOutside` is true if the clicked target is outside of `ele`
});
```

## Count the number of characters of a textarea

```html
<textarea id="message"></textarea>
<div id="counter"></div>
```

```js
const messageEle = document.getElementById('message');
const counterEle = document.getElementById('counter');

messageEle.addEventListener('input', function (e) {
    const target = e.target;

    // Get the `maxlength` attribute
    const maxLength = target.getAttribute('maxlength');

    // Count the current number of characters
    const currentLength = target.value.length;

    counterEle.innerHTML = `${currentLength}/${maxLength}`;
});
```

## Check if an element has given class

```js
ele.classList.contains('class-name');
```

## Check if an element is scrollable

```js
// The following function returns true if the ele element is scrollable.
const isScrollable = function (ele) {
    // Compare the height to see if the element has scrollable content
    const hasScrollableContent = ele.scrollHeight > ele.clientHeight;

    // It's not enough because the element's `overflow-y` style can be set as
    // * `hidden`
    // * `hidden !important`
    // In those cases, the scrollbar isn't shown
    const overflowYStyle = window.getComputedStyle(ele).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

    return hasScrollableContent && !isOverflowHidden;
};
```

## Show a loading indicator when an iframe is being loaded

```html
<div class="container">
    <div class="loading" id="loading">Loading</div>
    <iframe id="frame" style="opacity: 0"></iframe>
</div>
```

```scss
.container {
    /* To position the loading */
    position: relative;
}

.loading {
    /* Absolute position */
    left: 0;
    position: absolute;
    top: 0;

    /* Take full size */
    height: 100%;
    width: 100%;

    /* Center */
    align-items: center;
    display: flex;
    justify-content: center;
}
```

```js
const iframeEle = document.getElementById('iframe');
const loadingEle = document.getElementById('loading');

iframeEle.addEventListener('load', function () {
    // Hide the loading indicator
    loadingEle.style.display = 'none';

    // Bring the iframe back
    iframeEle.style.opacity = 1;
});
```

# Random

## Generate a random boolean

```js
const randomBoolean = () => Math.random() >= 0.5;
```

## Generate a random floating point number in given range

```js
const randomFloat = (min, max) => Math.random() * (max - min) + min;
```

## Generate a random integer in given range

```js
const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
```

## Generate a random hex color

```js
const randomColor = () => `#${Math.random().toString(16).slice(2, 8).padEnd(6, '0')}`;

// Or
const randomColor = () => `#${(~~(Math.random() * (1 << 24))).toString(16)}`;
```

## Generate an array of random integers in a given range

```js
randomArrayInRange(1, 100, 10); // [11, 82, 41, 35, 76, 83, 43, 15, 60, 54]
```

## Get a random item from an array

```js
const randomItem = (arr) => arr[(Math.random() * arr.length) | 0];
```

## Get random items of an array

```js
const randomItems = (arr, count) => arr.concat().reduce((p, _, __, arr) => (p[0] < count ? [p[0] + 1, p[1].concat(arr.splice((Math.random() * arr.length) | 0, 1))] : p), [0, []])[1];


randomItems([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3); // [4, 8, 5]
randomItems(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 4); // ['e', 'c', 'h', 'j']
```

# String

## Convert a letter to associate emoji

```js
const letterToEmoji = (c) => String.fromCodePoint(c.toLowerCase().charCodeAt(0) + 127365);


letterToEmoji('a'); // 🇦
letterToEmoji('b'); // 🇧
```

## Convert a string to URL slug

```js
const slugify = (str) =>
    str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');


slugify('Chapter One: Once upon a time...'); // 'chapter-one-once-upon-a-time'
```

## Count the number of words in a string

```js
const countWords = (str) => str.trim().split(/\s+/).length;


countWords('Hello World'); // 2
countWords('Hello    World'); // 2
countWords('  Hello  World  '); // 2
```

## Get the number of a character in a string

```js
const characterCount = (str, char) => str.split(char).length - 1;

// Or
const characterCount = (str, char) => str.replace(new RegExp(String.raw`[^${char}]`, 'g'), '').length;


characterCount('192.168.1.1', '.'); // 3
characterCount('star wars', 's'); // 2
```

## Reverse a string

```js
const reverse = (str) => str.split('').reverse().join('');

// Or
const reverse = (str) => [...str].reverse().join('');

// Or
const reverse = (str) => str.split('').reduce((rev, char) => `${char}${rev}`, '');

// Or
const reverse = (str) => (str === '' ? '' : `${reverse(str.substr(1))}${str.charAt(0)}`);
```

## Truncate a string at full words

```js
const truncate = (str, max, suffix) => (str.length < max ? str : `${str.substr(0, str.substr(0, max - suffix.length).lastIndexOf(' '))}${suffix}`);

truncate('This is a long message', 20, '...'); // 'This is a long...'
```

## capitalize

```js
const capitalize = str =>
  `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`

capitalize('FRED')  // => 'Fred'
```

# Numbers

## Check if a given integer is a prime number

```js
const isPrime = (n) =>
    n > 1 &&
    Array(Math.floor(Math.sqrt(n)) - 1)
        .fill(0)
        .map((_, i) => i + 2)
        .every((i) => n % i !== 0);
```

## Check if a number is negative

```js
const isNegative = (n) => Math.sign(n) === -1;

// Or
const isNegative = (n) => n < 0;
```

## Check if a number is positive

```js
const isPositive = (n) => Math.sign(n) === 1;
```

## Check if a number is odd

```js
const isOdd = (n) => n % 2 !== 0;

// Or
const isOdd = (n) => !!(n & 1);

// Or
const isOdd = (n) => !Number.isInteger(n / 2);
```

# API

## Custom axios

```js
// a file called axios and import it
const axios = {
  get(url) {
    return fetch(url)
      .then(res => res.json())
      .then(d => ({ data: d }));
  }
}

export { axios };
```

## Upload files with Ajax

```html
<input type="file" id="upload" multiple />
```

```js
function upload(fileEle, backendUrl) {
  return new Promise(function (resolve, reject) {
    // Get the list of selected files
    const files = fileEle.files;

    // Create a new FormData
    const formData = new FormData();

    // Loop over the files
    [].forEach.call(files, function (file) {
      formData.append(fileEle.name, file, file.name);
    });

    // Create new Ajax request
    const req = new XMLHttpRequest();
    req.open('POST', backendUrl, true);

    // Handle the events
    req.onload = function () {
      if (req.status >= 200 && req.status < 400) {
        resolve(req.responseText);
      }
    };
    req.onerror = function () {
      reject();
    };

    // Send it
    req.send(formData);
  });
}

// usage
const fileEle = document.getElementById('upload');

upload(fileEle, '/path/to/back-end').then(function(response) {
    // `response` is what we got from the back-end
    // We can parse it if the server returns a JSON
    const data = JSON.parse(response);
});
```

## Submit a form with Ajax

```js
const submit = function (formEle) {
    return new Promise(function (resolve, reject) {
        // Serialize form data
        // See https://htmldom.dev/serialize-form-data-into-a-query-string
        const params = serialize(formEle);

        // Create new Ajax request
        const req = new XMLHttpRequest();
        req.open('POST', formEle.action, true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        // Handle the events
        req.onload = function () {
            if (req.status >= 200 && req.status < 400) {
                resolve(req.responseText);
            }
        };
        req.onerror = function () {
            reject();
        };

        // Send it
        req.send(params);
    });
};

// Usage
const formEle = document.getElementById(...);

submit(formEle).then(function(response) {
    // `response` is what we got from the back-end
    // We can parse it if the server returns a JSON
    const data = JSON.parse(response);
    ...
});
```

# Style

## Set CSS style for an element

```js
ele.style.backgroundColor = 'red';
ele.style['backgroundColor'] = 'red';
ele.style['background-color'] = 'red';

// Add new style
el.style.cssText += 'background-color: red; color: white';
// Ignore previous styles
el.style.cssText = 'background-color: red; color: white';

// Remove a CSS style
ele.style.removeProperty('background-color');
```

# RegExp (Regular Expression)

## Password Pattern

```js
// Password (UpperCase, LowerCase, Number/SpecialChar and min 8 Chars
(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$
```

## Email Pattern

```js
(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
```

# Temperature

## Convert Celsius to Fahrenheit

```js
const celsiusToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;
```

## Convert Fahrenheit to Celsius

```js
const fahrenheitToCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

fahrenheitToCelsius(59); // 15
fahrenheitToCelsius(32); // 0
```

# MAC OS (Iphone)

## Detect macOS browser 🤑

```js
const isMacBrowser = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
```

# Mobiles

## Detect mobile browsers

```js
const isMobile = function () {
    const match = window.matchMedia('(pointer:coarse)');
    return match && match.matches;
};
```

# Front-end Tips

## Always pass the radix to parseInt

```js
parseInt('50', 10); // 50
```

## Always use `noopener` or `noreferrer` for links opened in new tabs

```js
window.opener.location = 'http://fake.website.here';
```

```html
<!-- Don't -->
<a target="_blank">...</a>

<!-- Do -->
<a target="_blank" rel="noopener">...</a>

<!-- Or -->
<a target="_blank" rel="noreferrer">...</a>
<a target="_blank" rel="noopener noreferrer">...</a>
```

## some rule while coding JS

- `variable` and `function` are in **camelCase**
- `global` and `constant` are in **UPPERCASE**
- `filename` are in **lowercase**
- make `space` between **separator** like `+, - ...`
- short statement can be in one line
- `let i, len = arr.length;` best in performance than `for(i=0; i< len; i++)`
- avoid using `new` word it's bad in performance
- if we using `html` element more it's better put it into variable like `let`, `var` it effect on performance
- `onload`, `onunload` ues to deal with cookie and browser type
- there are two type of event
  - bubbling propagation(default)
  - capturing propagation
- `selector.addEventListener('event', function, false|true)` by default `false` which mean we are using bubbling propagation
- use try & catch

  ```js
  try{
    throw 'any data type';
  }
  catch (er){
    er.message;
  }
  finally{
    'code execute after try/catch' ;
  }
  ```

# you might not need

## lodash

## compact

Creates an array with all falsey values removed. The values `false`, `null`, `0`, `""`, `undefined`, and `NaN` are falsey.

```js
// lodash
import { compact } from 'lodash'
compact([0, 1, 2])  // => [1, 2]

// plain js
[0, 1, 2].filter(x => !!x)  // => [1, 2]
```

## difference

Creates an array of array values not included in the other given arrays.

```js
let arr_1 = [2, 1], arr_2 = [2, 3];
// lodash
import { difference } from 'lodash'
difference(arr_1, arr_2)  // => [1]

// plain js
arr_1.filter(x => !arr_2.includes(x)) // => [1]
```

## size (powerful length)

Gets the size of collection by returning its length for array-like values or the number of own enumerable string keyed properties for objects.

```js
// lodash
import { size } from 'lodash'
size([1, 2, 3]) // => 3
size({ a: 1, b: 2 })  // => 2
size('pebbles') // => 7

// plain js
const size = item =>
  item.constructor === Object ? Object.keys(item).length : item.length
size([1, 2, 3]) // => 3
size({ a: 1, b: 2 })  // => 2
size('pebbles') // => 7
```

## union

Creates an array of unique values, in order, from all given arrays.

```js
// lodash
import { union } from 'lodash'
union([2], [1, 2], [1, 2])  // => [2, 1]

// plain js
const union = (arr, ...args) => [...new Set(arr.concat(...args))]
union([2], [1, 2], [1, 2])  // => [2, 1]
```

## uniq

Creates a duplicate-free version of an array, in which only the first occurrence of each element is kept. The order of result values is determined by the order they occur in the array.

```js
// lodash
import { uniq } from 'lodash'
uniq([2, 1, 2]) // => [2, 1]

// plain js
[...new Set([2, 1, 2])] // => [2, 1]
```

# Advanced Examples

- <https://htmldom.dev/drag-and-drop-table-row/>
- <https://htmldom.dev/drag-and-drop-table-column/>
- <https://htmldom.dev/drag-and-drop-element-in-a-list/>
- <https://htmldom.dev/drag-to-scroll/>
- <https://htmldom.dev/create-a-custom-scrollbar/>
- <https://htmldom.dev/create-a-range-slider/>
- <https://htmldom.dev/create-an-image-comparison-slider/>
- <https://htmldom.dev/create-resizable-split-views/>
- <https://htmldom.dev/make-a-draggable-element/>
- <https://htmldom.dev/make-a-resizable-element/>
- <https://htmldom.dev/resize-the-width-of-a-text-box-to-fit-its-content-automatically/>
- <https://htmldom.dev/print-an-image/>
- <https://htmldom.dev/paste-as-plain-text/>
- [Custom Right-Click (Context) Menu](https://codepen.io/knyttneve/pen/YzxEBew)
- <https://htmldom.dev/paste-an-image-from-the-clipboard/>
- <https://htmldom.dev/highlight-an-element-when-dragging-a-file-over-it/>
- <https://htmldom.dev/allow-to-enter-particular-characters-only/>
- <https://htmldom.dev/show-a-custom-context-menu-at-clicked-position/>
- <https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications>
- <https://github.com/lukehoban/es6features>
- <https://dev.to/afzalimamias/add-tags-input-box-in-html-css-javascript-3i12>
