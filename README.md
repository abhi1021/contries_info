# Countries Explorer (Flask + uv)

Minimal Flask app to browse country details from REST Countries.

- Capital
- Region
- Population
- Area
- Languages
- Currencies
- Timezones
- Flag

Data source: [REST Countries endpoints](https://restcountries.com/#endpoints).

## Prerequisites

- Python 3.9+
- uv installed (e.g., `pipx install uv`)

## Quickstart

```bash
uv venv
source .venv/bin/activate
uv sync
uv run flask --app app --debug run --host=0.0.0.0 --port=5000
```

Open `http://localhost:5000` in your browser.

## Project Structure

```
countries_info/
├─ app.py
├─ pyproject.toml
├─ templates/
│  └─ index.html
└─ static/
   ├─ style.css
   └─ script.js
```

## API (served by this app)

- GET `/api/countries` — list for dropdown (name + cca2).
- GET `/api/country?code=US` — details by code.
- GET `/api/country?name=France` — details by name.

## Notes

- No React; Flask templates + vanilla JS.
- SVG flag preferred, PNG fallback.

## Troubleshooting

- If `uv` is missing: `pipx install uv`.
- If requests fail, check network access to `https://restcountries.com`.

## License

MIT
