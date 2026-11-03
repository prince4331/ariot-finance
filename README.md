# ARIOT Finance Web UI

A responsive Web UI and real-time controller for the **ARIOT Finance Google Spreadsheet** (`14gJNHpGP0a0iuN75FcnkplXUkbHSykc3u-6J4Qcgp7I`).

Designed for phones, tablets, and desktop computers.

---

## 🚀 Features

- **📱 Fully Responsive:** Clean, touch-friendly cards on mobile with bottom thumb navigation, and high-density interactive data tables on desktop.
- **⚡ Real-Time 2-Way Sync:** Add, edit, or delete records in the Web UI, and your Google Sheet updates immediately.
- **📊 Live Dashboard Analytics:**
  - 6 Key Performance Indicator (KPI) metrics: *Total Capital Inflow, Cash Expenses, Available Cash, Direct Payments, Total Spending, Salary Paid*
  - Monthly Flow interactive chart (Inflow vs Cash Expenses vs Direct Payments)
  - Category spending distribution donut chart (Hardware, Software, Prototype, Operations, Salary, etc.)
  - Project allocation bars (General, Cleaning Robot, Gas Detector, Other)
  - Team member contribution table (Sadid Muneer Sir, Prince, Saad) with paid expense shares
- **🔍 Instant Search & Multi-Filters:** Filter by Category, Project, Contributor, Purchaser, or search by keywords.
- **📑 Full CRUD Support:**
  - **Purchases & Expenses:** Component, Qty, Unit Cost, Auto Total Cost, Receipt #, Category, Project, Purchaser, Payer, Method, Notes, and Receipt Link.
  - **Capital Inflow:** Contributor, Received By, Amount, Tagged For, Project, Method, Notes.
  - **Direct Payments:** Paid By, Paid To, Category, Project, Amount, Method, Reference, Receipt Link.
- **💾 Offline & Local Cache:** Fully usable even when offline or before connecting Google Apps Script (pre-loaded with the exact data from your sheet).

---

## 🔗 Connecting to Your Google Sheet (2 Minutes)

1. Open your Google Spreadsheet:
   [ARIOT Finance Google Sheet](https://docs.google.com/spreadsheets/d/14gJNHpGP0a0iuN75FcnkplXUkbHSykc3u-6J4Qcgp7I/edit?gid=1140887302#gid=1140887302)
2. In the top menu, go to **Extensions** → **Apps Script**.
3. Delete any default code in the editor, copy everything from `google-apps-script/Code.gs`, and paste it into the script editor.
4. Click **Save** (disk icon).
5. In the top right, click **Deploy** → **New deployment**.
   - Type: **Web app**
   - Description: `ARIOT Finance Web UI API`
   - Execute as: **Me** (your Google account)
   - Who has access: **Anyone**
6. Click **Deploy**, approve the permissions, and copy the **Web app URL** (ends with `/exec`).
7. In the Web UI, click the **Settings (gear)** icon in the top right navbar, paste your Web app URL, and click **Save & Test Live Connection**.

---

## 💻 Running the App

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```
The app runs at `http://localhost:5173/` and is accessible across your local network on mobile devices at your network IP.
