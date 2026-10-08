# Accessibility (a11y) (38 questions)

> Accessibility (a11y — "a" + 11 letters + "y") means building web apps that **everyone can use**, including people with visual, motor, auditory, or cognitive impairments — plus the much larger group experiencing _temporary_ or _situational_ limitations (a broken arm, bright sunlight, a noisy room, a slow connection). It matters legally (ADA, Section 508, EN 301 549, AODA), ethically (don't lock people out), commercially (larger audience + better SEO, since semantic HTML helps crawlers too), and for plain UX — accessible apps are usually clearer and more robust for _all_ users. As someone who builds React dashboards (Nova ERP, Dynamic SaaS) with Ant Design + Tailwind — including **Arabic/RTL** apps — a11y intersects directly with my work: semantic markup, keyboard-driven dashboards, screen-reader-friendly tables, and the i18n/RTL concerns (`dir`, `lang`, logical CSS properties) that overlap heavily with accessibility. Knowing both a11y and i18n is a strong combination. See also [03-react-core.md](./03-react-core.md), [04-react-advanced.md](./04-react-advanced.md), [27-web-browser-fundamentals.md](./27-web-browser-fundamentals.md), and [16-testing.md](./16-testing.md).

## Quick Revision Checklist

- **a11y = usable by everyone**: permanent, temporary, and situational impairments — visual, motor, auditory, cognitive.
- **Why it matters**: legal (ADA / Section 508 / EN 301 549 / AODA), ethical, bigger audience, SEO overlap, better UX for all.
- **WCAG** is the standard; principles are **POUR** = Perceivable, Operable, Understandable, Robust.
- **Conformance levels**: A (min), **AA (the common target)**, AAA (strictest, rarely fully required).
- **Semantic HTML is the foundation** — `<button>`, `<nav>`, `<main>`, `<header>`, headings h1–h6, lists, landmarks give free a11y.
- **First rule of ARIA**: don't use ARIA if a native HTML element does the job. Bad ARIA is worse than none.
- **Everything must be keyboard-operable**; never remove the focus outline without a visible replacement.
- **tabindex**: `0` (in natural order), `-1` (focusable via JS only), **never positive values**.
- **Focus management** in SPAs: trap focus in modals, move focus on route change, support `Esc` to close, skip links.
- **Screen readers** (NVDA, JAWS, VoiceOver) read the accessibility tree; provide alt text, labels, and live regions.
- **Images**: descriptive `alt` for meaningful images, `alt=""` for decorative ones.
- **Forms**: associate `<label htmlFor>`, use `aria-invalid` + `aria-describedby` for errors, `fieldset`/`legend` for groups.
- **Color**: contrast **4.5:1** body text, **3:1** large text/UI; never use color alone to convey meaning.
- **Respect user prefs**: zoom to 200%, reflow, and `prefers-reduced-motion`.
- **React specifics**: `htmlFor`/`className`, `useId`, fragments, refs for focus, `eslint-plugin-jsx-a11y`, accessible libs (Radix/Reach/Headless UI).
- **RTL/i18n overlap**: `dir="rtl"`, `lang`, logical CSS (`margin-inline-start`) — central to my Arabic apps.
- **Testing**: automated (axe, Lighthouse, jest-axe, eslint) catches only ~30–40%; **manual + screen-reader + keyboard testing is essential**.
- **Custom widgets** (combobox, tabs, menu, dialog) should follow the **WAI-ARIA Authoring Practices** — or use a vetted library.

## Basic

### Q1: What is web accessibility (a11y) and who benefits from it?

**A:** Accessibility is the practice of designing and building websites and apps so they can be used by as many people as possible, regardless of ability or context. It benefits:

- People with **permanent** impairments: visual (blind, low vision, color blind), motor (can't use a mouse, tremors), auditory (deaf/hard of hearing), cognitive (dyslexia, ADHD, memory).
- People with **temporary** impairments: a broken arm, an eye infection, post-surgery.
- People in **situational** contexts: bright sunlight on a phone, a noisy commute (needs captions), one hand holding a baby, a slow/limited connection.

**Tip:** Framing a11y as "permanent + temporary + situational" instantly signals maturity in an interview — it shows you understand a11y helps _everyone_, not a niche minority.

### Q2: Why does accessibility matter? Give business and non-technical reasons.

**A:**

- **Legal**: ADA (US), Section 508 (US federal), EN 301 549 (EU), AODA (Ontario), Equality Act (UK). Lawsuits over inaccessible sites are common.
- **Ethical**: excluding people with disabilities is discrimination.
- **Larger audience**: ~15–20% of people have some disability; accessible sites reach more customers.
- **SEO overlap**: semantic HTML, alt text, proper headings, and good structure help search crawlers too.
- **Better UX for everyone**: captions help in noise, high contrast helps in sunlight, keyboard support helps power users.

**Tip:** Mention SEO overlap — interviewers love that semantic markup is a "two-for-one" win.

### Q3: What is WCAG and what are its four principles (POUR)?

**A:** **WCAG** = Web Content Accessibility Guidelines, the international standard (by the W3C). Its four guiding principles spell **POUR**:

- **Perceivable** — users can perceive the content (alt text, captions, contrast).
- **Operable** — users can operate the UI (keyboard access, enough time, no seizure-inducing flashes).
- **Understandable** — content and operation are clear (readable text, predictable behavior, helpful errors).
- **Robust** — works across browsers, devices, and assistive tech (valid, semantic markup).

**Tip:** If you can recite POUR and give one example per letter, you've covered the most common WCAG interview question.

### Q4: What are WCAG conformance levels (A, AA, AAA)?

**A:** Three levels of strictness:

- **A** — minimum; basic must-haves.
- **AA** — the **common industry/legal target**; balances rigor and feasibility (most laws reference AA).
- **AAA** — strictest; often impractical site-wide (e.g., 7:1 contrast, sign language for all video).

**Tip:** When asked "what level should we aim for?" answer **AA** — it's the de-facto standard for compliance.

### Q5: Why is semantic HTML the foundation of accessibility?

**A:** Native elements come with built-in accessibility for free: correct **roles**, **keyboard support**, **focusability**, and **states** that screen readers and browsers understand. A `<button>` is focusable, announced as "button", and fires on Enter/Space automatically. A `<div>` is none of those.

```html
<!-- Semantic: free a11y -->
<button onClick="...">Save</button>

<!-- Div soup: no role, no focus, no keyboard, no announcement -->
<div onClick="...">Save</div>
```

**Tip:** "Use the right element for the job" is the single highest-leverage a11y rule.

### Q6: What is the "div soup" anti-pattern?

**A:** Building the entire UI from `<div>` and `<span>` with no semantic meaning. Screen readers can't tell a heading from a button from a region — the page becomes a featureless blob. Use `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`, `<button>`, `<ul>`/`<li>`, and headings instead.

```html
<!-- Div soup -->
<div class="header">
  <div class="nav"><div class="link">Home</div></div>
</div>
<div class="title">Dashboard</div>

<!-- Semantic -->
<header>
  <nav><a href="/">Home</a></nav>
</header>
<main>
  <h1>Dashboard</h1>
</main>
```

**Tip:** Ant Design and Tailwind make div-soup easy to fall into — call out that you consciously reach for semantic wrappers.

### Q7: When should you use a link vs a button?

**A:**

- **`<a href>`** — _navigation_: goes to a URL / changes location / can be opened in a new tab.
- **`<button>`** — _action_: submits, toggles, opens a modal, triggers JS.

If "Open in new tab" or bookmarking makes sense, it's a link; if it performs an action on the current page, it's a button.

**Tip:** A red flag is a `<a href="#">` with an onClick that does an action — should be a `<button>`.

### Q8: What is `tabindex` and what do its values mean?

**A:** `tabindex` controls keyboard focus order:

- `tabindex="0"` — element is focusable in the **natural DOM order** (use for custom interactive elements).
- `tabindex="-1"` — element is **not in tab order** but can be focused programmatically (`element.focus()`), e.g., a modal container or a route heading.
- `tabindex="1+"` (positive) — **never use**; it overrides natural order, creates confusing/unmaintainable tab sequences.

**Tip:** "Never use positive tabindex" is a classic gotcha answer.

### Q9: What is alt text, and what's the difference between descriptive alt and `alt=""`?

**A:** `alt` is alternative text screen readers announce for images.

- **Descriptive alt** — for images that convey meaning: describe the content/purpose.
- **Empty alt (`alt=""`)** — for **decorative** images (a background swirl, a divider icon); tells screen readers to skip it.
- **Missing alt entirely** — bad; some screen readers read the file name (`IMG_4821.png`).

```html
<img src="chart.png" alt="Revenue grew 30% from Q1 to Q2" />
<!-- meaningful -->
<img src="divider.svg" alt="" />
<!-- decorative -->
```

**Tip:** Decorative ≠ no alt attribute. Use `alt=""` (empty), not omit it.

### Q10: How do you visually hide text but keep it for screen readers (sr-only)?

**A:** Use a "visually hidden" utility — `display:none` and `visibility:hidden` remove it from screen readers too, so use the clip technique:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```html
<button>
  <svg aria-hidden="true">...</svg>
  <span class="sr-only">Delete invoice</span>
</button>
```

**Tip:** Tailwind ships this as the `sr-only` class — mention you use it for icon-only buttons.

## Intermediate

### Q11: What is ARIA and what are roles, states, and properties?

**A:** **ARIA** = Accessible Rich Internet Applications — a set of HTML attributes that describe elements to assistive tech when native semantics aren't enough.

- **Roles** — what an element _is_: `role="dialog"`, `role="tab"`, `role="alert"`.
- **States** — current condition (dynamic): `aria-expanded="true"`, `aria-checked`, `aria-disabled`.
- **Properties** — relatively static characteristics: `aria-label`, `aria-labelledby`, `aria-controls`.

**Tip:** ARIA changes how an element is _announced_ — it does **not** add behavior. You still wire up keyboard handlers yourself.

### Q12: What is the "first rule of ARIA"?

**A:** **"If you can use a native HTML element or attribute with the semantics and behavior you need already built in, do so instead of re-purposing an element and adding an ARIA role/state/property."** In short: prefer native elements; only reach for ARIA when no native element exists (e.g., a tablist or a custom combobox).

**Tip:** Incorrect ARIA is worse than no ARIA — a wrong role actively misleads screen reader users.

### Q13: Explain `aria-label`, `aria-labelledby`, and `aria-describedby`.

**A:**

- **`aria-label`** — provides an accessible _name_ via a string (when there's no visible label, e.g., an icon button).
- **`aria-labelledby`** — provides the name by _referencing another element's id(s)_ (use when a visible label exists elsewhere).
- **`aria-describedby`** — provides supplementary _description_ referenced by id (hint text, error messages).

```html
<button aria-label="Close dialog">✕</button>

<h2 id="modalTitle">Edit user</h2>
<div role="dialog" aria-labelledby="modalTitle">...</div>

<input aria-describedby="pwdHint" />
<p id="pwdHint">Must be at least 8 characters.</p>
```

**Tip:** Name (label) vs description (describedby) — name is _what it is_, description is _extra info_.

### Q14: What is `aria-hidden` and when do you use it?

**A:** `aria-hidden="true"` removes an element (and its subtree) from the accessibility tree — screen readers skip it while it stays visible on screen. Use it for **decorative icons**, duplicate content, or off-screen content that's visually hidden. **Never** put `aria-hidden="true"` on a focusable element — it creates a "ghost" element that's focusable but unannounced.

**Tip:** Common pattern: decorative `<svg aria-hidden="true">` next to `sr-only` text.

### Q15: What are ARIA live regions (polite vs assertive)?

**A:** Live regions announce **dynamic content changes** without moving focus — essential for toasts, validation summaries, search-results counts, and async status.

- `aria-live="polite"` — announces when the user is idle (most updates, toasts).
- `aria-live="assertive"` — interrupts immediately (critical errors). Use sparingly.
- `role="status"` ≈ polite; `role="alert"` ≈ assertive (with built-in semantics).

```html
<div aria-live="polite" class="sr-only" id="toast-region"></div>
<script>
  // Updating textContent triggers the announcement
  document.getElementById("toast-region").textContent = "Invoice saved";
</script>
```

**Tip:** The live region must exist in the DOM _before_ you update it — injecting the region and content at once often isn't announced.

### Q16: What are `aria-expanded` and `aria-controls` used for?

**A:** They wire up disclosure widgets (accordions, dropdown menus, expandable panels):

- `aria-expanded="true|false"` — on the trigger, tells whether the controlled region is open.
- `aria-controls="panelId"` — points the trigger to the element it shows/hides.

```html
<button aria-expanded="false" aria-controls="faq1">What is a11y?</button>
<div id="faq1" hidden>Accessibility means...</div>
```

**Tip:** Keep `aria-expanded` in sync with state — in React, drive it from the same state that toggles the panel.

### Q17: How do you make a `<div>` behave like a button (and why you usually shouldn't)?

**A:** You'd need role, focusability, and keyboard handling — replicating what `<button>` gives free:

```jsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Save
</div>
```

You'd _still_ miss the disabled state, form submission, and focus styling. Just use `<button>`.

**Tip:** This is a great "show you know what native elements give you for free" answer — then conclude "...so I'd use `<button>`."

### Q18: How do you associate a label with a form input?

**A:** Use `<label>` with `htmlFor` (React) / `for` (HTML) matching the input's `id`. Clicking the label focuses the input and screen readers announce the label when the field is focused.

```jsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

Alternatives: wrapping the input in the label, or `aria-label` / `aria-labelledby` when no visible label exists. **Placeholder is not a label** — it disappears on input and has poor contrast.

**Tip:** In React it's `htmlFor`, not `for` (which is a reserved word).

### Q19: How do you make form error messages accessible?

**A:** Three pieces:

1. `aria-invalid="true"` on the field when invalid.
2. `aria-describedby` pointing to the error message id so it's announced with the field.
3. The error in a live region (or `role="alert"`) so it's announced when it appears.

```jsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" role="alert" className="text-red-600">
    {error}
  </p>
)}
```

**Tip:** Don't convey errors by red border alone — pair color with text/icon (color-alone fails WCAG).

### Q20: What is a skip link?

**A:** A "Skip to main content" link as the first focusable element. Keyboard/screen-reader users hit Tab once and jump past the repeated nav straight to `<main>`, instead of tabbing through dozens of menu items on every page. It's usually visually hidden until focused.

```html
<a href="#main" class="skip-link">Skip to main content</a>
...
<main id="main" tabindex="-1">...</main>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 16px;
  top: 16px; /* becomes visible */
}
```

**Tip:** Especially valuable for dashboards with big sidebars — a relevant example for ERP/SaaS UIs.

### Q21: What are landmarks and why do they help?

**A:** Landmark roles (`<header>`/banner, `<nav>`/navigation, `<main>`/main, `<aside>`/complementary, `<footer>`/contentinfo, `<form>`/`<search>`) let screen-reader users **jump between regions** with shortcuts and get a high-level map of the page. Use one `<main>` per page; label multiple same-type landmarks (e.g., two `<nav>`s) with `aria-label`.

**Tip:** Prefer native elements over `role="navigation"` etc. — they imply the landmark automatically.

### Q22: What's the rule for color contrast under WCAG AA?

**A:**

- **4.5:1** for normal body text.
- **3:1** for large text (≥18.66px bold or ≥24px regular) and for **UI components / graphical objects** (icons, input borders, focus indicators).

**Tip:** Mention you check with a contrast checker (axe, browser devtools, or webaim) — brand colors on white often fail.

### Q23: Why must you never rely on color alone to convey information?

**A:** ~8% of men have some color vision deficiency, and screen-reader users get no color at all. "Required fields are red" or "errors in red, success in green" excludes them. Always add a **second cue**: text, icon, pattern, or label.

```html
<!-- Bad: color only -->
<span style="color:red">Failed</span>
<!-- Good -->
<span style="color:red">✕ Failed</span>
```

**Tip:** Status charts in dashboards are a classic offender — add labels/patterns, not just colored bars.

## Advanced

### Q24: How do you implement a focus trap in a React modal?

**A:** When a modal opens: move focus into it, keep Tab/Shift+Tab cycling _within_ it, close on `Esc`, and restore focus to the trigger on close. Render via a portal so it's outside the normal flow, and mark the rest of the app inert/`aria-hidden`.

```jsx
function Modal({ onClose, title, children }) {
  const dialogRef = useRef(null);
  const lastFocused = useRef(null);
  const titleId = useId();

  useEffect(() => {
    lastFocused.current = document.activeElement; // remember trigger
    const dialog = dialogRef.current;
    const focusables = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus(); // move focus in

    function onKeyDown(e) {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus(); // wrap backward
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus(); // wrap forward
      }
    }
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      lastFocused.current?.focus(); // restore focus
    };
  }, [onClose]);

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body,
  );
}
```

**Tip:** In real apps prefer a vetted library (Radix Dialog, Headless UI, Reach) — modals are deceptively hard to get right (inert background, scroll lock, edge cases). Show you _can_ build it, then say you'd use a library.

### Q25: How do you manage focus on route changes in a React SPA?

**A:** Native page loads move focus to the top and screen readers announce the new page. SPA route changes don't — the screen reader user is stranded. On navigation:

1. Move focus to the main heading (`<h1 tabindex="-1">`) or the `<main>` container.
2. Optionally announce the new page title via a live region.

```jsx
function RouteFocus() {
  const location = useLocation();
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus(); // h1 has tabindex={-1}
  }, [location.pathname]);
  return (
    <h1 ref={headingRef} tabIndex={-1}>
      {pageTitle}
    </h1>
  );
}
```

**Tip:** This is a top React-specific a11y question — emphasize that React Router does _not_ handle it for you.

### Q26: What is roving tabindex?

**A:** A pattern for composite widgets (toolbars, menus, radio groups, tabs) where the _group_ is one tab stop. Only the currently active item has `tabindex="0"`; all others have `tabindex="-1"`. Arrow keys move "focus" between items by shifting which one holds `0` and calling `.focus()`. This matches native behavior (e.g., radio buttons) and keeps the Tab key uncluttered.

**Tip:** Contrast with "everything tabindex=0" which forces users to Tab through every menu item — roving tabindex is the WAI-ARIA-recommended approach.

### Q27: What is the accessibility tree?

**A:** A parallel structure the browser builds from the DOM, exposing each node's **role, name, state, and value** to assistive tech via platform accessibility APIs. Screen readers read _this tree_, not the raw DOM. CSS (`display:none`), `aria-hidden`, and semantics decide what ends up in it. Debug it via Chrome DevTools → Accessibility pane.

**Tip:** Saying "screen readers read the accessibility tree, derived from the DOM" shows real depth.

### Q28: How do you build an accessible data table?

**A:**

- Use real `<table>`/`<thead>`/`<tbody>`/`<th>`/`<td>` (not div grids).
- `<th scope="col">` and `<th scope="row">` so screen readers associate cells with headers.
- `<caption>` for the table's accessible name/summary.
- For complex tables, `headers`/`id` to map cells to multiple headers.

```html
<table>
  <caption>
    Q2 invoices by client
  </caption>
  <thead>
    <tr>
      <th scope="col">Client</th>
      <th scope="col">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Acme</th>
      <td>$4,200</td>
    </tr>
  </tbody>
</table>
```

**Tip:** Ant Design `<Table>` handles much of this, but verify scope/caption — relevant for ERP dashboards full of tables.

### Q29: How do you handle accessible drag-and-drop?

**A:** Native HTML5 drag-and-drop is essentially inaccessible to keyboard/screen-reader users. Provide an **alternative**: keyboard controls (select item, arrow/space to move, Enter to drop) plus live-region announcements of position ("Moved Task 3 to position 1 of 5"). Libraries like dnd-kit support keyboard sensors and ARIA announcements out of the box. Always offer a non-drag fallback (e.g., "move up/down" buttons or a numeric position input).

**Tip:** The honest senior answer: don't ship drag-only reordering — pair it with buttons/keyboard.

### Q30: What WAI-ARIA Authoring Practices patterns should you know for custom widgets?

**A:** The **APG (ARIA Authoring Practices Guide)** documents the expected roles, states, and keyboard interactions for complex widgets: **dialog/modal, tabs, accordion, combobox, listbox, menu/menubar, tooltip, disclosure, switch, slider, tree**. Each specifies arrow-key behavior, focus management, and required ARIA. Building these from scratch is risky — match the spec exactly or use a library that implements it.

**Tip:** Name a couple (combobox and menu are the hardest) and say you'd reach for Radix/Reach/Headless UI rather than hand-rolling.

### Q31: Why is building custom widgets risky, and what do accessible component libraries give you?

**A:** Custom comboboxes/menus/dialogs require precise focus management, roving tabindex, correct ARIA, and full keyboard support — easy to get subtly wrong, which _breaks_ screen-reader users. Libraries like **Radix UI**, **Reach UI**, and **Headless UI** implement the APG patterns (correct ARIA, keyboard, focus trapping) while leaving styling to you. Even Ant Design covers many cases but isn't perfect — verify with testing.

**Tip:** "Use a vetted accessible library and style it" is the pragmatic senior stance.

### Q32: How does the `prefers-reduced-motion` media query help?

**A:** Some users get motion sickness/vestibular issues from animations. Respect their OS setting:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In React/JS you can read it via `window.matchMedia('(prefers-reduced-motion: reduce)')` to disable parallax, autoplay, or big transitions.

**Tip:** Pair with reduced-motion-aware animation libs (Framer Motion respects it).

### Q33: What are text resizing, zoom, and reflow requirements?

**A:** WCAG AA requires content to remain usable when:

- Text is enlarged up to **200%** without loss of content/function.
- The page is **zoomed to 400%** and content **reflows** into a single column (no horizontal scrolling at 320px-equivalent width).

This means using **relative units** (rem/em, not fixed px for everything), avoiding fixed heights that clip text, and responsive layouts.

**Tip:** Tailwind's rem-based spacing helps; just avoid hard pixel heights on text containers.

### Q34: How do accessibility and RTL/i18n overlap?

**A:** They share the same goal — content usable by all users in their context — and several mechanics:

- **`dir="rtl"`** on `<html>` or a subtree mirrors layout for Arabic/Hebrew; screen readers also use it to read in the right order.
- **`lang` attribute** (`<html lang="ar">`, or `lang` on a span) tells screen readers which pronunciation/voice to use — critical for bilingual apps so Arabic isn't read with an English voice.
- **Logical CSS properties** (`margin-inline-start` instead of `margin-left`) automatically flip with direction, so a single stylesheet works for LTR and RTL — fewer bugs and consistent a11y.
- Icons/arrows that imply direction (back/next) must mirror in RTL.

```css
.card {
  margin-inline-start: 1rem; /* flips with dir, unlike margin-left */
  padding-inline: 1rem;
  text-align: start; /* not 'left' */
}
```

```html
<html lang="ar" dir="rtl">
  ...
</html>
<p>Total: <span lang="en">Dynamic ERP</span></p>
```

**Tip:** This is _your_ differentiator — explicitly connect your Arabic/RTL dashboard work to `dir`, `lang`, and logical properties.

### Q35: What React-specific a11y tools and APIs do you use?

**A:**

- **`eslint-plugin-jsx-a11y`** — lint JSX for missing alt, invalid ARIA, click-without-keyboard, label associations (catches issues at dev time).
- **`useId`** — generate stable unique ids for label/input and `aria-describedby` associations (SSR-safe).
- **Refs (`useRef`)** — programmatic focus for modals and route changes.
- **Fragments (`<>`)** — avoid wrapper `<div>`s that pollute semantics.
- **JSX attributes** — `htmlFor`, `className`, and standard `aria-*`/`role` pass straight through.

```jsx
function Field({ label, error }) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
      />
      {error && (
        <p id={errId} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
```

**Tip:** `useId` (React 18+) is the modern answer for unique a11y ids — beats hand-rolled counters, works with SSR.

### Q36: How do you test accessibility, and why aren't automated tools enough?

**A:** A layered approach:

- **Automated**: `axe`/`axe-core` (browser extension or DevTools), **Lighthouse** a11y audit, `eslint-plugin-jsx-a11y` in CI, and **`jest-axe`** in component/unit tests (see [16-testing.md](./16-testing.md)).
- **Manual** (essential): navigate with **keyboard only** (Tab/Shift+Tab/Enter/Esc/arrows), use a **screen reader** (NVDA/JAWS on Windows, VoiceOver on Mac/iOS), **zoom to 200–400%**, run a **contrast checker**.

Automated tools catch only ~**30–40%** of issues — they can't judge whether alt text is _meaningful_, whether focus order is _logical_, or whether a custom widget actually _works_ with a screen reader.

```js
// jest-axe example
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

test("form has no a11y violations", async () => {
  const { container } = render(<SignupForm />);
  expect(await axe(container)).toHaveNoViolations();
});
```

**Tip:** Mentioning the ~30–40% stat plus "manual + real-user testing is essential" is exactly what interviewers want.

### Q37: Why is testing with real users (with disabilities) important?

**A:** Automated and even expert manual testing can't fully predict how someone who relies on a screen reader or switch device every day will experience a flow. Real users surface friction (confusing announcements, awkward focus order, unclear instructions) that "technically conformant" code still has. WCAG conformance is the floor, not the goal — usability for real assistive-tech users is the goal.

**Tip:** This signals you see a11y as _usability_, not a checklist.

### Q38: What's an accessible toast/notification pattern in React?

**A:** Render a persistent live region and update its content when a toast appears, so it's announced without stealing focus:

```jsx
function ToastRegion({ message }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
```

For errors, use `aria-live="assertive"` / `role="alert"`. Keep the visible toast on screen long enough to read, and don't auto-dismiss critical messages too fast (Operable: enough time).

**Tip:** `aria-atomic="true"` ensures the whole message is re-read on each change, not just the diff.

## A11y Checklist for a React App

**Structure & semantics**

- [ ] One `<h1>` per page; headings nested logically (no skipping levels for styling).
- [ ] Landmarks present: `<header>`, `<nav>`, `<main id="main">`, `<footer>`.
- [ ] Use semantic elements (`<button>`, `<a>`, `<ul>`, `<table>`) — no div/span soup.
- [ ] Lists use `<ul>/<ol>/<li>`; tables use `<th scope>` + `<caption>`.
- [ ] Skip-to-content link as the first focusable element.

**Keyboard & focus**

- [ ] Every interactive element reachable and operable by keyboard.
- [ ] Visible focus indicator everywhere (never `outline: none` without a replacement).
- [ ] No positive `tabindex`; logical tab order matches visual order.
- [ ] Modals trap focus, close on `Esc`, and restore focus to the trigger.
- [ ] Focus moves to heading/main on SPA route change.

**Images & icons**

- [ ] Meaningful images have descriptive `alt`; decorative ones use `alt=""`.
- [ ] Decorative SVG icons have `aria-hidden="true"`; icon-only buttons have `aria-label` or `sr-only` text.

**Forms**

- [ ] Every input has an associated `<label htmlFor>` (placeholder is not a label).
- [ ] Errors use `aria-invalid` + `aria-describedby` and are announced.
- [ ] Related controls grouped with `<fieldset>/<legend>`; required state conveyed in text.

**Visual & motion**

- [ ] Contrast ≥ 4.5:1 (text) / 3:1 (large text, UI, focus rings).
- [ ] Information never conveyed by color alone (add text/icon).
- [ ] Usable at 200% text zoom and reflows at 400% / 320px width.
- [ ] `prefers-reduced-motion` respected for animations.

**ARIA (only when needed)**

- [ ] Prefer native elements; ARIA used only where no native equivalent exists.
- [ ] `aria-expanded`/`aria-controls` on disclosures; live regions for dynamic updates.
- [ ] No `aria-hidden` on focusable elements; ARIA states kept in sync with state.

**i18n / RTL**

- [ ] `<html lang>` set; foreign-language spans marked with `lang`.
- [ ] `dir="rtl"` for Arabic/Hebrew; logical CSS properties (`margin-inline-*`, `text-align: start`).

**Tooling & testing**

- [ ] `eslint-plugin-jsx-a11y` enabled in CI.
- [ ] axe / Lighthouse run; `jest-axe` in component tests.
- [ ] Manual keyboard-only + screen-reader + zoom + contrast passes done.

## Common Mistakes / Red Flags

- **Div soup** — clickable `<div>`s with `onClick` instead of `<button>`/`<a>`; no keyboard, no role.
- **`outline: none`** with no visible focus replacement — keyboard users can't see where they are.
- **Placeholder as label** — disappears on typing, low contrast, not announced reliably.
- **Color-only meaning** — red-only errors, green-only success, status charts with color but no labels.
- **Missing/lazy alt** — `alt="image"`, file-name alt, or omitting `alt` on decorative images (use `alt=""`).
- **Wrong/over-use of ARIA** — `role="button"` on an actual `<button>`, fake roles that don't match behavior; bad ARIA is worse than none.
- **`aria-hidden` on focusable elements** — creates focusable-but-silent "ghost" controls.
- **Positive `tabindex`** — breaks natural tab order.
- **No focus management in SPA** — modals don't trap/restore focus; route changes leave focus/announcement stranded.
- **Inaccessible custom widgets** — hand-rolled dropdowns/comboboxes/menus that ignore the APG keyboard patterns.
- **Low contrast brand colors** — light-gray text, faint borders, invisible focus rings.
- **Relying only on automated tools** — "axe passed, ship it" while keyboard/screen-reader flows are broken (catches ~30–40%).
- **Drag-only interactions** — reorder/kanban with no keyboard alternative.
- **Forgetting `lang`/`dir`** in bilingual/RTL apps — Arabic read with an English voice, layout not mirrored.

## Further Reading

- [MDN — Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WCAG 2.2 (W3C)](https://www.w3.org/WAI/WCAG22/quickref/) and the [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [The A11Y Project — Checklist & Articles](https://www.a11yproject.com/)
- [Deque axe-core / axe DevTools](https://www.deque.com/axe/)
