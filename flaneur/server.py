"""Flask server for the Flaneur visual explorer."""

import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
import anthropic

from flaneur.ingest import ingest, load_index, save_index


def create_app(vault_path: Path | None = None) -> Flask:
    static_dir = Path(__file__).parent / "static"
    app = Flask(__name__, static_folder=str(static_dir), static_url_path="")

    state = {"vault_path": vault_path}

    @app.route("/")
    def index():
        return send_from_directory(static_dir, "index.html")

    @app.route("/api/status")
    def status():
        vp = state["vault_path"]
        if not vp:
            return jsonify({"ready": False, "reason": "no_vault"})
        index_file = vp / ".flaneur" / "index.json"
        if not index_file.exists():
            return jsonify({"ready": False, "reason": "not_indexed", "vault": str(vp)})
        data = load_index(vp)
        return jsonify({"ready": True, "vault": str(vp), "note_count": len(data["notes"])})

    @app.route("/api/pick-folder", methods=["POST"])
    def pick_folder():
        """Open native OS folder picker and return the selected path."""
        import subprocess
        import sys

        if sys.platform == "darwin":
            script = (
                'tell application "System Events"\n'
                'activate\n'
                'set theFolder to choose folder with prompt "Choose your notes folder"\n'
                'return POSIX path of theFolder\n'
                'end tell'
            )
            try:
                result = subprocess.run(
                    ["osascript", "-e", script],
                    capture_output=True, text=True, timeout=60
                )
                if result.returncode == 0 and result.stdout.strip():
                    return jsonify({"folder": result.stdout.strip()})
                return jsonify({"folder": ""})
            except Exception:
                return jsonify({"folder": ""})
        else:
            # Linux/Windows fallback using tkinter
            try:
                import tkinter as tk
                from tkinter import filedialog
                root = tk.Tk()
                root.withdraw()
                root.attributes("-topmost", True)
                folder = filedialog.askdirectory(title="Choose your notes folder")
                root.destroy()
                return jsonify({"folder": folder or ""})
            except Exception:
                return jsonify({"folder": ""})

    @app.route("/api/setup", methods=["POST"])
    def setup():
        body = request.get_json()
        folder = body.get("folder", "").strip()
        api_key = body.get("api_key", "").strip() or os.environ.get("OPENAI_API_KEY")

        if not folder:
            return jsonify({"error": "Folder path is required."}), 400

        vault = Path(folder).expanduser().resolve()
        if not vault.is_dir():
            return jsonify({"error": f"'{folder}' is not a valid directory."}), 400

        index_file = vault / ".flaneur" / "index.json"
        if index_file.exists():
            state["vault_path"] = vault
            data = load_index(vault)
            return jsonify({"ok": True, "note_count": len(data["notes"]), "cached": True})

        try:
            data = ingest(vault)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        save_index(data, vault)
        state["vault_path"] = vault
        return jsonify({"ok": True, "note_count": len(data["notes"]), "cached": False})

    @app.route("/api/notes")
    def notes_list():
        vp = state["vault_path"]
        if not vp:
            return jsonify({"notes": []})
        data = load_index(vp)
        notes = [
            {"id": i, "title": n["title"], "path": n["path"], "preview": n["preview"]}
            for i, n in enumerate(data["notes"])
        ]
        return jsonify({"notes": notes})

    @app.route("/api/note/<int:note_id>")
    def note_detail(note_id):
        vp = state["vault_path"]
        if not vp:
            return jsonify({"error": "No vault loaded"}), 400

        data = load_index(vp)
        if note_id < 0 or note_id >= len(data["notes"]):
            return jsonify({"error": "Not found"}), 404

        note = data["notes"][note_id]
        full_path = vp / note["path"]
        content = note["preview"]
        if full_path.exists():
            content = full_path.read_text(encoding="utf-8", errors="replace")

        return jsonify({
            "id": note_id,
            "title": note["title"],
            "path": note["path"],
            "content": content,
        })

    @app.route("/api/spark", methods=["POST"])
    def spark():
        """Generate a new idea from two colliding notes."""
        vp = state["vault_path"]
        if not vp:
            return jsonify({"error": "No vault loaded"}), 400

        body = request.get_json()
        id_a = body.get("a")
        id_b = body.get("b")

        data = load_index(vp)
        if id_a is None or id_b is None:
            return jsonify({"error": "Need two note IDs"}), 400

        note_a = data["notes"][id_a]
        note_b = data["notes"][id_b]

        # Read full content
        content_a = note_a["preview"]
        content_b = note_b["preview"]
        path_a = vp / note_a["path"]
        path_b = vp / note_b["path"]
        if path_a.exists():
            content_a = path_a.read_text(encoding="utf-8", errors="replace")[:2000]
        if path_b.exists():
            content_b = path_b.read_text(encoding="utf-8", errors="replace")[:2000]

        api_key = os.environ.get("ANTHROPIC_API_KEY")
        client = anthropic.Anthropic(api_key=api_key)

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=250,
            system=(
                "You are a creative collision engine. Two unrelated ideas just met.\n\n"
                "Your job: find the hidden structural parallel between them — the "
                "abstract pattern they share that nobody has named yet. Arthur Koestler "
                "called this 'bisociation': the intersection of two self-consistent but "
                "normally unconnected frames of reference.\n\n"
                "Do not be stuck producing small local variations. Push to the "
                "boundaries of what these ideas could mean together. Identify core "
                "assumptions and consider their negation, their extreme limits, "
                "their pathological edge cases.\n\n"
                "Rules:\n"
                "- The idea must be IMPOSSIBLE to generate from either note alone\n"
                "- It must feel inevitable in hindsight but surprising in the moment\n"
                "- Find the tension between the two ideas and build from that friction\n"
                "- Think like an inventor, not a summariser\n"
                "- If your idea sounds like a LinkedIn post, throw it away and try harder\n\n"
                "Respond in EXACTLY this format:\n"
                "TITLE: [name it like a product, book, or campaign — something you'd "
                "put on a billboard. 3-6 words.]\n"
                "IDEA: [ONE punchy sentence. Under 15 words. A tagline, not an explanation.]\n"
                "No other text."
            ),
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Person A's idea: \"{note_a['title']}\"\n{content_a[:1000]}\n\n"
                        f"Person B's idea: \"{note_b['title']}\"\n{content_b[:1000]}\n\n"
                        "What new idea sparks from their collision?"
                    ),
                },
            ],
        )

        raw = response.content[0].text.strip()

        # Parse TITLE: and IDEA: format
        spark_title = ""
        spark_text = raw
        for line in raw.splitlines():
            if line.upper().startswith("TITLE:"):
                spark_title = line.split(":", 1)[1].strip()
            elif line.upper().startswith("IDEA:"):
                spark_text = line.split(":", 1)[1].strip()

        return jsonify({
            "spark_title": spark_title,
            "spark": spark_text,
            "note_a": {"id": id_a, "title": note_a["title"]},
            "note_b": {"id": id_b, "title": note_b["title"]},
        })

    return app
