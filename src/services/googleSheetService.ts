import { PurchaseExpense, CapitalInflow, DirectPayment } from '../types/finance';
import { INITIAL_PURCHASES, INITIAL_INFLOWS, INITIAL_DIRECT_PAYMENTS } from '../data/initialData';

const STORAGE_KEYS = {
  PURCHASES: 'ariot_finance_purchases_v1',
  INFLOWS: 'ariot_finance_inflows_v1',
  DIRECT_PAYMENTS: 'ariot_finance_direct_payments_v1',
  APPS_SCRIPT_URL: 'ariot_finance_apps_script_url_v1',
};

const SPREADSHEET_ID = '14gJNHpGP0a0iuN75FcnkplXUkbHSykc3u-6J4Qcgp7I';

/**
 * Robust CSV parser that correctly handles quoted strings, escaped quotes, and newlines.
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (insideQuotes && next === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (c === ',' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((c === '\r' || c === '\n') && !insideQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((val) => val !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += c;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((val) => val !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function cleanNumber(val: any): number {
  if (!val) return 0;
  const s = String(val).replace(/BDT/gi, '').replace(/,/g, '').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

const DEFAULT_APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzQq2v3RbiZ8290XZAATkJd6eV-2XZ0VFz5j4ZtlxtnwTZpcQHf42AuAbbvRGpAAbG7/exec';

export class GoogleSheetService {
  private static getApiUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.APPS_SCRIPT_URL) ||
      DEFAULT_APPS_SCRIPT_URL
    );
  }

  public static setApiUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.APPS_SCRIPT_URL, url.trim());
  }

  public static getCurrentApiUrl(): string {
    return this.getApiUrl();
  }

  public static loadInitialLocalData(): {
    purchases: PurchaseExpense[];
    inflows: CapitalInflow[];
    directPayments: DirectPayment[];
  } {
    const pStr = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    const iStr = localStorage.getItem(STORAGE_KEYS.INFLOWS);
    const dStr = localStorage.getItem(STORAGE_KEYS.DIRECT_PAYMENTS);

    return {
      purchases: pStr ? JSON.parse(pStr) : INITIAL_PURCHASES,
      inflows: iStr ? JSON.parse(iStr) : INITIAL_INFLOWS,
      directPayments: dStr ? JSON.parse(dStr) : INITIAL_DIRECT_PAYMENTS,
    };
  }

  public static saveToLocal(
    purchases: PurchaseExpense[],
    inflows: CapitalInflow[],
    directPayments: DirectPayment[]
  ): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    localStorage.setItem(STORAGE_KEYS.INFLOWS, JSON.stringify(inflows));
    localStorage.setItem(STORAGE_KEYS.DIRECT_PAYMENTS, JSON.stringify(directPayments));
  }

  /**
   * Fetch live data directly from the public Google Sheet via Google Visualization CSV export.
   * Works across all devices and browsers without requiring any Apps Script deployment.
   */
  public static async fetchFromPublicSheet(): Promise<{
    purchases: PurchaseExpense[];
    inflows: CapitalInflow[];
    directPayments: DirectPayment[];
  }> {
    const base = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;

    const [purchasesCsv, inflowsCsv, directCsv] = await Promise.all([
      fetch(`${base}${encodeURIComponent('Purchases & Expenses')}&_t=${Date.now()}`).then((r) =>
        r.text()
      ),
      fetch(`${base}${encodeURIComponent('Capital Inflow')}&_t=${Date.now()}`).then((r) =>
        r.text()
      ),
      fetch(`${base}${encodeURIComponent('Direct Payments')}&_t=${Date.now()}`).then((r) =>
        r.text()
      ),
    ]);

    // Parse Purchases & Expenses
    const pRows = parseCSV(purchasesCsv);
    const purchases: PurchaseExpense[] = [];
    for (let i = 1; i < pRows.length; i++) {
      const r = pRows[i];
      const rowIndex = i + 3; // Sheet data rows start at row 4
      const comp = r[5] || '';
      const cat = r[6] || '';
      const cost = r[10] || '';
      if (!comp && !cat && !cost) continue;

      const qty = cleanNumber(r[8]) || 1;
      const unitCost = cleanNumber(r[9]) || 0;
      const totalCost = cleanNumber(r[10]) || qty * unitCost;

      purchases.push({
        id: `pe-${rowIndex}`,
        rowIndex,
        date: r[0] || '',
        receiptNo: r[1] || '',
        receiptLink: r[2] || '',
        purchasedBy: r[3] || 'Prince',
        paidBy: r[4] || 'Prince',
        component: comp,
        category: cat,
        project: r[7] || 'General',
        qty,
        unitCost,
        totalCost,
        paymentMethod: r[11] || 'Cash',
        notes: r[12] || '',
      });
    }

    // Parse Capital Inflow
    const iRows = parseCSV(inflowsCsv);
    const inflows: CapitalInflow[] = [];
    for (let i = 1; i < iRows.length; i++) {
      const r = iRows[i];
      const rowIndex = i + 3; // Sheet data rows start at row 4
      const contrib = r[1] || '';
      const amt = cleanNumber(r[3]);
      if (!contrib && amt === 0) continue;

      inflows.push({
        id: `ci-${rowIndex}`,
        rowIndex,
        date: r[0] || '',
        contributor: contrib,
        receivedBy: r[2] || '',
        amount: amt,
        taggedFor: r[4] || '',
        project: r[5] || 'General',
        paymentMethod: r[6] || 'Bank Transfer',
        notes: r[7] || '',
      });
    }

    // Parse Direct Payments
    const dRows = parseCSV(directCsv);
    const directPayments: DirectPayment[] = [];
    for (let i = 1; i < dRows.length; i++) {
      const r = dRows[i];
      const rowIndex = i + 1; // Direct Payments data rows start at row 2
      const paidBy = r[1] || '';
      const amt = cleanNumber(r[5]);
      if (!paidBy && amt === 0) continue;

      directPayments.push({
        id: `dp-${rowIndex}`,
        rowIndex,
        date: r[0] || '',
        paidBy,
        paidTo: r[2] || '',
        category: r[3] || 'Salary',
        project: r[4] || 'General',
        amount: amt,
        paymentMethod: r[6] || 'Bank Transfer',
        reference: r[7] || '',
        receiptLink: r[8] || '',
      });
    }

    this.saveToLocal(purchases, inflows, directPayments);
    return { purchases, inflows, directPayments };
  }

  /**
   * Fetch all data:
   * 1. First tries the Apps Script API if configured.
   * 2. Automatically falls back to reading live directly from the public Google Sheet CSV.
   * 3. Falls back to cached local storage if completely offline.
   */
  public static async fetchRemoteData(): Promise<{
    purchases: PurchaseExpense[];
    inflows: CapitalInflow[];
    directPayments: DirectPayment[];
  }> {
    const url = this.getApiUrl();

    if (url) {
      try {
        const resp = await fetch(`${url}?action=getData&_t=${Date.now()}`);
        if (resp.ok) {
          const json = await resp.json();
          if (json && json.success && json.data) {
            const { purchases, inflows, directPayments } = json.data;
            this.saveToLocal(purchases || [], inflows || [], directPayments || []);
            return {
              purchases: purchases || [],
              inflows: inflows || [],
              directPayments: directPayments || [],
            };
          }
        }
      } catch (err) {
        console.warn('Apps Script fetch failed, falling back to direct public sheet reader:', err);
      }
    }

    // Direct Google Sheet Live Reader Fallback
    try {
      const liveData = await this.fetchFromPublicSheet();
      if (liveData && (liveData.purchases.length > 0 || liveData.directPayments.length > 0)) {
        return liveData;
      }
    } catch (gvizErr) {
      console.warn('Could not read from Google Sheet live CSV, using local cache:', gvizErr);
    }

    return this.loadInitialLocalData();
  }

  /**
   * Explicitly test a Google Apps Script Web App URL with actionable feedback.
   */
  public static async testConnection(url: string): Promise<{ success: boolean; message: string }> {
    const trimmed = url.trim();
    if (!trimmed) {
      return {
        success: true,
        message: 'Saved in Local Read-Only Mode (Reads live from Google Sheet, but cloud writing is disabled).',
      };
    }

    if (trimmed.includes('docs.google.com/spreadsheets')) {
      throw new Error(
        'This is the Google Spreadsheet URL, not the Web App API URL! You must open Extensions > Apps Script, click Deploy > New deployment > Web app (Who has access: Anyone), and paste the resulting URL ending in /exec.'
      );
    }

    if (trimmed.endsWith('/dev')) {
      throw new Error(
        'This URL ends in /dev (Developer Test URL), which requires you to be logged into Google in the same browser and will fail on mobile. Please create a "New deployment" to get the live /exec URL.'
      );
    }

    if (!trimmed.includes('script.google.com/macros/s/')) {
      throw new Error(
        'Invalid Web App URL format. It should look like: https://script.google.com/macros/s/AKfycb.../exec'
      );
    }

    try {
      const resp = await fetch(`${trimmed}?action=ping&_t=${Date.now()}`);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: Could not reach Google Apps Script. Check deployment settings.`);
      }
      const json = await resp.json();
      if (json && (json.status === 'ok' || json.success)) {
        return {
          success: true,
          message: `Connected successfully to Google Spreadsheet "${json.spreadsheetName || 'ARIOT Finance Tracker'}"! Real-time 2-way sync is active.`,
        };
      }
      throw new Error(json.error || 'Unexpected response format from Apps Script.');
    } catch (err: any) {
      throw new Error(
        `Connection failed: ${err.message || 'Network error'}. Make sure deployment has "Execute as: Me" and "Who has access: Anyone".`
      );
    }
  }

  /**
   * Send command to Google Apps Script.
   * Tries POST first, and falls back to GET query parameters to prevent CORS/redirect drops on mobile browsers.
   */
  private static async sendCommand(
    action: string,
    payload: any
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    const url = this.getApiUrl();
    if (!url) {
      console.warn(`[Local Mode] Action ${action} performed locally. No Apps Script Web App URL configured.`);
      return {
        success: false,
        error: 'No Google Apps Script Web App URL configured. Entry saved locally on this device only.',
      };
    }

    // 1. Try POST with text/plain (avoids CORS preflight OPTIONS failure)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action,
          ...payload,
        }),
      });

      const resJson = await response.json();
      if (resJson && resJson.success) {
        return { success: true, data: resJson.data };
      }
      if (resJson && resJson.error) {
        return { success: false, error: resJson.error };
      }
    } catch (postErr: any) {
      console.warn(`POST ${action} failed, attempting GET fallback:`, postErr);
    }

    // 2. Fallback: Send via GET (handles mobile browsers where 302 redirects drop POST payloads)
    try {
      const queryData = encodeURIComponent(JSON.stringify(payload.data || {}));
      let getUrl = `${url}?action=${encodeURIComponent(action)}&data=${queryData}&_t=${Date.now()}`;
      if (payload.rowIndex) {
        getUrl += `&rowIndex=${payload.rowIndex}`;
      }

      const getResp = await fetch(getUrl);
      const getJson = await getResp.json();
      if (getJson && getJson.success) {
        return { success: true, data: getJson.data };
      }
      return {
        success: false,
        error: getJson?.error || 'Apps Script returned failure on GET fallback',
      };
    } catch (getErr: any) {
      console.error(`Error sending command ${action} via both POST and GET:`, getErr);
      return {
        success: false,
        error: getErr?.message || 'Network error communicating with Google Sheets',
      };
    }
  }

  // Purchases API
  public static async addPurchase(
    purchase: Omit<PurchaseExpense, 'id' | 'rowIndex'>
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('addPurchase', { data: purchase });
  }

  public static async updatePurchase(
    rowIndex: number,
    purchase: Partial<PurchaseExpense>
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('updatePurchase', { rowIndex, data: purchase });
  }

  public static async deletePurchase(rowIndex: number): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('deletePurchase', { rowIndex });
  }

  // Capital Inflow API
  public static async addInflow(
    inflow: Omit<CapitalInflow, 'id' | 'rowIndex'>
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('addInflow', { data: inflow });
  }

  public static async updateInflow(
    rowIndex: number,
    inflow: Partial<CapitalInflow>
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('updateInflow', { rowIndex, data: inflow });
  }

  public static async deleteInflow(rowIndex: number): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('deleteInflow', { rowIndex });
  }

  // Direct Payments API
  public static async addDirectPayment(
    payment: Omit<DirectPayment, 'id' | 'rowIndex'>
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('addDirectPayment', { data: payment });
  }

  public static async updateDirectPayment(
    rowIndex: number,
    payment: Partial<DirectPayment>
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('updateDirectPayment', { rowIndex, data: payment });
  }

  public static async deleteDirectPayment(rowIndex: number): Promise<{ success: boolean; error?: string }> {
    return this.sendCommand('deleteDirectPayment', { rowIndex });
  }
}
