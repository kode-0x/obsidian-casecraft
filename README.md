<div align="center">

# Casecraft

Convert pasted text to Capitalized Case in Obsidian while preserving LaTeX and user-defined words.

![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-7C3AED?logo=obsidian&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

## Overview

Casecraft is a self-contained Obsidian plugin that transforms text to Capitalized Case, where the first letter of every word is uppercased and the rest are lowercased. It runs entirely inside Obsidian with no backend, network calls, or API keys.

The transform can run automatically on paste or on demand through a command. LaTeX math and a user-defined list of words are left untouched.

This is a no-build plugin: `main.js` is plain JavaScript that Obsidian loads directly. There is no TypeScript source, bundler, or `npm install` step.

## Features

- **Capitalized Case transform.** Uppercases the first letter of each word and lowercases the rest.
- **LaTeX preservation.** Inline (`$...$`) and block (`$$...$$`) math segments pass through unchanged.
- **Word exclusions.** Words listed in settings are matched exactly and left as written.
- **Transform on paste.** Converts clipboard text as it is pasted into the editor. Can be toggled off.
- **Command for selected text.** Run `Casecraft: Capitalize selected text` to transform the current selection.

## How It Works

Text is split on LaTeX delimiters so math segments are never modified. In the remaining text, each word is matched by its letters and digits, leaving surrounding punctuation in place. A word that matches the exclusion list exactly is kept as written; every other word is converted to Capitalized Case.

## Example

Input:

```text
this is a sample heading with API and AI.
the formula is $e^{i\pi} + 1 = 0$.
```

Output with `API` and `AI` excluded:

```text
This Is A Sample Heading With API And AI.
The Formula Is $e^{i\pi} + 1 = 0$.
```

## Configuration

Open **Settings → Community plugins → Casecraft** to configure:

- **Transform on paste.** Toggle automatic conversion when pasting. When off, the command remains available.
- **Excluded words.** One word per line. Matching is exact and case-sensitive, so `AI` is preserved while `ai` is not.

Settings are persisted to `data.json` in the plugin folder.

## Installation

1. Create a `casecraft` folder inside your vault at `.obsidian/plugins/casecraft/`.
2. Copy `main.js`, `manifest.json`, and `styles.css` into that folder.
3. In Obsidian, go to **Settings → Community plugins**, reload installed plugins, and enable **Casecraft**.

No build or install step is required. To iterate, edit `main.js` directly and reload the plugin (disable and re-enable it, or run **Reload app without saving** from the command palette).

## Project Structure

```text
casecraft/
├── main.js        Plugin code (plain JavaScript, loaded directly by Obsidian)
├── manifest.json  Obsidian plugin manifest
├── styles.css     Plugin styles
└── data.json      Saved settings (written by Obsidian)
```

## Compatibility

- Obsidian Desktop
- Obsidian Mobile, subject to plugin API compatibility (`isDesktopOnly` is `false`)

## License

[MIT](LICENSE)
