"""Read markdown files and build a note index."""

import hashlib
import json
import re
from pathlib import Path


def read_markdown_files(vault_path: Path) -> list[dict]:
    """Read all markdown files from a directory, recursively."""
    notes = []
    for md_file in sorted(vault_path.rglob("*.md")):
        try:
            content = md_file.read_text(encoding="utf-8", errors="replace")
        except (FileNotFoundError, OSError):
            continue  # skip iCloud placeholders or unreadable files
        if not content.strip():
            continue
        rel_path = md_file.relative_to(vault_path)
        title = extract_title(content, md_file.stem)
        content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
        notes.append({
            "id": content_hash,
            "path": str(rel_path),
            "title": title,
            "content": content,
        })
    return notes


def extract_title(content: str, fallback: str) -> str:
    """Extract title from first H1 heading, YAML frontmatter, or filename."""
    # Check YAML frontmatter
    fm_match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if fm_match:
        for line in fm_match.group(1).splitlines():
            if line.startswith("title:"):
                return line.split(":", 1)[1].strip().strip("\"'")

    # Check first H1
    h1_match = re.match(r"^#\s+(.+)", content, re.MULTILINE)
    if h1_match:
        return h1_match.group(1).strip()

    return fallback


def ingest(vault_path: Path) -> dict:
    """Read notes and build index. No embeddings needed."""
    notes = read_markdown_files(vault_path)
    if not notes:
        raise ValueError(f"No markdown files found in {vault_path}")

    notes_meta = []
    for note in notes:
        notes_meta.append({
            "id": note["id"],
            "path": note["path"],
            "title": note["title"],
            "preview": note["content"][:500],
        })

    return {"notes": notes_meta}


def save_index(data: dict, vault_path: Path) -> Path:
    """Save the note index to a JSON file."""
    out_dir = vault_path / ".flaneur"
    out_dir.mkdir(exist_ok=True)
    out_file = out_dir / "index.json"
    out_file.write_text(json.dumps(data, indent=2))
    return out_file


def load_index(vault_path: Path) -> dict:
    """Load a previously built index."""
    index_file = vault_path / ".flaneur" / "index.json"
    if not index_file.exists():
        raise FileNotFoundError(
            f"No index found at {index_file}. Run `flaneur index` first."
        )
    return json.loads(index_file.read_text())
