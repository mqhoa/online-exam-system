# Frontend

React, TypeScript, and Vite frontend for the Online Exam System.

## Run locally

```powershell
cd D:\online-exam-system\frontend
npm install
npm run dev
```

Vite proxies `/api` requests to `http://localhost:8080`. Start the backend separately. The frontend login uses the planned authentication endpoints documented in [`docs/api/api-spec.md`](../docs/api/api-spec.md); those endpoints are not implemented yet, so sign-in currently returns an explicit service error instead of faking a successful login.

Build and lint:

```powershell
npm run build
npm run lint
```

## Source structure

```text
src/
├── app/
│   ├── callbacks/      # Post-authentication routing from the server-assigned role
│   └── pages/           # Authenticated application shell
├── components/          # Shared brand and language controls
├── features/
│   └── auth/
│       ├── api/         # Login, current-session, and logout requests
│       ├── components/  # Login form
│       ├── pages/       # Login screen and styles
│       └── types.ts     # Authentication and role contracts
├── i18n/                # Language context and Vietnamese/English messages
├── index.css            # Global tokens and shared styles
└── main.tsx             # Application entry point and providers
```

The login screen does not ask users to choose a role. After authentication, the server's `user.role` determines the route. The session is intended to use an `HttpOnly` cookie; no token is persisted in browser storage.
