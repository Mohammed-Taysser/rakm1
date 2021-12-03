# html tricks

## resources

- <https://shortcode.dev/html-cheatsheet>

## block search engine crawlers

```html
<meta name="robots" content="noindex">
```

## html entity codes

```html
1. &amp; 2. &lt; 3. &gt; 4. &laquo; 5. &raquo; 6. &copy; 7. &reg;  8. &trade; 9. &pound; 10. &euro;

<!-- Output: -->
1. & 2. < 3. > 4. « 5. » 6. © 7. ® 8. ™ 9. £ 10. €
```

## lazy loading

```html
<!-- On the image tag -->
<img src="./assets/icon-144x144.png" loading="lazy" alt="Some image"/>

<!-- In the picture element with source sets -->
<picture>
    <source media="(min-width: 1024px)" srcset="./assets/icon-512x512.png">
    <source srcset="./assets/icon-144x144.png 1x, ./assets/icon-512x512.png 2x">
    <img src="./assets/icon-64x64.png" loading="lazy">
</picture>
```

## Filter file types of a file input

```html
<input type="file" accept=".png, .jpg, .jpeg" />

<!-- Or -->
<input type="file" accept="image/png, image/jpeg" />
```

## Lazy loading images

```html
<img src="..." alt="..." loading="lazy" />
```

## Validate an input value with the pattern attribute

```html
<input type="tel" pattern="^\d{10}$" title="Please enter 10 digits" />
```

## Create a download link

```html
<!-- Download instead of opening it -->
<a href="/assets/document.pdf" download>
    <!-- Download it with new file name -->
    <a href="/assets/document.pdf" download="a copy of document.pdf"></a
></a>
```

## autocomplete list with the datalist element

```html
<input list="demo__list" />
<datalist id="demo__list">
    <option value="..." />
    <option value="..." />
    <option value="..." />
    ...
</datalist>
```
