# Slippy Fingers

Touch-typing trainer with real-time keyboard visualization — AI Coach edition.

Forked from [FingerGo](https://github.com/asherbuk/FingerGo) (Apache-2.0).

## Features

- Real-time keyboard visualization with finger mapping
- Touch-typing practice with customizable texts
- Statistics tracking (WPM, CPM, accuracy)
- **AI Typing Coach** — generates personalized drills targeting your weakest key transitions
- Multiple keyboard layouts (QWERTY, Dvorak, AZERTY, etc.)
- PWA support for offline use
- Zen mode, strict mode, color customization

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## AI Coach Setup

The AI Coach generates personalized typing drills using NVIDIA's API. To enable it:

### Required Environment Variables (Cloudflare Pages)

Set these in your Cloudflare Pages project settings → Environment variables:

| Variable | Description |
|----------|-------------|
| `NVIDIA_API_KEY` | API key from [build.nvidia.com](https://build.nvidia.com) |
| `COACH_TOKEN` | Shared secret for client authentication (generate a random string) |
| `NVIDIA_MODEL` | Optional: model ID (default: `meta/llama-3.1-70b-instruct`) |

### Local Development

Create a `.dev.vars` file in the project root (already in `.gitignore`):

```bash
# .dev.vars
NVIDIA_API_KEY=your_nvidia_api_key
COACH_TOKEN=your_random_shared_secret
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
```

Then run:

```bash
npm run dev
# In another terminal:
npx wrangler pages dev --compatibility-flags=nodejs_compat
```

The coach endpoint will be available at `http://localhost:8788/api/coach`.

### Client Configuration

1. Open the app
2. Click the **target emoji (🎯)** button next to "Add New" in the library panel
3. Enter your `COACH_TOKEN` when prompted (stored in localStorage)
4. The coach will generate drills based on your typing profile

## Deployment

```bash
npm run build
npm run deploy
```

Deploys to Cloudflare Pages via Wrangler.

## Project Structure

```
src/
├── index.html          # Main HTML (loads modules in dependency order)
├── js/
│   ├── events.js       # EventBus
│   ├── constants.js    # App constants
│   ├── utils.js        # KeyUtils, AppUtils
│   ├── layouts.js      # Keyboard layout registry
│   ├── layouts/*.js    # Individual layouts
│   ├── keyboard.js     # KeyboardUI
│   ├── typing.js       # TypingEngine
│   ├── profile.js      # SlippyProfile (NEW: AI profile layer)
│   ├── stats.js        # StatsManager
│   ├── ui.js           # UIManager
│   ├── modals/         # Modal renderers
│   ├── settings.js     # SettingsManager
│   ├── session.js      # SessionManager
│   ├── library.js      # LibraryManager
│   ├── coach.js        # SlippyCoach (NEW: AI coach client)
│   ├── shortcuts.js    # Keyboard shortcuts
│   └── app.js          # App controller
├── styles/             # CSS modules
└── functions/
    └── api/
        └── coach.js    # Cloudflare Pages Function (AI Coach backend)
```

## How the AI Coach Works

1. **Profile Layer** (`profile.js`): Tracks per-language keystroke statistics
   - Keys: attempts, errors, latency
   - Bigrams: adjacent key transitions with error rates
   - Confusions: expected vs pressed key mappings
   - Exponential decay (0.92) on each new session

2. **Weak Spot Ranking**: Score = `3 * (e + 0.5) / (n + 5) + max(0, avgMs / medianAvgMs - 1)`

3. **Coach Client** (`coach.js`): On button click
   - Builds payload from profile (top weak bigrams/keys/confusions)
   - POSTs to `/api/coach` with `x-coach-token` header
   - Falls back to local drill generation on any failure

4. **Coach Backend** (`functions/api/coach.js`):
   - Validates `COACH_TOKEN` (constant-time comparison)
   - Sanitizes payload (whitelists languages, bounds fields)
   - Calls NVIDIA API with structured prompt
   - Parses JSON response, retries once on parse failure
   - Returns `{ title, code, note }`

5. **Drill Integration**: Saves to "Coach" category in library, loads for practice

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.

Original FingerGo by Asher Buk, Slippy Fingers Contributors.