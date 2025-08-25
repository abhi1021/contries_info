from flask import Flask, jsonify, render_template, request
import requests


RESTCOUNTRIES_BASE = "https://restcountries.com/v3.1"


def create_app():
    app = Flask(__name__)

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/api/countries")
    def list_countries():
        # Fetch a lightweight list for dropdown
        fields = "name,cca2"
        url = f"{RESTCOUNTRIES_BASE}/all?fields={fields}"
        try:
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as exc:
            return jsonify({"error": "Failed to fetch countries", "detail": str(exc)}), 502

        countries = []
        for item in data:
            name_obj = item.get("name") or {}
            common_name = name_obj.get("common") or name_obj.get("official") or "Unknown"
            countries.append({
                "name": common_name,
                "code": item.get("cca2")
            })

        countries.sort(key=lambda c: (c["name"] or "").lower())
        return jsonify(countries)

    @app.get("/api/country")
    def country_details():
        name = request.args.get("name", type=str)
        code = request.args.get("code", type=str)

        if not name and not code:
            return jsonify({"error": "Missing 'name' or 'code' query parameter"}), 400

        fields = ",".join([
            "name",
            "capital",
            "region",
            "population",
            "area",
            "languages",
            "currencies",
            "timezones",
            "flags"
        ])

        if code:
            url = f"{RESTCOUNTRIES_BASE}/alpha/{code}?fields={fields}"
        else:
            # Prefer fullText=true when searching by exact country name
            url = f"{RESTCOUNTRIES_BASE}/name/{requests.utils.quote(name)}?fullText=true&fields={fields}"

        try:
            resp = requests.get(url, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            # /alpha returns an object; /name returns a list
            if isinstance(data, list):
                country = data[0] if data else {}
            else:
                country = data
        except requests.RequestException as exc:
            return jsonify({"error": "Failed to fetch country details", "detail": str(exc)}), 502

        name_obj = country.get("name") or {}
        common_name = name_obj.get("common") or name_obj.get("official")

        # Transform fields for frontend simplicity
        result = {
            "name": common_name,
            "capital": ", ".join(country.get("capital") or []) or None,
            "region": country.get("region"),
            "population": country.get("population"),
            "area": country.get("area"),
            "languages": ", ".join((country.get("languages") or {}).values()) or None,
            "currencies": ", ".join(
                f"{cinfo.get('name')} ({code})" if cinfo else code
                for code, cinfo in (country.get("currencies") or {}).items()
            ) or None,
            "timezones": ", ".join(country.get("timezones") or []) or None,
            "flag_svg": ((country.get("flags") or {}).get("svg")),
            "flag_png": ((country.get("flags") or {}).get("png")),
        }

        return jsonify(result)

    return app


app = create_app()

if __name__ == "__main__":
    # For local development
    app.run(host="0.0.0.0", port=5000, debug=True)


