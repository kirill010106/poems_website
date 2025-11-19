# AI Coding Instructions - Сборник Стихов (Poetry Collection)

## Project Overview
Static Russian poetry website with Bootstrap, jQuery, and a vanilla JS component architecture. Multi-page SPA-like experience using client-side routing and dynamic HTML includes. No build process - runs directly in browser.

## Architecture Patterns

### Component Loading System
All pages use `load-components.js` to dynamically inject shared components:
- Header/footer loaded via jQuery `.load()` from `/includes/`
- Script dependencies loaded in specific order: `favorites.js` → header → footer
- Page loader displays minimum 300ms to prevent flash
- Always wait for `favoritesDataLoaded` event before manipulating favorites counter

```javascript
// Example from load-components.js
componentsLoaded = { header: false, footer: false, favorites: false };
```

### Data Management Layer
`PoemsManager` class (`scripts/poems-manager.js`) is the single source of truth:
- Singleton pattern - initialize once with `await poemsManager.loadData()`
- JSON data sources: `poems.json` (30 poems), `poets.json` (9 poets), `facts.json` (20 facts)
- All pages that use poem/poet data must load this script and call `.loadData()` before rendering
- Fires `poemsDataLoaded` custom event when ready

### Favorites System
`FavoritesManager` class (`scripts/favorites.js`) manages localStorage state:
- Stores poem/poet IDs separately: `{ poems: [], poets: [] }`
- Fires `favoritesChanged` custom event on all mutations
- Header counter updates reactively via event listener
- Must be loaded BEFORE header to prevent undefined function errors

### Theme System
Theme switcher (`scripts/theme.js`) runs in two phases:
1. **Immediate (IIFE before DOM)**: Reads `localStorage.getItem('theme')` and sets `data-theme` attribute on `<html>` to prevent FOUC
2. **DOM Ready**: `initTheme()` function attaches event listeners to `#theme-toggle` button

CSS uses `[data-theme="dark"]` attribute selectors throughout. Never use class-based theming.

## Critical Conventions

### File Paths
- All asset paths are **absolute from root** (`/img/`, `/scripts/`, `/pages/`)
- Pages in `/pages/` reference scripts as `../scripts/` - maintain this pattern
- Images in `/img/poets/` named by poet ID: `{poetId}.png` (e.g., `pushkin.png`)

### HTML Structure
- Every page needs: page loader div, header/footer placeholders, identical script loading order
- Script order matters: `theme.js` → `bootstrap.bundle.js` → `jquery-3.7.1.min.js` → `poems-manager.js` → `load-components.js`
- Use Bootstrap 5 utilities extensively - avoid custom CSS for layout

### Russian Language
- All UI text, comments, and data is in Russian (Cyrillic)
- Use proper Russian typography: em-dashes (—), quotes («»)
- Poet names follow "Имя Фамилия" format without patronymic in display

## Special Features

### Easter Egg System
Clicking Pasternak's photo 3 times in `poet-detail.html` transforms him into Till Lindemann (Rammstein):
- Hardcoded mock data in `tillLindemannData` object within page script
- Requires `/img/poets/lindemann.png` and `/audio/rammstein-intro.mp3` (see respective README files)
- CSS class `.easter-egg-hint` adds pulsing animation as visual clue
- Transformation is temporary - resets on page navigation

### Dynamic Poet Photos
`scripts/download-poets-photos.js` is a Node.js utility (not browser script) to fetch poet photos from Wikimedia Commons:
- Run manually: `node scripts/download-poets-photos.js`
- Downloads to `/img/poets/` with poet ID as filename
- Not part of build process - one-time setup tool

## Developer Workflows

### Adding New Poets
1. Add entry to `data/poets.json` with unique `id` field
2. Obtain photo (800px recommended) and save as `/img/poets/{id}.png`
3. Optionally add poems with matching `authorId` field in `data/poems.json`

### Adding New Pages
1. Copy structure from existing page (e.g., `pages/poets.html`)
2. Ensure script load order matches other pages exactly
3. Add navigation link to `includes/header.html` with `data-page` attribute matching filename
4. Use `setActiveNavLink()` (from `load-components.js`) for nav highlighting

### Testing Locally
- Use VS Code Live Server or any static file server
- Root must be project directory for absolute paths to work
- No compilation or bundling needed - edit and refresh browser

## Data Schema Reference

### Poems (`data/poems.json`)
- `id` (number), `title`, `author`, `authorId` (links to poet), `year`, `text`, `tags[]`, `mood`
- Moods: `melancholic`, `joyful`, `philosophical`, `romantic`, `patriotic`, `mysterious`

### Poets (`data/poets.json`)
- `id` (string), `name`, `fullName`, `birthYear`, `deathYear`, `image`, `description`, `bio`, `period`, `style`, `famousWorks[]`

### Facts (`data/facts.json`)
- `id` (number), `text`, `category` (poet, literature, interesting)

## Common Pitfalls
- Don't call `updateFavoritesCounter()` before `favorites.js` loads - wait for component ready
- Never use relative paths like `./img/` - always absolute `/img/`
- Theme toggle won't work if `initTheme()` called before DOM ready
- PoemsManager methods return empty arrays if `.loadData()` not awaited first
