"""Vercel serverless function: generate evolved sparks for party/coffee scenes."""

import json
import anthropic
from http.server import BaseHTTPRequestHandler


PARTY_PROMPT = (
    "Two ideas that were born on the street are now colliding at a party. "
    "Each idea already evolved from raw notes into a spark. Now they meet.\n\n"
    "Your job: FUSE these two street spark ideas into something new. "
    "The original notes are background context. The street sparks are the "
    "primary material. Find the meta-pattern that connects the two sparks "
    "and push it somewhere neither idea could go alone.\n\n"
    "Rules:\n"
    "- The street spark ideas are the stars — fuse THEM, not the original notes\n"
    "- Find what the two sparks have in common at a deeper level\n"
    "- Push further than either spark went alone\n"
    "- Think like a venture capitalist hearing two pitches and seeing the bigger play\n\n"
    "Respond in EXACTLY this format:\n"
    "TITLE: [product name or book title. 3-6 words. Billboard-ready.]\n"
    "IDEA: [ONE punchy sentence. Under 15 words. A tagline.]\n"
    "No other text."
)

COFFEE_PROMPT = (
    "This is a third-generation idea. Two people have been through "
    "street collisions and party conversations. Now in an intimate "
    "coffee meeting, distill EVERYTHING into one crystallized insight.\n\n"
    "You are given their full lineage: original notes, street sparks, "
    "and party sparks. The coffee idea should feel like the inevitable "
    "conclusion — the idea that was always there, waiting to be found.\n\n"
    "Rules:\n"
    "- This is the refined, final form — not another iteration\n"
    "- It must honour the full journey from street to party to here\n"
    "- Make it specific enough to act on\n"
    "- This should feel like a breakthrough, not a summary\n\n"
    "Respond in EXACTLY this format:\n"
    "TITLE: [product name or book title. 3-6 words. The kind of name that makes people lean in.]\n"
    "IDEA: [2-3 sentences. This is the big one — make it count. Specific and actionable.]\n"
    "No other text."
)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_length)) if content_length else {}

        api_key = self.headers.get("X-API-Key", "")
        if not api_key:
            self._respond(400, {"error": "API key required"})
            return

        context = body.get("context", {})
        scene = context.get("scene", "party")
        a_title = body.get("a_title", "")
        a_content = body.get("a_content", "")[:600]
        b_title = body.get("b_title", "")
        b_content = body.get("b_content", "")[:600]

        if scene == "party":
            system_prompt = PARTY_PROMPT
            max_tok = 250
            a_spark = context.get("a_street_spark", {})
            b_spark = context.get("b_street_spark", {})
            user_msg = (
                f"Person A: \"{a_title}\"\n{a_content}\n"
                f"Their street spark: \"{a_spark.get('title', '')}\": {a_spark.get('text', '')}\n\n"
                f"Person B: \"{b_title}\"\n{b_content}\n"
                f"Their street spark: \"{b_spark.get('title', '')}\": {b_spark.get('text', '')}\n\n"
                "What evolved idea emerges when these two sparks collide at the party?"
            )
            model = "claude-sonnet-4-6"
        else:
            system_prompt = COFFEE_PROMPT
            max_tok = 500
            a_spark = context.get("a_street_spark", {})
            b_spark = context.get("b_street_spark", {})
            a_party = context.get("a_party_spark", {})
            b_party = context.get("b_party_spark", {})
            user_msg = (
                f"Person A: \"{a_title}\"\n{a_content}\n"
                f"Street spark: \"{a_spark.get('title', '')}\": {a_spark.get('text', '')}\n"
                f"Party spark: \"{a_party.get('title', '')}\": {a_party.get('text', '')}\n\n"
                f"Person B: \"{b_title}\"\n{b_content}\n"
                f"Street spark: \"{b_spark.get('title', '')}\": {b_spark.get('text', '')}\n"
                f"Party spark: \"{b_party.get('title', '')}\": {b_party.get('text', '')}\n\n"
                "Over coffee, what final crystallized idea emerges from this entire journey?"
            )
            model = "claude-opus-4-6"

        try:
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model=model,
                max_tokens=max_tok,
                system=system_prompt,
                messages=[{"role": "user", "content": user_msg}],
            )

            raw = response.content[0].text.strip()
            spark_title = ""
            spark_text = raw
            for line in raw.splitlines():
                if line.upper().startswith("TITLE:"):
                    spark_title = line.split(":", 1)[1].strip()
                elif line.upper().startswith("IDEA:"):
                    spark_text = line.split(":", 1)[1].strip()

            self._respond(200, {"spark_title": spark_title, "spark": spark_text})
        except anthropic.AuthenticationError:
            self._respond(401, {"error": "Invalid API key"})
        except Exception:
            self._respond(500, {"error": "Failed to generate idea"})

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
        self.end_headers()

    def _respond(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
