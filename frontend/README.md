# TKRCET Job Mela 2026 — Frontend Application

Modern responsive React + Vite web application for TKRCET Job Mela 2026.

## 🛠️ Tech Stack
- React 19 / 18
- Vite
- React Router DOM v7
- Axios
- Lucide React (Clean, lightweight iconography)
- Vanilla CSS Design System (`src/index.css`)

---

## 🎨 Design Features
- Fully responsive on Desktop, Tablet, and Mobile devices.
- Curated color scheme aligned with academic and corporate recruiting themes.
- Micro-animations for buttons, cards, badges, and modals.
- Clean component hierarchy with separated Public, Student, and Admin layouts.
- Auto token injection via Axios interceptors and global authentication context.

---

## 🚀 Running Locally

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Access at `http://127.0.0.1:5173/`.

To build for production:
```bash
npm run build
```
The optimized bundle will be created in the `dist/` directory.
