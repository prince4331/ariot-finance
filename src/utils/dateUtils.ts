const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format any date into Google Sheet style: DD-MMM-YYYY (e.g. 18-Apr-2026)
 */
export function formatToSheetDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';

  // If already in DD-MMM-YYYY format (e.g. 18-Apr-2026)
  if (typeof dateInput === 'string' && /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }

  const d = typeof dateInput === 'string' ? parseDateFlexible(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) {
    return String(dateInput);
  }

  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = MONTH_NAMES[d.getMonth()];
  const yyyy = d.getFullYear();

  return `${dd}-${mmm}-${yyyy}`;
}

/**
 * Convert Sheet format DD-MMM-YYYY (e.g. 18-Apr-2026) to HTML input date YYYY-MM-DD
 */
export function toInputDateFormat(dateStr: string | null | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }

  const d = parseDateFlexible(dateStr);
  if (!d || isNaN(d.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Flexible parser supporting DD-MMM-YYYY, YYYY-MM-DD, ISO timestamps
 */
export function parseDateFlexible(dateStr: string): Date | null {
  if (!dateStr) return null;
  const str = dateStr.trim();

  // Pattern: 18-Apr-2026
  const dmmmyyyy = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dmmmyyyy) {
    const day = parseInt(dmmmyyyy[1], 10);
    const monthStr = dmmmyyyy[2].toLowerCase();
    const year = parseInt(dmmmyyyy[3], 10);
    const monthIndex = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase() === monthStr
    );
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day);
    }
  }

  // Pattern: 2026-04-18
  const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    return new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10));
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}
