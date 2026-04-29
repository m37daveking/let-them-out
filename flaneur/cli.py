"""Command-line interface for Flaneur."""

from pathlib import Path

import click

from flaneur.ingest import ingest, save_index, load_index


@click.group()
def main():
    """Flaneur — take a walk through your notes."""
    pass


@main.command()
@click.argument("vault", type=click.Path(exists=True, file_okay=False))
def index(vault):
    """Index markdown notes from VAULT directory."""
    vault_path = Path(vault).resolve()

    click.echo(f"Reading notes from {vault_path}...")
    data = ingest(vault_path)
    click.echo(f"Found {len(data['notes'])} notes.")

    out_file = save_index(data, vault_path)
    click.echo(f"Index saved to {out_file}")


@main.command()
@click.argument("vault", type=click.Path(exists=True, file_okay=False), required=False)
@click.option("--port", default=7773, help="Port to serve on")
@click.option("--host", default="127.0.0.1", help="Host to bind to")
def walk(vault, port, host):
    """Start the visual explorer for your notes."""
    vault_path = Path(vault).resolve() if vault else None

    from flaneur.server import create_app

    app = create_app(vault_path)
    click.echo(f"Flaneur is running at http://{host}:{port}")
    app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    main()
