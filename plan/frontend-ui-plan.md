# Frontend UI Plan — v0.dev Prompt

Paste the prompt below into v0.dev to generate a full UI shell for the Ålesund Kiteklubb web application.

---

## Prompt

Build a complete, multi-page Next.js 15 (App Router) website for a Norwegian kite club called **Ålesund Kiteklubb**. Use **Tailwind CSS** and **shadcn/ui** components. The site must be **mobile-first** and fully responsive. Use **Inter** as the font. All UI text is in **Norwegian**.

---

### Global Design System

- **Background:** A fixed, full-viewport background image of a beach with kites in the sky (use a placeholder kite-beach photo from Unsplash). The image stays fixed while content scrolls over it.
- **Content card:** All page content sits inside an off-white (`#FAFAF8`) card/container that floats over the background. On mobile the card is full-width with horizontal padding. On desktop it is max-width centered with rounded corners and subtle shadow.
- **Colors:** Shades of blue for accents (`sky-600` primary, `sky-800` hover/active). Black text on off-white. White text on blue buttons.
- **Typography:** Inter font. Clean, minimal headings. Body text `text-base`.

---

### Sticky Navbar

Present on all pages at the top of the viewport.

- Full-width bar with a semi-transparent white/frosted-glass background and subtle bottom border.
- **Left:** Club name "Ålesund Kiteklubb" as a logo/link to home.
- **Center/Right nav items (desktop):** Hjem, Spot guide, Kurs, Logg inn (when logged out) or a user avatar dropdown (when logged in). When logged in as instructor or admin, show additional items: "Instruktør" and/or "Admin".
- **Mobile:** Collapse all nav items into a hamburger icon (top-right). Tapping it opens a **full-screen overlay** with large, stacked nav links and a close button (X) in the top-right.
- **User avatar dropdown (logged in, desktop):** Shows the user's name and role badge (Bruker / Instruktør / Admin), plus "Logg ut" link.

---

### Footer

Simple footer at the bottom of the content card. Contains:
- "© 2026 Ålesund Kiteklubb"
- Links: Facebook, Kontakt oss

---

### Page 1: Forsiden (Front Page) — route `/`

Single-page scroll layout inside the content card.

**Hero section:**
- Large hero area at the top showing the background panorama image prominently with a dark gradient overlay.
- Centered white text: large heading "Ålesund Kiteklubb" and a subtitle "Kiteklubben for Sunnmøre".
- A call-to-action button "Se kurs" (links to `/courses`).

**Om klubben section:**
- Heading: "Om klubben"
- Two-column layout on desktop (text left, image/illustration right). Single column stacked on mobile.
- Placeholder paragraph: "Ålesund Kiteklubb er en lokal kiteklubb på Sunnmøre. Vi arrangerer kurs for nybegynnere og erfarne, og har en guide til de beste kitespottene i området. Bli med i fellesskapet!"
- Links styled as buttons or prominent links: "Facebook-gruppen vår" and "Bli med i chatten".

---

### Page 2: Spot guide (Spots Listing) — route `/spots`

**Filter drawer:**
- A collapsible/expandable filter section at the top of the page (same on mobile and desktop).
- Three filter groups side by side on desktop, stacked on mobile:
  - **Sesong:** Toggle buttons or badge-style filters: "Sommer", "Vinter"
  - **Område:** Dropdown or badge filters: "Giske", "Ålesund", "Vigra", "Hareid"
  - **Vindretning:** Multi-select compass-style buttons: N, NØ, Ø, SØ, S, SV, V, NV
- A "Nullstill filtre" (clear filters) link.

**Spot card grid:**
- Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop.
- Each **SpotCard** shows:
  - Spot name (e.g. "Giske Nordvest")
  - Area badge (e.g. "Giske")
  - Season badge with color: "Sommer" (green) or "Vinter" (blue)
  - Skill level: "Nybegynner" (green badge) or "Erfaren" (orange badge)
  - A small wind compass or wind direction badges (e.g. "SV", "V")
  - Clickable — navigates to spot detail.

Show 4–6 placeholder spot cards with varied data.

**Empty state:** When no spots match filters: "Ingen spot guide matcher filtrene dine." with a "Nullstill filtre" button.

---

### Page 3: Spotdetalj (Spot Detail) — route `/spots/[id]`

A detail page for a single spot. Sections stacked vertically:

1. **Heading:** Spot name (e.g. "Giske Nordvest") with area + season badges.
2. **Vindkompass (Wind Compass):** A visual compass rose (circular, 8 directions). Favorable wind directions are highlighted in blue, others are grey/muted. Example: SW and W highlighted.
3. **Om spotten:** Heading + a paragraph of placeholder description text about the spot.
4. **Kart:** A placeholder map image (rectangular, rounded corners) representing an annotated satellite image of the spot area.
5. **Værmelding:** An external link styled as a button: "Se vær på Yr.no" (opens in new tab).
6. **Veibeskrivelse:** An external link styled as a button: "Vis i Google Maps" (opens in new tab).
7. **Nødvendige kiteskills:** A skill level badge ("Erfaren" or "Nybegynner") + a short note text: "Krever erfaring med bølger og sterk strøm."
8. **Vanntype:** Badges/tags: "Chop", "Flatt vann", "Bølger" — show 2 of these as active.

Use a back arrow/link at the top: "← Tilbake til spot guide"

---

### Page 4: Kurs (Courses) — route `/courses`

Single-page scroll layout with these sections:

**Intro section:**
- Heading: "Kurs"
- Paragraph: "Vi tilbyr kurs for alle nivåer. Våre instruktører er sertifiserte og erfarne kitere fra Sunnmøre. Kurs legges ut når forholdene ser lovende ut."

**Instruktører (Instructors) section:**
- Heading: "Våre instruktører"
- Horizontal scroll or row of instructor cards (2–3 placeholders). Each card: circular avatar photo (placeholder), name, short bio, certifications badge.

**Kommende kurs (Upcoming Courses) section:**
- Heading: "Kommende kurs"
- List of **CourseCards** (stacked vertically, full width). Each card shows:
  - Title: e.g. "Nybegynnerkurs Giske"
  - Date + time range: "12. mars 2026, 10:00–14:00"
  - Instructor name (with small avatar)
  - Spot name as a link (e.g. "Giske Nordvest")
  - Price: "1500 kr"
  - Capacity: "3 / 6 plasser"
  - **Action buttons** — show THREE variants to demonstrate all states:
    - Card 1: "Logg inn for å melde på" (muted/outline button, for logged-out state)
    - Card 2: "Meld på" button (primary blue, for logged-in not-enrolled). Plus a small enroll confirmation dialog mockup.
    - Card 3: "Meld av" button (outline/destructive) + "Chat" button (secondary). For enrolled state.
- **Empty state variant:** A muted text block: "Kurs legges ut når forholdene ser lovende ut, ikke langt i forkant." with a "Få varsler om nye kurs ↓" link.

**Enroll Confirmation Dialog (show as an open dialog overlay on one card):**
- Heading: "Meld på kurs"
- Text: "Du vil bli meldt på kurset «Nybegynnerkurs Giske». En bekreftelse sendes til:"
- Email field (display-only, greyed out): "ola.nordmann@gmail.com"
- Two buttons: "Avbryt" (outline) and "Meld på" (primary blue).

**Abonner section (Subscribe):**
- Heading: "Få varsler om nye kurs"
- Text: "Meld deg på for å få e-post når nye kurs legges ut."
- Button: "Abonner" (primary blue). Show a variant with "Avslutt abonnement" (outline) for already-subscribed state.

---

### Page 5: Kurschat (Course Chat) — route `/courses/[id]/chat`

A full-height chat interface within the content card.

- **Header bar:** Course title (e.g. "Nybegynnerkurs Giske") with a back arrow "← Tilbake til kurs".
- **Message list:** Scrollable area taking up available height. Show 6–8 placeholder messages. Each **MessageBubble** has:
  - Small circular avatar on the left
  - Name in bold (e.g. "Ola Nordmann") and timestamp on the right (e.g. "14:32")
  - Message text below the name
  - Messages from the current user are right-aligned with a blue background. Others are left-aligned with a grey/white background.
- **Message input:** Fixed at the bottom. A text input field with placeholder "Skriv en melding..." and a send button (arrow icon, blue).

---

### Page 6: Admin Dashboard — route `/admin`

A tabbed interface using shadcn/ui `Tabs`. Five tabs:

**Tab: Instruktører**
- DataTable with columns: Navn, E-post, Sertifiseringer, Opprettet
- "Legg til instruktør" button above the table → opens a Dialog with a user search/select field.
- Row actions: "Fjern" with a destructive confirmation dialog.
- Show 3 placeholder rows.

**Tab: Kurs**
- DataTable with columns: Tittel, Dato, Spot, Instruktør, Deltakere, Status
- Status column shows "Kommende" (green badge) or "Tidligere" (grey badge).
- Row actions: Rediger, Slett, Vis deltakere (opens dialog with participant list + remove buttons).
- Show 4 placeholder rows.

**Tab: Spot guide**
- DataTable with columns: Navn, Sesong, Område, Nivå, Vanntype
- Season/area filter dropdowns above the table.
- "Ny spot" button → Dialog with a full form (name, description, season select, area, wind direction multi-select, map image upload area, coordinates, skill level, skill notes, water type multi-select).
- Row actions: Rediger, Slett.
- Show 3 placeholder rows.

**Tab: Abonnenter**
- DataTable with columns: E-post, Navn, Abonnert siden
- Read-only, no actions.
- Show 5 placeholder rows.

**Tab: Brukere**
- DataTable with columns: Navn, E-post, Rolle, Opprettet
- Role column shows a dropdown select (Bruker / Instruktør / Admin) with the current role pre-selected.
- One row should have the dropdown disabled with a tooltip: "Du kan ikke endre din egen rolle".
- Show 5 placeholder rows with mixed roles.

---

### Page 7: Instruktør Dashboard — route `/instructor`

A tabbed interface with two tabs:

**Tab: Profil**
- A form to edit the instructor's own profile:
  - Circular photo upload area with current photo and "Bytt bilde" button
  - Bio (textarea)
  - Sertifiseringer (text input)
  - Års erfaring (number input)
  - Telefon (text input)
  - "Lagre" button (primary blue)

**Tab: Mine Kurs**
- DataTable with columns: Tittel, Dato, Spot, Deltakere, Handlinger
- "Nytt kurs" button → Dialog with course form:
  - Tittel (text input)
  - Beskrivelse (textarea)
  - Pris (number input with "kr" suffix)
  - Dato (date picker)
  - Starttid (HH:MM time input)
  - Sluttid (HH:MM time input)
  - Maks deltakere (number input)
  - Spot (searchable dropdown/combobox with spot names)
  - "Avbryt" and "Opprett kurs" buttons
- Row actions: Rediger, Slett, Vis deltakere
- Show 3 placeholder rows.

---

### Page 8: Logg inn (Login) — route `/login`

Centered card within the content area.
- Heading: "Logg inn"
- Subtext: "Logg inn med Google for å melde deg på kurs og delta i kurschat."
- A single large button: Google icon + "Logg inn med Google" (white background, dark border, Google colors on icon).
- Below: "Tilbake til forsiden" link.

---

### Page 9: 404 Not Found

Centered content:
- Large "404" number
- Heading: "Siden finnes ikke"
- Subtext: "Beklager, vi finner ikke siden du leter etter."
- Button: "Tilbake til forsiden" (primary blue)

---

### Page 10: Error Page

Centered content:
- Icon: warning/error icon
- Heading: "Noe gikk galt"
- Subtext: "En uventet feil oppstod. Prøv igjen senere."
- Button: "Prøv igjen" (primary blue)

---

### Important Design Notes

- Every page uses the same global layout: fixed kite-beach background, off-white content card, sticky navbar, footer.
- All interactive elements (buttons, cards, inputs) must have visible focus states and be touch-friendly (min 44px tap targets).
- Use shadcn/ui components throughout: Button, Card, Dialog, Tabs, Table, Input, Textarea, Select, Badge, Avatar, DropdownMenu, Sheet (for mobile nav), Combobox.
- Dialogs should have clear "Avbryt" (cancel) and confirmation buttons.
- Forms should show a loading spinner on the submit button during submission (use the Loader2 icon with `animate-spin`).
- Cards should have subtle shadows and rounded corners (`rounded-lg`).
- The overall feel should be clean, modern, Scandinavian — lots of white space, minimal decoration, nature-inspired through the background imagery.
