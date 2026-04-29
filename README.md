# FLANEUR

**Ideas meeting on the street.**

Flaneur turns your markdown notes into pixel people walking through a city. When two people bump into each other, Claude generates a surprising new idea from combining their notes. It's a creative collision engine for your second brain.

![Flaneur screenshot](screenshot.png)

## How it works

1. Point it at a folder of markdown files
2. Each note becomes a pixel person walking along a street
3. When two people randomly bump into each other, Claude Opus 4.6 generates a new idea from their collision
4. Ideas are pushed to their boundaries using Margaret Boden's computational creativity framework — no small variations, only structurally distant surprises

## Install

```
pip install .
```

## Usage

```
export ANTHROPIC_API_KEY=sk-ant-...
flaneur walk
```

Open `http://127.0.0.1:7773` — pick your notes folder in the browser and click **Let the notes out**.

Or point it at a folder directly:

```
flaneur walk ~/Documents/MyVault
```

### Controls

- **Pause/Resume** — pause the street
- **Skip** — jump to the next collision
- **Crowd** — more or fewer people on the street
- **Change Folder** — switch to a different set of notes

## Requirements

- Python 3.10+
- An [Anthropic API key](https://console.anthropic.com/)

## What can I point it at?

Any folder of `.md` files:

- Obsidian vaults
- Roam exports
- Bear exports
- A folder of notes you keep in iCloud/Dropbox
- Any collection of markdown files

## The creativity prompt

Every collision uses a prompt inspired by Margaret Boden's computational creativity research:

> Stay within the same formal system, but explore its boundaries. Push assumptions to extreme limits. Consider negations. If an idea could be reached by a small parameter tweak, discard it and go further.

The result: ideas that are structurally distant from the originals but still grounded in what your notes actually say.

## License

MIT
