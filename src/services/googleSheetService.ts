import { PurchaseExpense, CapitalInflow, DirectPayment } from '../types/finance';
import { INITIAL_PURCHASES, INITIAL_INFLOWS, INITIAL_DIRECT_PAYMENTS } from '../data/initialData';

const STORAGE_KEYS = {
  PURCHASES: 'ariot_finance_purchases_v1',
  INFLOWS: 'ariot_finance_inflows_v1',
  DIRECT_PAYMENTS: 'ariot_finance_direct_payments_v1',
  APPS_SCRIPT_URL: 'ariot_finance_apps_script_url_v1',
};

export class GoogleSheetService {
  private static getApiUrl(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.APPS_SCRIPT_URL) ||
      import.meta.env.VITE_APPS_SCRIPT_URL ||
      ''
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
   * Fetch all data from Google Apps Script Web App
   */
  public static async fetchRemoteData(): Promise<{
    purchases: PurchaseExpense[];
    inflows: CapitalInflow[];
    directPayments: DirectPayment[];
  }> {
    const url = this.getApiUrl();
    if (!url) {
      return this.loadInitialLocalData();
    }

    try {
      const resp = await fetch(`${url}?action=getData&_t=${Date.now()}`);
      if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status}`);
      }
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
      throw new Error(json.error || 'Failed to parse data');
    } catch (err) {
      console.warn('Could not fetch from remote Apps Script, using local cache:', err);
      return this.loadInitialLocalData();
    }
  }

  /**
   * Send command to Google Apps Script
   */
  private static async sendCommand(action: string, payload: any): Promise<any> {
    const url = this.getApiUrl();
    if (!url) {
      console.log(`[Offline / Local Mode] Action ${action} performed locally.`);
      return { success: true, localOnly: true };
    }

    try {
      // Use text/plain to prevent CORS preflight OPTIONS request failure
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
      return resJson;
    } catch (err) {
      console.error(`Error sending command ${action}:`, err);
      // Return success with warning so local optimistic update stays intact
      return { success: false, error: err };
    }
  }

  // Purchases API
  public static async addPurchase(purchase: Omit<PurchaseExpense, 'id' | 'rowIndex'>): Promise<any> {
    return this.sendCommand('addPurchase', { data: purchase });
  }

  public static async updatePurchase(rowIndex: number, purchase: Partial<PurchaseExpense>): Promise<any> {
    return this.sendCommand('updatePurchase', { rowIndex, data: purchase });
  }

  public static async deletePurchase(rowIndex: number): Promise<any> {
    return this.sendCommand('deletePurchase', { rowIndex });
  }

  // Capital Inflow API
  public static async addInflow(inflow: Omit<CapitalInflow, 'id' | 'rowIndex'>): Promise<any> {
    return this.sendCommand('addInflow', { data: inflow });
  }

  public static async updateInflow(rowIndex: number, inflow: Partial<CapitalInflow>): Promise<any> {
    return this.sendCommand('updateInflow', { rowIndex, data: inflow });
  }

  public static async deleteInflow(rowIndex: number): Promise<any> {
    return this.sendCommand('deleteInflow', { rowIndex });
  }

  // Direct Payments API
  public static async addDirectPayment(payment: Omit<DirectPayment, 'id' | 'rowIndex'>): Promise<any> {
    return this.sendCommand('addDirectPayment', { data: payment });
  }

  public static async updateDirectPayment(rowIndex: number, payment: Partial<DirectPayment>): Promise<any> {
    return this.sendCommand('updateDirectPayment', { rowIndex, data: payment });
  }

  public static async deleteDirectPayment(rowIndex: number): Promise<any> {
    return this.sendCommand('deleteDirectPayment', { rowIndex });
  }
}
