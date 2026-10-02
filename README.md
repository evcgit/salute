# Salute

Dockerized FastAPI backend and React frontend.

## Run

```bash
docker compose up --build
```

- App: http://localhost:5173
- API: http://localhost:8000/api/salute
- Docs: http://localhost:8000/docs

The frontend proxies `/api` to the backend. Source directories are mounted, so edits reload in both services. After changing `frontend/package.json` or `backend/requirements.txt`, rebuild with `docker compose up --build`.

## Without Docker

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend, in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Spent ~45 minutes probably less. Most of it went to reading the document and working out how the models relate. The rest went to filtering, the UI, and default severity ordering.

## How it works

The alarm is the parent object. It is what actually happened and what lands on someone's screen, so `GET /api/alarms` serves alarms with the asset and procedure already joined. MOPs are written against equipment, not alarms, so the chain is always alarm -> asset -> MOP.


### Matching

1. If the alarm has an `asset_id`, the asset is looked up directly.
2. If `asset_id` is null, the free-text `equipment_label` is normalized (lowercased, spaces and punctuation stripped) and matched against asset `model_number` values the same way. A model counts as a match when the normalized string appears in the label; if several match, the longest one wins.
3. Asset to MOP: same normalization, then `asset.model_number` contains `mop.applicable_model`. Longest match wins.


### Suggested and unmatched assets

I thought a match from step 2 should only be a suggestion, so the detail panel flags it as a suggested asset with a confirm button that would update the alarm to reference the asset id.

When the label search can't match any asset, the alarm is flagged `asset_attached: false` and the queue row itself shows "No asset attached", so the state is visible without opening the detail panel. The alarm is never dropped or silently guessed at. Every alarm in the sample data resolves, so I added AL-1005 ("Sensor near row C") as the unmatched example while testing.

## Assumptions and what I'd revisit

The matching is rule-based and works at the model family level. It matches the asset's family, not the alarm's actual problem. AL-1002 is a filter differential pressure alarm, but its family MOP is about discharge temp. Right procedure book, possibly the wrong page. With more time, the first thing I'd add is a keyword tiebreak against the alarm message.


## AI usage

I used Cursor while building the core of the project. The full chat transcript is included in the repo (please forgive my typing errors in the transcript 🙏).

- Where it helped: first prompt gave me good results saving me a lot of time scaffolding the initial core of the project.
- Where I corrected it: its initial version treated a null `asset_id` as unresolvable and just showed AL-1002's label with no procedure. It didn't consider that the label itself names the model. The normalization and string-contains approach was instructed
