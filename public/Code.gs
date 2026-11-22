/**
 * ARIOT Finance - Google Apps Script Web App API
 * 
 * Setup Instructions:
 * 1. In your Google Spreadsheet (https://docs.google.com/spreadsheets/d/14gJNHpGP0a0iuN75FcnkplXUkbHSykc3u-6J4Qcgp7I/edit):
 *    Click on "Extensions" > "Apps Script".
 * 2. Delete any existing code and replace with this entire file.
 * 3. Click "Save" (disk icon).
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "ARIOT Finance Web UI API".
 * 7. Set "Execute as": "Me" (your Google account).
 * 8. Set "Who has access": "Anyone" (allows your Web UI to call the API).
 * 9. Click "Deploy" and authorize the permissions.
 * 10. Copy the "Web app URL" and paste it into the Web UI settings!
 */

var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var SPREADSHEET_ID = '14gJNHpGP0a0iuN75FcnkplXUkbHSykc3u-6J4Qcgp7I';

function getSpreadsheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  try {
    var ss = getSpreadsheet();
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || 'getData';

    if (action === 'getData') {
      return respondJson({
        success: true,
        data: getAllData(ss)
      });
    }

    if (action === 'ping') {
      return respondJson({
        status: "ok",
        spreadsheetName: ss.getName(),
        message: "ARIOT Finance API is online"
      });
    }

    // Support GET requests with actions for robust cross-origin calls
    var payloadData = null;
    if (params.data) {
      try {
        payloadData = JSON.parse(params.data);
      } catch (err) {
        payloadData = params.data;
      }
    }
    var rowIndex = params.rowIndex ? parseInt(params.rowIndex, 10) : undefined;
    var result = handleAction(ss, action, { data: payloadData, rowIndex: rowIndex });

    return respondJson({
      success: true,
      result: result,
      data: getAllData(ss)
    });
  } catch (err) {
    return respondJson({
      success: false,
      error: err.toString()
    });
  }
}

function doPost(e) {
  try {
    var postData = "";
    if (e && e.postData && e.postData.contents) {
      postData = e.postData.contents;
    }
    
    var payload = {};
    if (postData) {
      try {
        payload = JSON.parse(postData);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    var ss = getSpreadsheet();
    var action = payload.action;
    var result = handleAction(ss, action, payload);

    return respondJson({
      success: true,
      result: result,
      data: getAllData(ss)
    });
  } catch (err) {
    return respondJson({
      success: false,
      error: err.toString()
    });
  }
}

function handleAction(ss, action, payload) {
  var result = {};
  switch (action) {
    case 'addPurchase':
      result = addPurchase(ss, payload.data);
      break;
    case 'updatePurchase':
      result = updatePurchase(ss, payload.rowIndex, payload.data);
      break;
    case 'deletePurchase':
      result = deleteRow(ss, 'Purchases & Expenses', payload.rowIndex);
      break;

    case 'addInflow':
      result = addInflow(ss, payload.data);
      break;
    case 'updateInflow':
      result = updateInflow(ss, payload.rowIndex, payload.data);
      break;
    case 'deleteInflow':
      result = deleteRow(ss, 'Capital Inflow', payload.rowIndex);
      break;

    case 'addDirectPayment':
      result = addDirectPayment(ss, payload.data);
      break;
    case 'updateDirectPayment':
      result = updateDirectPayment(ss, payload.rowIndex, payload.data);
      break;
    case 'deleteDirectPayment':
      result = deleteRow(ss, 'Direct Payments', payload.rowIndex);
      break;

    default:
      throw new Error("Unknown action: " + action);
  }
  return result;
}

function respondJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Returns exact Google Sheet format: DD-MMM-YYYY (e.g. 18-Apr-2026)
 */
function formatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    var dd = String(val.getDate()).padStart(2, '0');
    var mmm = MONTH_NAMES[val.getMonth()];
    var yyyy = val.getFullYear();
    return dd + "-" + mmm + "-" + yyyy;
  }
  return String(val);
}

function parseInputDate(str) {
  if (!str) return new Date();
  if (str instanceof Date) return str;
  var s = String(str).trim();

  // Pattern: 18-Apr-2026
  var match = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (match) {
    var day = parseInt(match[1], 10);
    var monthStr = match[2].toLowerCase();
    var year = parseInt(match[3], 10);
    for (var i = 0; i < MONTH_NAMES.length; i++) {
      if (MONTH_NAMES[i].toLowerCase() === monthStr) {
        return new Date(year, i, day);
      }
    }
  }

  // Pattern: YYYY-MM-DD
  var parts = s.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  return new Date(str);
}

function getAllData(ss) {
  return {
    purchases: getPurchases(ss),
    inflows: getInflows(ss),
    directPayments: getDirectPayments(ss)
  };
}

// ---------------- PURCHASES & EXPENSES ----------------
function getPurchases(ss) {
  var sheet = ss.getSheetByName('Purchases & Expenses');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) return [];

  var range = sheet.getRange(4, 1, lastRow - 3, 13);
  var values = range.getValues();
  var records = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowIndex = i + 4;
    var comp = row[5];
    var cat = row[6];
    var cost = row[10];

    if (!comp && !cat && !cost) continue;

    records.push({
      id: "pe-" + rowIndex,
      rowIndex: rowIndex,
      date: formatDate(row[0]),
      receiptNo: String(row[1] || ""),
      receiptLink: String(row[2] || ""),
      purchasedBy: String(row[3] || ""),
      paidBy: String(row[4] || ""),
      component: String(row[5] || ""),
      category: String(row[6] || ""),
      project: String(row[7] || ""),
      qty: Number(row[8]) || 1,
      unitCost: Number(row[9]) || 0,
      totalCost: Number(row[10]) || ((Number(row[8]) || 1) * (Number(row[9]) || 0)),
      paymentMethod: String(row[11] || "Cash"),
      notes: String(row[12] || "")
    });
  }
  return records;
}

function findNextAvailableRow(sheet, startRow, checkCol) {
  var lastRow = sheet.getLastRow();
  if (lastRow < startRow) return startRow;

  var colValues = sheet.getRange(startRow, checkCol, lastRow - startRow + 1, 1).getValues();
  for (var i = 0; i < colValues.length; i++) {
    var val = colValues[i][0];
    if (val === "" || val === null || val === undefined) {
      return startRow + i;
    }
  }
  return lastRow + 1;
}

function addPurchase(ss, data) {
  var sheet = ss.getSheetByName('Purchases & Expenses');
  var nextRow = findNextAvailableRow(sheet, 4, 6); // Check Component column

  var receiptNo = data.receiptNo;
  if (!receiptNo) {
    var existing = getPurchases(ss);
    receiptNo = String(existing.length + 1).padStart(2, '0');
  }

  var dateObj = parseInputDate(data.date);
  var qty = Number(data.qty) || 1;
  var unitCost = Number(data.unitCost) || 0;
  var formula = "=I" + nextRow + "*J" + nextRow;

  var rowRange = sheet.getRange(nextRow, 1, 1, 13);
  rowRange.setValues([[
    dateObj,
    receiptNo,
    data.receiptLink || "",
    data.purchasedBy || "",
    data.paidBy || "",
    data.component || "",
    data.category || "",
    data.project || "",
    qty,
    unitCost,
    formula,
    data.paymentMethod || "Cash",
    data.notes || ""
  ]]);

  sheet.getRange(nextRow, 1).setNumberFormat("dd-mmm-yyyy");

  return { rowIndex: nextRow, receiptNo: receiptNo };
}

function updatePurchase(ss, rowIndex, data) {
  var sheet = ss.getSheetByName('Purchases & Expenses');
  var formula = "=I" + rowIndex + "*J" + rowIndex;
  var dateObj = parseInputDate(data.date);

  sheet.getRange(rowIndex, 1, 1, 13).setValues([[
    dateObj,
    data.receiptNo || "",
    data.receiptLink || "",
    data.purchasedBy || "",
    data.paidBy || "",
    data.component || "",
    data.category || "",
    data.project || "",
    Number(data.qty) || 1,
    Number(data.unitCost) || 0,
    formula,
    data.paymentMethod || "Cash",
    data.notes || ""
  ]]);

  sheet.getRange(rowIndex, 1).setNumberFormat("dd-mmm-yyyy");

  return { rowIndex: rowIndex, updated: true };
}

// ---------------- CAPITAL INFLOW ----------------
function getInflows(ss) {
  var sheet = ss.getSheetByName('Capital Inflow');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) return [];

  var range = sheet.getRange(4, 1, lastRow - 3, 8);
  var values = range.getValues();
  var records = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowIndex = i + 4;
    var contrib = row[1];
    var amt = row[3];

    if (!contrib && !amt) continue;

    records.push({
      id: "ci-" + rowIndex,
      rowIndex: rowIndex,
      date: formatDate(row[0]),
      contributor: String(row[1] || ""),
      receivedBy: String(row[2] || ""),
      amount: Number(row[3]) || 0,
      taggedFor: String(row[4] || ""),
      project: String(row[5] || ""),
      paymentMethod: String(row[6] || "Bank Transfer"),
      notes: String(row[7] || "")
    });
  }
  return records;
}

function addInflow(ss, data) {
  var sheet = ss.getSheetByName('Capital Inflow');
  var nextRow = findNextAvailableRow(sheet, 4, 2); // Check Contributor column

  var dateObj = parseInputDate(data.date);

  sheet.getRange(nextRow, 1, 1, 8).setValues([[
    dateObj,
    data.contributor || "",
    data.receivedBy || "",
    Number(data.amount) || 0,
    data.taggedFor || "",
    data.project || "",
    data.paymentMethod || "Bank Transfer",
    data.notes || ""
  ]]);

  sheet.getRange(nextRow, 1).setNumberFormat("dd-mmm-yyyy");

  return { rowIndex: nextRow };
}

function updateInflow(ss, rowIndex, data) {
  var sheet = ss.getSheetByName('Capital Inflow');
  var dateObj = parseInputDate(data.date);

  sheet.getRange(rowIndex, 1, 1, 8).setValues([[
    dateObj,
    data.contributor || "",
    data.receivedBy || "",
    Number(data.amount) || 0,
    data.taggedFor || "",
    data.project || "",
    data.paymentMethod || "Bank Transfer",
    data.notes || ""
  ]]);

  sheet.getRange(rowIndex, 1).setNumberFormat("dd-mmm-yyyy");

  return { rowIndex: rowIndex, updated: true };
}

// ---------------- DIRECT PAYMENTS ----------------
function getDirectPayments(ss) {
  var sheet = ss.getSheetByName('Direct Payments');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var range = sheet.getRange(2, 1, lastRow - 1, 9);
  var values = range.getValues();
  var records = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowIndex = i + 2;
    var paidBy = row[1];
    var amt = row[5];

    if (!paidBy && !amt) continue;

    records.push({
      id: "dp-" + rowIndex,
      rowIndex: rowIndex,
      date: formatDate(row[0]),
      paidBy: String(row[1] || ""),
      paidTo: String(row[2] || ""),
      category: String(row[3] || ""),
      project: String(row[4] || ""),
      amount: Number(row[5]) || 0,
      paymentMethod: String(row[6] || "Bank Transfer"),
      reference: String(row[7] || ""),
      receiptLink: String(row[8] || "")
    });
  }
  return records;
}

function addDirectPayment(ss, data) {
  var sheet = ss.getSheetByName('Direct Payments');
  var nextRow = findNextAvailableRow(sheet, 2, 2); // Check Paid By column

  var dateObj = parseInputDate(data.date);

  sheet.getRange(nextRow, 1, 1, 9).setValues([[
    dateObj,
    data.paidBy || "",
    data.paidTo || "",
    data.category || "",
    data.project || "",
    Number(data.amount) || 0,
    data.paymentMethod || "Bank Transfer",
    data.reference || "",
    data.receiptLink || ""
  ]]);

  sheet.getRange(nextRow, 1).setNumberFormat("dd-mmm-yyyy");

  return { rowIndex: nextRow };
}

function updateDirectPayment(ss, rowIndex, data) {
  var sheet = ss.getSheetByName('Direct Payments');
  var dateObj = parseInputDate(data.date);

  sheet.getRange(rowIndex, 1, 1, 9).setValues([[
    dateObj,
    data.paidBy || "",
    data.paidTo || "",
    data.category || "",
    data.project || "",
    Number(data.amount) || 0,
    data.paymentMethod || "Bank Transfer",
    data.reference || "",
    data.receiptLink || ""
  ]]);

  sheet.getRange(rowIndex, 1).setNumberFormat("dd-mmm-yyyy");

  return { rowIndex: rowIndex, updated: true };
}

// ---------------- DELETE HELPER ----------------
function deleteRow(ss, sheetName, rowIndex) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  sheet.deleteRow(rowIndex);
  return { deletedRow: rowIndex };
}
