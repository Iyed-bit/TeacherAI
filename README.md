# TeacherAI

TeacherAI is organized as a static frontend and a separate Express API:

- `frontend/` contains the existing HTML, CSS, JavaScript, and assets.
- `backend/` contains the API server.
- `archive/` contains the previous app/server copies for reference; they are not used by the new setup.

## Run locally

1. In `backend/`, run `npm install`.
2. Copy `backend/.env.example` to `backend/.env` and add your OpenAI API key if you want to use chat.
3. Start the API with `npm start` from `backend/`.
4. In a second terminal, start the frontend with `node dev-server.cjs` from `frontend/`.
5. Open `http://127.0.0.1:5500` in your browser and choose **Get Started**.

The API listens on `http://localhost:3000` by default. Its health check is
`GET /api/health`; PDF extraction uses `POST /api/pdf/extract` with a
multipart `pdfFile` field; chat uses `POST /api/chat` with a JSON `content`
string.

Local HTTP development origins such as `localhost:5501` are allowed by the
backend. Set `FRONTEND_ORIGINS` in `backend/.env` for a non-local frontend
origin. Chat supports local Ollama (`AI_PROVIDER=ollama`) or OpenAI
(`AI_PROVIDER=openai` with `OPENAI_API_KEY`). Ollama uses the installed
`llama3.2:latest` model by default and does not require OpenAI API credits.
The old login app is archived and is not connected to this API yet.
