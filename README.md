# CV Online

**Your CV as a small cloud-native service.** One JSON file, four ways to read it:

| Endpoint | What it serves |
|---|---|
| `/` | Web page (Handlebars) |
| `/cv` | JSON API, e.g. for the [TechCard](https://github.com/sandrrei/techcard) app |
| `/cv/terminal` | Plain-text CV for the terminal: `curl https://your-host/cv/terminal` |
| `/cv/metrics` | Prometheus metrics: visits per endpoint and per country, uptime |

Live example: [cv.srei.duckdns.org](https://cv.srei.duckdns.org)

Built with NestJS and TypeScript, packaged as a multi-stage Docker image.

## Quick start

```bash
git clone https://github.com/sandrrei/cv-online && cd cv-online
cp data/cv.example.json data/cv.json     # then edit data/cv.json with your CV
docker compose up -d --build
```

Open <http://localhost:3006>. Without a `data/cv.json`, the fictional example CV is shown.

The CV is reloaded automatically when `data/cv.json` changes: edit the file, refresh the
page, no restart needed.

## Your CV file

`data/cv.json` holds everything shown on the page. See
[`data/cv.example.json`](data/cv.example.json) for the full format:

```json
{
  "name": "Jane Example",
  "title": "Site Reliability Engineer",
  "location": "Lisbon, Portugal",
  "email": "jane@example.com",
  "phone": "+1 555 0100",
  "linkedin": "https://www.linkedin.com/in/jane-example",
  "github": "https://github.com/octocat",
  "tagline": "...",
  "status": "...",
  "bio": "...",
  "skills": { "Cloud & DevOps": ["Kubernetes", "Terraform"] },
  "experience": [ { "period": "2021 - Present", "role": "...", "company": "...", "highlights": ["..."] } ],
  "projects": [ { "name": "...", "description": "...", "tech": "..." } ],
  "easterEgg": "..."
}
```

- `phone` is optional: leave it out to hide it from the page and the terminal view.
- Skill groups are free-form: each key becomes a label on the page.

`data/cv.json` and `data/metrics.json` are in `.gitignore` and `.dockerignore`, so your
personal data never ends up in the repository or in the Docker image. It is mounted into
the container as a volume.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port inside the container (`docker-compose.yml` maps it to `3006`) |
| `DATA_DIR` | `./data` | Folder for `cv.json` and `metrics.json` |
| `CV_FILE` | `$DATA_DIR/cv.json` | Path to the CV file |

## Monitoring

`/cv/metrics` is ready for Prometheus:

```yaml
scrape_configs:
  - job_name: cv-online
    metrics_path: /cv/metrics
    static_configs:
      - targets: ['your-host:3006']
```

Visitor countries come from [geoip-lite](https://github.com/geoip-lite/node-geoip) and only
the country code is counted; IP addresses are not stored. Behind a reverse proxy, the
`X-Forwarded-For` / `X-Real-IP` headers are used.

## Development

```bash
npm install
npm run start:dev      # http://localhost:3000, reloads on changes
npm run build          # compile to dist/
```

## License

MIT, see [LICENSE](LICENSE).
