# Olayinka.xyz design direction

## Three possible directions

### Theme Name: Quiet Field Notes
Very brief intro: A monospaced personal archive that treats work, records, places, and small tools as annotated field notes. Intimate, specific, and deliberately low-noise.
Probability: 0.07

### Theme Name: Soft Index
Very brief intro: A pale editorial index with restrained rules, compact labels, and a subtle paper-and-library feeling. Calm, ordered, and slightly archival.
Probability: 0.04

### Theme Name: Signal / Rest
Very brief intro: A sparse black-and-white interface with one electric signal colour for active states and a sharper utility-tool rhythm. Focused and quietly technical.
Probability: 0.02

## Chosen approach: Quiet Field Notes

### Design Movement
Contemporary digital field notes: the text-first discipline of a plain-text notebook combined with the editorial annotation of a personal archive.

### Core Principles
1. **Authored over ornamental:** Every label, route, and interaction should tell the visitor why this thing belongs here.
2. **Quiet hierarchy:** Use scale, weight, whitespace, and small index labels rather than decoration to guide attention.
3. **Physical references, digital restraint:** Vinyls can feel tactile; Places can feel mapped; both remain lightweight and accessible.
4. **Progressive disclosure:** Keep the first view calm and let details appear through deliberate interaction.

### Color Philosophy
Soft blue is the signature highlight because it feels like a selected line in a working document: calm, legible, and personal. Neutral ink and paper tones carry most of the interface. Travel data may use warm yellow as a contained secondary signal, but yellow must not become a global accent.

### Layout Paradigm
A left-anchored editorial column with quiet index markers and occasional full-width archive surfaces. Avoid generic centered cards; collection pages should read like shelves, ledgers, and maps.

### Signature Elements
- A small `OT / FIELD NOTES` index mark at the start of key pages.
- Short authored annotations beside collection titles and tools.
- Blue selection blocks for active routes, inline links, and text-like emphasis.

### Interaction Philosophy
Interactions should feel like opening a note or selecting a line in an archive: direct, reversible, keyboard-friendly, and never dependent on hover alone.

### Animation
Use short opacity and translate transitions only when they clarify arrival or disclosure. Respect `prefers-reduced-motion`; no looping movement or decorative parallax.

### Typography System
Use JetBrains Mono (with the existing system fallbacks) throughout. Use a bold 16–18px page title, 10px uppercase index labels with letter spacing, and 12–14px body copy at 1.7–1.8 line height. Active labels may use the soft-blue selection block.

### Brand Essence
A personal field-notes archive for people curious about how Olayinka builds, listens, travels, and experiments. Personality: **observant, plainspoken, lightly dry**.

### Brand Voice
Headlines are compact and concrete. CTAs describe the action rather than selling it. Microcopy sounds like a note from the person who made the collection.

Example lines:
- “A few records I keep returning to.”
- “Places I’ve been, with one fact worth keeping.”

### Wordmark & Logo
Use the text mark `OT / FIELD NOTES` in the existing monospace system, with `OT` set bold and the slash acting as a filing mark. It is a typographic mark, not a default wordmark treatment.

### Signature Brand Color
**Archive Blue `#e0f2fe`** — the colour of a selected line, used for active navigation, inline links, and authored emphasis.

## Style Decisions

- Preserve the homepage’s white space and text-first composition while adding a quiet index label and stronger title hierarchy.
- Keep blue as the site-wide signature; reserve yellow for the Places map and travel-specific data.
- Give every collection/tool page one short authored framing note.
- Keep the Vinyls page physical and tactile through CSS, without adding a heavy 3D dependency.
- Use semantic controls, visible focus, and reduced-motion behavior as part of the visual language, not as afterthoughts.
