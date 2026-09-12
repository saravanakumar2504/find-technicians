# Find Technicians

A Next.js (App Router) + Redux Toolkit application scaffolded with TypeScript.

## Getting Started

### Installation

Install dependencies:

```bash
npm install
```

### Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Architecture & File Structure

```
src/
├── app/
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout wrapping Redux Provider
│   ├── page.tsx            # Main page component
│   └── StoreProvider.tsx   # Next.js App Router client provider for Redux store
├── components/
│   └── TechnicianList.tsx  # Client component consuming Redux state
├── lib/
│   ├── store.ts            # Redux store creation factory
│   ├── hooks.ts            # Typed Redux hooks (useAppDispatch, useAppSelector, useAppStore)
│   └── features/
│       └── technicians/    # Technicians feature slice (state, reducers, thunks)
└── next-env.d.ts           # Next.js type declarations
```
