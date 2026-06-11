/**
 * Mission Control — Google Sheets backend (read + write)
 * Paste this whole file into: your Sheet → Extensions → Apps Script → Code.gs
 * Then Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → Deploy.
 * Copy the /exec URL it gives you and paste it into index.html as GAS_URL.
 *
 * Writes are header-mapped: the script matches by column NAME, and creates any
 * missing column (e.g. "Firebase Link") automatically. Nothing existing is harmed.
 */

function sheet_() {
  // Uses the first sheet/tab. Change getSheets()[0] if your data is on another tab.
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

// ---- READ: return all rows as a 2D array (header row first) ----
function doGet() {
  const data = sheet_().getDataRange().getValues();
  return json_(data);
}

// ---- WRITE: add / update / delete a row ----
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const row = body.data || {};
    const sh = sheet_();

    // Build a name->columnIndex map from the header row, creating missing columns.
    let headers = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
    function colFor(name) {
      let i = headers.findIndex(h => String(h).trim().toLowerCase() === name.trim().toLowerCase());
      if (i === -1) { headers.push(name); i = headers.length - 1; sh.getRange(1, i + 1).setValue(name); }
      return i; // 0-based
    }

    if (action === 'add') {
      const out = new Array(headers.length).fill('');
      Object.keys(row).forEach(k => { out[colFor(k)] = row[k]; });
      // re-read length in case columns were added
      const full = new Array(sh.getLastColumn()).fill('');
      for (let i = 0; i < out.length; i++) full[i] = out[i];
      sh.appendRow(full);
      return json_({ ok: true, action: 'add' });
    }

    if (action === 'delete') {
      const nameCol = colFor('App Name');
      const all = sh.getDataRange().getValues();
      for (let r = all.length - 1; r >= 1; r--) {
        if (String(all[r][nameCol]).trim() === String(row['App Name']).trim()) { sh.deleteRow(r + 1); break; }
      }
      return json_({ ok: true, action: 'delete' });
    }

    if (action === 'update') {
      const nameCol = colFor('App Name');
      const all = sh.getDataRange().getValues();
      for (let r = 1; r < all.length; r++) {
        if (String(all[r][nameCol]).trim() === String(row['App Name']).trim()) {
          Object.keys(row).forEach(k => { sh.getRange(r + 1, colFor(k) + 1).setValue(row[k]); });
          break;
        }
      }
      return json_({ ok: true, action: 'update' });
    }

    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* =========================================================================
 * PHASE 2 (OPTIONAL) — Play Console auto-status
 * Pulls Draft/Pending/Live + install stats into the sheet on a schedule.
 * Requires: Play Console → Setup → API access → linked service account,
 * the Google Play Android Developer API enabled, and the service-account
 * having access. Fill PACKAGES below. Then add a time-trigger for syncPlay().
 * Leave this untouched until you're ready — it does nothing on its own.
 * ========================================================================= */
const PACKAGES = {
  // "App Name in sheet": "com.your.package",
};

function syncPlay() {
  // Stub. Wire to Play Developer API edits.get / reviews once service account is linked.
  // Kept minimal on purpose — set up the service account first, then ask to complete this.
}
