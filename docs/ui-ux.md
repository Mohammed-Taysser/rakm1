# UX/Ui

## Forms

### Forms should be one column

Multiple columns disrupt a user's vertical momentum.

![Forms should be one column](../static/img/ux-ui/forms/forms-should-be-one-column.webp)

### Top align labels

Users complete top aligned labeled forms at a much higher rate than left-aligned labels. Top aligned labels also translate well on mobile. However, consider using left-aligned labels for large data-set entry with variable optionality because they are easier to scan together, they reduce height, and prompt more consideration than top-aligned labels.

![Top align labels](../static/img/ux-ui/forms/top-align-labels.webp)

### Group labels with their inputs

Present the label and input close together, and make sure there is enough height between the fields so users don't get confused.

![Group labels with their inputs](../static/img/ux-ui/forms/group-labels-with-their-inputs.webp)

### Avoid all caps

All caps are more difficult to read and scan.

![Avoid all caps](../static/img/ux-ui/forms/avoid-all-caps.webp)

### Show all selection options if under 6

Placing options in a selector drop-down requires two clicks, and hides the options. Use an input selector if there are over 5 options. Incorporate contextual search within the drop-down if there are over 25 options.

![Show all selection options if under 6](../static/img/ux-ui/forms/show-all-selection-options-if-under-6.webp)

### Resist using placeholder text as labels

It is tempting to optimize space by using placeholder text as labels. This causes many usability issues that have been [summarized by Katie Sherwin](https://www.nngroup.com/articles/form-design-placeholders/) of Nielsen Norman Group.

![Resist using placeholder text as labels](../static/img/ux-ui/forms/resist-using-placeholder-text-as-labels.webp)

### Place checkboxes (and radios) underneath each other for scannability

Placing checkboxes underneath each other allows easy scanning.

![Place checkboxes (and radios) underneath each other for scannability](../static/img/ux-ui/forms/place-checkboxes-and-radios-underneath-each-other-for-scannability.webp)

### Make CTAs descriptive

A call to action should state the intent.

![Make CTAs descriptive](../static/img/ux-ui/forms/make-CTAs-descriptive.webp)

### Specify errors inline

Show the user where the error occurred and provide a reason.

![Specify errors inline](../static/img/ux-ui/forms/specify-errors-inline.webp)

### Use inline validation after the user fills out the field (unless it helps them while in the process)

Don't use inline validation while the user is typing — unless it helps them — like in the case of creating a password, username, or message with a character count.

![Use inline validation after the user fills out the field](../static/img/ux-ui/forms/use-inline-validation-after-the-user-fills-out-the-field.webp)

### Don't hide basic helper text

Expose basic helper text wherever possible. For complex helper text, consider placing it next to the input during its focused state.

![Don't hide basic helper text](../static/img/ux-ui/forms/Do-not-hide-basic-helper-text.webp)

### Differentiate primary from secondary actions

There is a bigger philosophical debate regarding whether a secondary option should even be included.

![Differentiate primary from secondary actions](../static/img/ux-ui/forms/Differentiate-primary-from-secondary-actions.webp)

### Use field length as an affordance

The length of the field affords the length of the answer. Employ this for fields that have a defined character count like phone numbers, zip codes, etc.

![Use field length as an affordance](../static/img/ux-ui/forms/Use-field-length-as-an-affordance.webp)

### Ditch the * and denote optional fields

Users don't always know what is implied by the required field marker (*). Instead, it is better to denote optional fields.

![Ditch the * and denote optional fields](../static/img/ux-ui/forms/Ditch-the-and-denote-optional-fields.webp)

### Group related information

Users think in batches, and long forms can feel overwhelming. By creating logical groups the user will make sense of the form much faster.

![Group related information](../static/img/ux-ui/forms/Group-related-information.webp)

## The Primary Button

### Set a System's Stylistic Tone

A button is the purest atomic expression of a system's visual style. It combines the 'big three' attributes— color, typography, and iconography — into a non-splittable atomic part. Buttons also provoke discussion of space: padding inside (particularly, to a label's left and right) and margin outside (adjacent to other elements). Ultimately, button can even surface more esoteric attributes like roundedness (via border-radius) and lift (via box-shadow).

Takeaway: Embrace the button as a leading representation of a system's style. Bonus points if you align a button's definition with a burgeoning set of token variables for color, size, space, and other fine details.

![Set a System's Stylistic Tone](../static/img/ux-ui/button/Set-System-Stylistic-Tone.webp)
Buttons pack in a wide range of attributes for such a simple element.

### Set a Verbal Tone, Too

Fortunately, 'Click Here' is in our past. But we still need answers: How long can button labels be? Are labels written in the imperative (such as 'Save' or 'Close')? Should I pair a verb ('Save') with an object type ('Document')? Are there preferred labels for common actions? Do we inject a brand voice…or not?

Takeaway: Jumpstart a consistent voice by including label guidance where I find button assets. Sure, a word lists and deep editorial standards can be found in documentation like a Voice and Tone guide. However, buttons are a great place to start bridging guidance together.

![Set a Verbal Tone, Too](../static/img/ux-ui/button/Set-Verbal-Tone-Too.webp)

### Invert Buttons When Backgrounds Get Complicated

Most buttons work just fine on a white background. But what happens when you place it on a photograph? Or a different, darker background color? Heck, are you even allowed to put it on a light neutral color? Can you use a button anywhere? Can you change the color of a primary button?

Takeaway: Demonstrate viable backgrounds for your primary button, and codify an inverted alternative — white? a different color? semitransparent? — to apply when backgrounds darken. When documenting, show light and dark alternatives on a range of common backgrounds to drive the point home.

![Invert Buttons When Backgrounds Get Complicated](../static/img/ux-ui/button/Invert-Buttons-When-Backgrounds-Get-Complicated.webp)
Show buttons a on variety of backgrounds, good and bad

### Limit One Per Page, Unless Repeating a Primary Action

Buttons call for action. We often use a primary button to draw attention to a page's highest priority action. Until, we can't prioritize and there's a bunch of primary buttons littered throughout a page (hopefully they're consistent, right?).

In some cases, using a primary button is appropriate when you must choose from a parallel set of objects (like a stack of media objects in search results) or a settings page layout presents categories of options in equivalent modular regions.

Takeaway: Define when to use — and when to avoid — more than one primary button on a page.

![Limit One Per Page, Unless Repeating a Primary Action](../static/img/ux-ui/button/Limit-One-Per-Page-Unless-Repeating-Primary-Action.webp)

### Design and Build a Button's Arc of Interaction

Buttons are the primitive interaction, and with interaction comes change. It's not good enough to present a developer 'Here's the button design!' by just showing how it looks when a page loads. Instead, it's up to the designer to show how a button appears across many states: default, hover, focused ('haloed'), pressed / active, and even a spinning waiting or animated progression.

Takeaway: Pair a live demo (just embed the button on the page!) with a gallery that shows the states without requiring readers to interact. Documentation isn't a treasure hunt. Bonus points for including a video demo like Material Design does.

![Design and Build a Button's Arc of Interaction](../static/img/ux-ui/button/Design-and-Build-Button-Arc-of-Interaction.webp)

### Be Resilient to Mixed Elements

**Pairing a button label with an icon reinforces meaning and quickens recognition.**

Hold on! I thought buttons were a label in predictably clickable region. When you add an element, even a simple icon, a button layout shouldn't break down. Coping with less predictable elements reveals pesky issues of spacing and alignment inside. You'll wanna smooth these out, particularly if buttons can contain labels, icons, and other stuff.

Takeaway: Craft buttons to be resilient to including additional elements, whether in code or design tools. Users will want to add things — icons, labels, whatevers — and not worry about consequences of space and alignment. Set them up for success by doing that work for them.

![Be Resilient to Mixed Elements](../static/img/ux-ui/button/Be-Resilient-to-Mixed-Elements.webp)

## The Secondary Buttons

### Ensure Secondary `≠` Disabled

No one yearns for gray buttons.

But you may find yourself needing to pair a secondary option with that inviting, saturated primary. You avoid a second saturated color, because that results in two saturated buttons next to one another, like green for Save and blue for Submit. Not even you, let alone your users, know which is more important.

So, you opt for a neutral. And the neutral is nearly or completed gray. And it looks disabled. Worse, when the primary is disabled, it's now also gray. Next to your gray secondary. Sigh.

Takeaway: Solve for the secondary button colors and disabled states in concert. Make sure all your options work well together and none are inaccessible.

![Ensure Secondary ≠ Disabled](../static/img/ux-ui/button/Ensure-Secondary-Disabled.webp)

### Beware of Ghosts in the Machine

Ghost buttons rely on only a border and label of the same color while lacking a background fill. Behind that label rests an uncertain future. Sometimes the label is on white (yes, that's easy!). However, other times a flat color or visually rich photo make the label difficult to read.

Ghosts allure designers coveting a sophistication absent from chunky, higher contrast primary button. Yet, these are called Ghosts for a reason. They disappear. I've observed ghost buttons donning a cloak of invisibility in usability test after usability test. Participants don't see them or can't read them. This weakens or destroys a button's value in affording action we intend.

Takeaway: Inject Ghost buttons into a system at your own peril. Studies I've observed suggest that ghosts perform poorer than filled counterparts. Plus, you might just avoid hours spent listening to polarizing designer debates on the subject.

![Beware of Ghosts in the Machine](../static/img/ux-ui/button/Beware-of-Ghosts-in-the-Machine.webp)

## Additional Button Types

### Vary Size, Both Large (or Mega/Huge/Puffy) & Small (or Micro/Tiny)

Interactions can be found in tight spots like a Card object or sidebar module. Other times, you need a massive button to sit on a full-bleed photo dominating the viewport.

Takeaway: Provide tooling to tune button size down and up as needed, as simple as another CSS class or design software style. Also, consider more memorable names — like 'Puffy' or 'Micro' — rather than a bland 'Large' or 'Small.'

![Vary Size, Both Large (or Mega/Huge/Puffy) & Small (or Micro/Tiny)](../static/img/ux-ui/button/Vary-Size-Both-Large-Mega-Huge-Puffy-Small%20-Micro-Tiny.webp)

### Distinguish Buttons from Links

In the era of flat designs, systems like Material Design use a 'Flat' button variant for use as in toolbars, dialog action groups, and inline near text. In a default state, there's little to no visual difference from a link. However, a button's states and behaviors bring a whole host of distinct considerations from your simple anchor tag.

Takeaway: If your system offers a flat variant, be sure it's conventional use — in both design and code — is distinguished from links. Additionally, cover all the interactive complexity such as focus & press states, spacing, and alignment.

![Distinguish Buttons from Links](../static/img/ux-ui/button/Distinguish-Buttons-from-Links.webp)

### Enrich Variety with Menus & Zones

Richer buttons can trigger an associated menu panel with options to choose. Many systems offer multiple choices as a UI tightens up, such as menu (or dropdown) and split (or segmented) button.

A menu button either indicates a current selection (such as Arial as font family) or opens to a menu of independent options (such as Share and Print). Add a arrow icon on the right, and you've got an extra segmented zone to drop a menu from the right while the left label fires a separate, primary action.

Takeaway: Enrich your apps with options for button menuing, but cautiously. Such buttons and their zonal segmentation (left for dominant action, right for menuing) support many scenarios, but with a higher cost of code and guidance complexity. For simpler sites, don't distract build priorities with these less-used alternatives.

![Enrich Variety with Menus & Zones](../static/img/ux-ui/button/Enrich-Variety-with-Menus-Zones.webp)

### From Toggles to Toolbars, Make Buttons Play Nice Together

Buttons can come in groups. A button group pairs a primary with one or more secondary options. A toggle button many turn on and off (such as bold) or reveal a choice from a set of options (such as text alignment's options for left, right, center, and justified). At it's most expansive, a toolbar arrange many types, all together: primary, secondaries, toggles, menus, the works.

Takeaway: When expanding button variety, explore and stress-test button sets in compact spaces and with varied combinations. System designers aren't fortune tellers, able to predict the future. But exploring a reasonably diverse scenarios can help you avoid an abomination or two down the road.

### For Buttons, Use `<button>`

There's a treasure trove of good learning about coding buttons correctly. The CSS Tricks article [When to Use the Button Element](https://css-tricks.com/use-button-element/) (and it's robust and lively discussion) is a great place to start.

### Location and Order

Mind the order and position of buttons. The order that buttons go in, especially if there are corresponding pairs (such as 'previous' and 'next') is important. Ensure the design puts emphasis on the primary or most important action.

In example below we use red for the button that performs a potentially destructive action. Notice how the primary action is not only stronger in colour and contrast, but also is on the right hand side of the dialog.

![Location and Order](../static/img/ux-ui/button/Location-and-Order.webp)
'Delete' button is more prominent than 'Cancel' button.

## Input Fields

### Obscure design deters action

The input field is an affordance. Without an explicit visual cue, a user may not understand where the input area is and fail to enter information accurately.

![Obscure design deters action](../static/img/ux-ui/input/Obscure-design-deters-action.webp)

### Field width communicates what's required

The size of the input communicates the length of the content needed. In the left design in the above illustration, the 'Zip Code' field width communicates to the user that the basic version of the zip code is needed. The design on the right presents an arbitrary length, which confuses the user on what is required (ex. 94887-3829 vs. 94887).

The design on the left works well for U.S. addresses and should be localized to other countries. If the country is not known, it is better to use the generic design on the right. For more information on localization and internationalization read, [Form Internationalization Techniques.](https://medium.com/ohapollo/form-internationalization-techniques-3e4d394cd7e5)

![Field width communicates what's required](../static/img/ux-ui/input/Field-width-communicates-what-required.webp)

### Structure communicates format

The structure of an input communicates the required format. The designs on the right in the above image makes it clear how the entry should be formatted and guides the user when doing so.

The top design on the right employs an input mask on focus. This implementation benefits from the blank input acting as an affordance and guides entry when a user clicks into the input field. This aids user understanding and reduces the chance of an erroneous entry.

Again, it is important to note that the design on the right is structured for U.S. phone numbers. It should be localized to the user's respective country. If the country is not known, it is better to use the generic design on the right.

![Structure communicates format](../static/img/ux-ui/input/Structure-communicates-format.webp)

### Placeholder text causes confusion

[Placeholder text](https://www.nngroup.com/articles/form-design-placeholders/) diminishes the visual cue for action. It also misleads users to think the placeholder text is an entry. For more thoughts on Placeholder text, read [Alternatives to Placeholder Text.](https://uxdesign.cc/alternatives-to-placeholder-text-13f430abc56f#.e1kf5fc45)

![Placeholder text causes confusion](../static/img/ux-ui/input/Placeholder-text-causes-confusion.webp)
