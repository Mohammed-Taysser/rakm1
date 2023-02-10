
# google 😜

## Search Operators

**Note**: Do not put a space between `operator:` and the `URL`

query | information
--- | ---
`allinanchor:title`:  |  page with anchor text contain **title**
`allintext:title`:    |  page with **title** in page content
`allintitle:title`:   |  page with **title** in page title
`allinurl:title`:     |  page with **title** in page url
`cache:url`:          |  display cached version of a web page
`define:title`:       |  finding definitions of words
`filetype:suffix` or `|  ext:suffix`     |  pages whose names end in suffix
`link:url`            |  pages that point|   to that **URL**
`site:url title`      |  search results t|  o the site with **title**
`related:url`         |  pages that are similar to the **URL**

## Query Input

- Search for **exact match**: Put a word inside quotes. example: `"full stack"`
- Search within **range of numbers**: Put `..` between two numbers. example: `laptop $500..$1000`
- **Exclude** words from search: Put `-` in front of word you want to leave out. example `full stack -dotnet`
- **Combine searches**: Put `OR` or `|` between each search query. example, `frontend OR backend`.
- Search for **price**: put `$` in front of a number. example:`laptop $400`
- Search for **hashtags**: Put `#` in front of a word. example: `#frontend`
- Search for **alternative** mean: Put `~` in front of a word. example: `~expensive` like un-cheap
- Search for **unknown** word: Put `*` between words. example: `"full * dev"` as unknown word is `stack`

## Anatomy of a Web Address

<http://www.googleguide.com/searchEngines/google/searchLeader.html>

part                | description
-------             | ---------
http                | transfer protocol (type of information being transferred)
www.googleguide.com | website name, host name
googleguide         | second-level domain name
com                 | top-level domain name
searchEngines       | directory name (major category)
google              | sub-directory name (sub-category)
searchLeader        | file name (a file within the directory)
html                | file format

## some note

### Stop Words

Some common words, called `stop words` (such as the, on, where, how, de, la, as well as certain single digits and single letters) generally don't add meaning to a search.

### Word Limit

Google limits queries to 32 words.

### Terms in Order

Google gives higher priority to pages that have the terms in the same order as in your query.

### Not Case-Sensitive

Google is NOT case sensitive, it shows both upper- and lowercase results.

### Characters Ignored

Google ignores some punctuation and special characters, including `! ? , . ; [ ] @ / # < >`

### Apostrophes

A term with an apostrophe (single quote, ') doesn't match the term without an apostrophe.

A query with the term 'we're' returns different results from a query with the term 'were.'

- `we're` matches `we're` but not `were`
- `were`  matches `were` but not `we're`

### Hyphenated Terms

Because some people spell hyphenated words with a hyphen `-` and others with a space, Google searches for variations on any hyphenated terms.

- `part-time` matches `part-time`, `part time` and `parttime`
- `part time` matches `part-time` and `part time`
- `"part time"` (with quotes) is better for space-separated words

### Terms Nearby

Google favors results that have your search terms near each other

Google considers the proximity of your search terms within a page. So the query `snake grass` finds pages about a plant of that name, while `snake in the grass` tends to emphasize pages about sneaky people. Although Google ignores the words 'in' and 'the,' (these are stop words), Google gives higher priority to pages in which 'snake' and 'grass' are separated by two words.

## resources

- <http://www.googleguide.com/advanced_operators_reference.html>
- [advanced image search](https://google.com/advanced_image_search)

# duck duck go 💪

## Bang

bang | info
--- | ---
`!devto` | Dev
`!mdn` | MDN Web Docs
`!yt` | YouTube
`!b` | bing search engin
`!g` | google search engin
`@duckduckgo` | See social media information in results
`lorem ipsum` | Generate lorem ipsum text
`5 sentences of Lorem Ipsum` | Generate lorem ipsum text
`20 words of random latin` | Generate lorem ipsum text
`10 paragraphs of lorem ipsum` | Generate lorem ipsum text
`lowercase title` | Change casing
`uppercase title` | Change casing
`duckduckgo cheatsheet` | Cheatsheets
`calendar 25 dec 2021` | Searching for any calendar
`calendar` | Searching for any calendar
`qr https://duckduckgo.com` | Generate QR Codes
`html chars` | Find HTML codes
`html &` | Find HTML codes
`#FFB38F` | Find certain colors
`is github.com down` | Check the status of a website
`101 binary` | Binary conversion
`101 decimal` | Binary conversion
`alternative to photoshop` | get an alternative
`stopwatch` | Stopwatch
`shorten https://duckduckgo.com` | `Shorten links`, result: `https://is.gd/Xiofm9`
`expand https://is.gd/Xiofm9` | Expand links, result: `https://duckduckgo.com`
`url encode https://duckduckgo.com/` | URL encoding, result: `https%3A%2F%2Fduckduckgo.com%2F`
`URL decode https%3A%2F%2Fduckduckgo.com%2F` | URL encoding, result: `https://duckduckgo.com/`

## Easter eggs

- [why should i use this](https://duckduckgo.com/?q=why+should+i+use+this&t=brave&ia=answer)
- [google](https://duckduckgo.com/?q=google&v=c&ia=web)
- [xkcd](https://duckduckgo.com/?q=xkcd&v=c&ia=comics)
