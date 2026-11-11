# TeacherAI

TeacherAI is organized into a static frontend, an Express API, and a standalone
archived login app:

- `frontend/` contains the HTML entry pages, shared scripts, styles, and assets.
- `backend/` contains the API app, routes, controllers, middleware, and services.
- `archive/loginTeacherAi/` contains the older standalone Express login app.

## Run locally

1. In `backend/`, run `npm install`.
2. Copy `backend/.env.example` to `backend/.env` and add your OpenAI API key if you want to use chat.
3. Start the API with `npm run dev` from `backend/` (or `npm start`).
4. In a second terminal, start the frontend with `npm run dev` from `frontend/` (or `npm start`).
5. Open `http://127.0.0.1:5500` in your browser and choose **Get Started**.

## Landing pages

`frontend/index.html` is the default landing page served at `/`. The alternative
video-background design is `frontend/landing-video.html`; open it directly at
`/landing-video.html` to preview it. Both pages link to the same main app.

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

The archived login app can be run separately from `archive/loginTeacherAi/` with
`npm install` followed by `npm start`. It requires MongoDB and uses port 3000 by
default, so do not run it at the same time as the active API unless you configure
a different `PORT`.
