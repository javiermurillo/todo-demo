# todo-app — arcade CRT static todo page

## Purpose

A single-page, fully client-side todo list rendered with an arcade
CRT pixel-art aesthetic (scanlines, neon palette, bitmap font). The
page must work when `index.html` is opened directly from the local
filesystem, with no server and no build step. Persistence across
reloads is intentionally out of scope; the page is a static UI
demo of the visual system plus the three minimum todo behaviors.

## ADDED Requirements

### Requirement: Add a todo

The system SHALL let the visitor type text into an input and append a
new todo item to the list by activating the Add control.

#### Scenario: Empty input is rejected

- **WHEN** the input is empty or whitespace-only AND the visitor
  activates the Add control (click or Enter)
- **THEN** no new todo item is appended
- **AND** the input retains focus

#### Scenario: Non-empty input appends one item

- **WHEN** the input contains non-whitespace text AND the visitor
  activates the Add control (click or Enter)
- **THEN** exactly one new `<li data-testid="todo-item">` appears at
  the end of the list
- **AND** the new item's text exactly matches the trimmed input value
- **AND** the new item is initially not marked done
- **AND** the input is cleared

#### Scenario: Leading and trailing whitespace is trimmed

- **WHEN** the visitor enters `"  buy milk  "` and activates Add
- **THEN** the new item's text is `"buy milk"` (no leading or
  trailing spaces)

### Requirement: Toggle a todo as done

The system SHALL let the visitor mark a todo as done and unmark it,
and the visual state SHALL change visibly.

#### Scenario: Marking done applies a visible done style

- **WHEN** a todo is in the not-done state AND the visitor activates
  its toggle control
- **THEN** the todo acquires `aria-pressed="true"`
- **AND** the todo carries a `done` class that the CSS uses to render
  it struck-through and dimmed
- **AND** the toggle control's accessible label flips to "Mark not
  done"

#### Scenario: Unmarking done restores the active style

- **WHEN** a todo is in the done state AND the visitor activates its
  toggle control
- **THEN** the todo's `aria-pressed` returns to `"false"`
- **AND** the `done` class is removed
- **AND** the toggle control's accessible label returns to "Mark
  done"

### Requirement: Delete a todo

The system SHALL let the visitor remove any individual todo from the
list.

#### Scenario: Deleting removes exactly the targeted item

- **WHEN** the visitor activates the delete control on a specific
  todo
- **THEN** exactly that todo is removed from the DOM
- **AND** no other todo is removed

#### Scenario: Deleting the last item leaves the list empty but present

- **WHEN** the list contains exactly one todo AND the visitor
  deletes it
- **THEN** the list container still exists in the DOM
- **AND** the list contains zero todo items
- **AND** the input remains focused

### Requirement: Arcade CRT visual identity

The rendered page SHALL be unmistakably styled as an arcade CRT
pixel-art interface — scanlines, neon palette, bitmap font — and
every container SHALL use hard pixel borders.

#### Scenario: Bitmap font is the rendered typeface

- **WHEN** the page is loaded
- **THEN** the computed `font-family` of `body` starts with
  `"Press Start 2P"`, `"VT323"`, or another explicitly bitmap
  font
- **AND** falls back to `monospace` if the network font fails

#### Scenario: Scanline overlay is present and non-blocking

- **WHEN** the page is loaded
- **THEN** a `::before` overlay element exists with
  `pointer-events: none` so clicks on items pass through
- **AND** the overlay is rendered above the content but below the
  pointer layer

#### Scenario: Palette uses only neon-on-near-black

- **WHEN** the page is loaded
- **THEN** the `body` background is a near-black color
  (`#0b0a1a` or darker)
- **AND** at least one neon accent (`#ff2bd6`, `#22f6ff`, or
  `#fff066`) appears on a primary control or heading

#### Scenario: Containers use hard pixel borders

- **WHEN** any container renders
- **THEN** its computed `border-radius` is `0px`
- **AND** its `image-rendering` is `pixelated`

### Requirement: Keyboard accessibility

The system SHALL be fully operable using only the keyboard.

#### Scenario: Add via keyboard

- **WHEN** the input is focused AND the visitor presses Enter
- **THEN** the behavior matches the Add control scenario above
  (one item appended, input cleared)

#### Scenario: Toggle and delete via keyboard

- **WHEN** focus is on a toggle or delete control AND the visitor
  presses Enter or Space
- **THEN** the corresponding behavior fires
- **AND** no other action fires

#### Scenario: Tab order is input → add → first toggle → first delete → …

- **WHEN** the visitor repeatedly presses Tab from page load
- **THEN** focus visits the input first, then the add control, then
  the toggle and delete of the first item in list order, and so on

### Requirement: Test hooks

The system SHALL expose stable `data-testid` attributes so a
downstream test slice can target elements without re-tagging markup.

#### Scenario: Every interactive element carries a data-testid

- **WHEN** the page is loaded
- **THEN** the input carries `data-testid="todo-input"`
- **AND** the add control carries `data-testid="todo-add"`
- **AND** the list carries `data-testid="todo-list"`
- **AND** each item carries `data-testid="todo-item"`
- **AND** each item's toggle carries `data-testid="todo-toggle"`
- **AND** each item's delete carries `data-testid="todo-delete"`