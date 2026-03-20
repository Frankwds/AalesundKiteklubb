## ADDED Requirements

### Requirement: Admin can open kite zone editor from spot form

The system SHALL provide a button labeled **Skraver områder** on the admin spot create/edit form, placed **above** the Bilde section. Activating it SHALL open a modal dialog.

#### Scenario: Open editor

- **WHEN** an admin clicks **Skraver områder**
- **THEN** a modal opens containing the map editor UI with **Avbryt** and **Lagre** actions

---

### Requirement: Modal commits zones into the spot form, not Supabase directly

The system SHALL keep edited zone data in client state (or hidden form fields) until the parent spot form is submitted. **Lagre** on the modal SHALL close the modal and apply the current editor state to that pending spot payload. **Avbryt** SHALL discard modal-local edits since open (or restore state as of last **Lagre**), per standard dialog cancel semantics.

#### Scenario: Lagre updates pending spot data

- **WHEN** the admin clicks **Lagre** in the zone modal
- **THEN** the modal closes and the spot form holds the zone data for the next spot save

#### Scenario: Avbryt does not alter last committed modal state

- **WHEN** the admin clicks **Avbryt** after making unsaved-in-modal changes
- **THEN** those changes are not applied to the pending spot payload

---

### Requirement: Admin creates polygons with color and tag

The system SHALL show, **above** the map, a **collapsible** panel (default **expanded** on first open) containing: a **color** control (red, yellow, green), a **tag** text input (single-line, admin-defined meaning), and a **create** action. Creating SHALL append a new polygon to the list with that color and tag, assign it a stable client id, **select** it automatically, and initialize an empty vertex list.

#### Scenario: New polygon is selected

- **WHEN** the admin creates a polygon
- **THEN** that polygon becomes the selected polygon

---

### Requirement: Admin selects and deletes polygons from a list

The system SHALL list all polygons in the collapsible panel. Each row SHALL allow **selecting** the polygon and **deleting** the entire polygon (vertices, tag, color). Only one polygon SHALL be selected at a time.

#### Scenario: Select switches active editing target

- **WHEN** the admin selects a different polygon in the list
- **THEN** subsequent map vertex operations apply to that polygon

#### Scenario: Delete removes polygon

- **WHEN** the admin deletes a polygon from the list
- **THEN** it is removed from editor state and from the map overlay

---

### Requirement: Map interaction for vertices (mobile-first)

The modal SHALL embed an interactive **Google Map** (zoomable, pannable). For the **selected** polygon only: a **click/tap** on the map (not on an existing vertex) SHALL append a vertex at that location. A **click/tap** on an existing vertex SHALL remove that vertex. A **pointer drag** that **starts** on a vertex SHALL move that vertex; a drag that does **not** start on a vertex SHALL pan the map.

#### Scenario: Add vertex

- **WHEN** the admin taps the map away from vertices while a polygon is selected
- **THEN** a new vertex is added to the selected polygon in list order

#### Scenario: Remove vertex

- **WHEN** the admin taps an existing vertex marker
- **THEN** that vertex is removed from its polygon

#### Scenario: Drag vertex vs pan

- **WHEN** the admin begins a drag on a vertex
- **THEN** the vertex position updates with the drag
- **WHEN** the admin begins a drag on empty map
- **THEN** the map pans

---

### Requirement: Polygon visualization reflects selection and stack order

The system SHALL render each polygon with a semi-transparent fill and stroke. The **selected** polygon SHALL use **higher** fill opacity and a **thicker** stroke than non-selected polygons (concrete values as implemented in design). **Global** stack order SHALL follow creation order such that polygons created later draw **above** earlier ones.

#### Scenario: Selected emphasis

- **WHEN** the admin selects a polygon
- **THEN** that polygon appears visually more prominent than others

---

### Requirement: Initial map view

When the modal opens, the map SHALL be centered on the spot’s **latitude/longitude** if both are set; otherwise on the application’s existing default map center. If saved zones exist, the map SHALL **fit bounds** to include all polygon vertices (and optionally the spot pin). If there are no saved zones, an appropriate default zoom (consistent with existing admin maps, e.g. ~12) MAY be used until the user navigates.

#### Scenario: Existing zones fitted

- **WHEN** the modal opens and the spot has stored polygons with vertices
- **THEN** the viewport includes all vertices

---

### Requirement: Spot save persists zones JSON to Supabase

On successful **spot** create/update, the system SHALL persist zone data as JSON on the spot row (column agreed in implementation). The JSON SHALL include `schemaVersion` and a GeoJSON-compatible **FeatureCollection** (or equivalent documented shape) where each feature represents one polygon with properties including **id**, **color** (`red` | `yellow` | `green`), **tag**, and geometry type **Polygon** with a single exterior ring (closed loop). Coordinates SHALL be WGS84 (lng/lat per GeoJSON).

#### Scenario: Update spot writes zones

- **WHEN** an admin submits the spot form with valid zone data
- **THEN** the spots row stores the JSON payload

---

### Requirement: Validation on spot save for incomplete polygons

If the submitted zone payload includes any polygon with **fewer than three** vertices, the system SHALL **reject** the spot save and surface a **clear** error to the admin (no silent removal of incomplete polygons).

#### Scenario: Too few vertices

- **WHEN** the spot form is submitted with a polygon that has 0–2 vertices
- **THEN** the save fails and the user sees an explanatory message

---

### Requirement: Optional zones — empty allowed

The system SHALL allow saving a spot with **no** polygons (null/empty zones). This SHALL not block spot create/update.

#### Scenario: No zones

- **WHEN** the admin clears all polygons or never creates any
- **THEN** spot save succeeds and the stored zones field is empty/null

---

### Requirement: Public spot page shows static map with zones

The public spot detail page SHALL render a **Google Static Map** image when a valid API key is configured. **When** zone data exists with at least one polygon with ≥3 vertices, the image SHALL include those polygons with colors matching the admin choices and SHALL use a viewport that **fits** all polygon vertices (and the spot location). **When** no such polygons exist but the spot has coordinates, the image SHALL show the spot at **zoom 11**. **When** neither zones nor coordinates exist, the static map section MAY be omitted or show only a placeholder per existing site patterns.

#### Scenario: Zones visible

- **WHEN** a visitor views a spot with stored polygons
- **THEN** they see a static map image including the polygons

#### Scenario: No zones but has coordinates

- **WHEN** a visitor views a spot with coordinates and no polygons
- **THEN** they see a static map centered on the spot at zoom 11

#### Scenario: Static map is not interactive

- **WHEN** a visitor taps the static map image
- **THEN** no navigation or app action occurs (display-only)

---

### Requirement: Tag constraints

Per-polygon tags SHALL be **single-line** text with a **maximum length** enforced at validation (recommended 80–120 characters in implementation). Empty tags SHALL NOT be allowed for polygons that are included in the saved payload with ≥3 vertices.

#### Scenario: Tag required for complete polygon

- **WHEN** a polygon has at least three vertices and is saved with the spot
- **THEN** its tag is non-empty after trim
