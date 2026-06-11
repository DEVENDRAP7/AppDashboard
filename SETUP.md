# Mission Control — Setup

Your dashboard works right now (reads your Google Sheet). To **add/edit/delete from the
webpage straight into the sheet** (permanent, multi-device), do the 2-minute setup below.

---

## Part 1 — Let the webpage write to your Google Sheet (do this)

**You only do steps 1–5 once. Takes ~2 minutes.**

1. Open your Google Sheet (the App Launch Tracker one).
2. Top menu → **Extensions** → **Apps Script**. A code editor opens.
3. Delete whatever is in `Code.gs`, then **paste the entire contents of `apps-script.gs`** (in this repo).
4. Click **Deploy** (top right) → **New deployment** → gear icon → **Web app**.
   - **Execute as:** Me
   - **Who has access:** **Anyone**
   - Click **Deploy**. Approve the permissions prompt (it's your own script).
5. Copy the **Web app URL** it shows — ends in `/exec`.

6. Open `index.html`, find this line near the top of the `<script>`:
   ```js
   const GAS_URL = "";
   ```
   Paste your URL inside the quotes:
   ```js
   const GAS_URL = "https://script.google.com/macros/s/AKfyc..../exec";
   ```
7. Save, commit, push:
   ```
   git add -A && git commit -m "Connect sheet write endpoint" && git push
   ```

**Done.** Now the **Add App** button writes to your real sheet. Cards get a delete (✕ on hover)
that removes the row from the sheet. The **Firebase Link** column is created automatically the
first time you add one — nothing existing is touched.

### What you add per app (your task)
Name · Firebase link · GitHub repo link · (plus stage, target month, privacy link — all optional)

---

## Part 2 — Play Console status (optional, do later)

This auto-fills **Draft / Pending / Live** + installs from Play Console into your sheet.
It needs a one-time key setup because Play has **no public API** — it must run server-side
(your Apps Script holds the key, never the webpage).

**You'll need (all done in YOUR accounts — never paste keys in chat):**

1. **Google Play Console** → Setup → **API access**.
2. Create / link a **service account** (Google Cloud project).
3. Enable the **Google Play Android Developer API** for that project.
4. Grant the service account access in Play Console (View app information).
5. In Apps Script (`apps-script.gs`) → fill the `PACKAGES` map:
   ```js
   const PACKAGES = { "Idea 1": "com.you.idea1" };
   ```
6. Add a **time-driven trigger** for `syncPlay()` (Apps Script → Triggers → hourly).

The `syncPlay()` function is stubbed in `apps-script.gs`. Once your service account is linked,
**tell me** and I'll complete it to pull live status into the sheet.

### Safe vs never-share
| Safe to share | NEVER share |
|---|---|
| Package names (`com.you.app`) | Service-account JSON key |
| Public store URLs | Console password / 2FA |
| Which metrics you want | API private keys / OAuth secret |

---

## How it all flows

```
You add idea on webpage
        │
        ▼
Apps Script (runs in your Google) ──► your Google Sheet  ◄── Play Console (Part 2, hourly)
        ▲                                     │
        └─────────── webpage reads ◄──────────┘
```

- **Sheet** = your database. Safe, in your Google account.
- **Apps Script** = the only thing allowed to write (holds permissions, not the page).
- **Webpage** = reads + sends add/edit requests. No secrets in it. Safe to host publicly.
