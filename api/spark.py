"""Vercel serverless function: generate a street spark from two notes."""

import json
import anthropic
from http.server import BaseHTTPRequestHandler


SYSTEM_PROMPT = (
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
)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_length)) if content_length else {}

        api_key = self.headers.get("X-API-Key", "")
        if not api_key:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "API key required"}).encode())
            return

        a_title = body.get("a_title", "")
        a_content = body.get("a_content", "")[:1000]
        b_title = body.get("b_title", "")
        b_content = body.get("b_content", "")[:1000]

        if not a_title or not b_title:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Two notes required"}).encode())
            return

        try:
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=250,
                system=SYSTEM_PROMPT,
                messages=[{
                    "role": "user",
                    "content": (
                        f"Person A's idea: \"{a_title}\"\n{a_content}\n\n"
                        f"Person B's idea: \"{b_title}\"\n{b_content}\n\n"
                        "What new idea sparks from their collision?"
                    ),
                }],
            )

            raw = response.content[0].text.strip()
            spark_title = ""
            spark_text = raw
            for line in raw.splitlines():
                if line.upper().startswith("TITLE:"):
                    spark_title = line.split(":", 1)[1].strip()
                elif line.upper().startswith("IDEA:"):
                    spark_text = line.split(":", 1)[1].strip()

            result = {"spark_title": spark_title, "spark": spark_text}
        except anthropic.AuthenticationError:
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid API key"}).encode())
            return
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Failed to generate idea"}).encode())
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
        self.end_headers()
