# Driver Drowsiness Detection (FastAPI + React)

## Project structure
- `/backend`: FastAPI backend inference pipeline
- `/frontend`: React UI
- `/model`: model artifact (best_model.keras)
- `/docker`: Docker support

## Run locally
### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and use dashboard.

## Docker
```bash
docker compose -f docker/docker-compose.yml up --build
```

## API
- GET `/` returns API health
- POST `/predict` with JSON `{ "image": "data:image/jpeg;base64,..." }`

