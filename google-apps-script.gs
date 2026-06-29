/**
 * RSVP-Backend für die Hochzeitseinladung Anelya & Raúl
 * =======================================================
 * EINRICHTUNG:
 * 1. Neues Google Sheet erstellen (sheets.new)
 * 2. Im Sheet: Erweiterungen → Apps Script
 * 3. Den gesamten Inhalt dieser Datei in den Editor einfügen
 *    (vorhandenen Beispielcode komplett ersetzen)
 * 4. Oben speichern (Diskettensymbol)
 * 5. "Bereitstellen" → "Neue Bereitstellung"
 *    - Typ: "Web-App"
 *    - Ausführen als: "Ich"
 *    - Zugriff: "Jeder" (wichtig, sonst kann das Formular nicht senden)
 * 6. "Bereitstellen" klicken, Google-Konto bestätigen,
 *    Warnung "Unsichere App" → "Erweitert" → "Trotzdem öffnen" akzeptieren
 *    (das ist normal bei eigenen Apps Scripts, keine echte Gefahr)
 * 7. Die angezeigte "Web-App-URL" kopieren
 * 8. Diese URL in script.js bei GOOGLE_SHEETS_URL einsetzen
 *
 * Jede neue RSVP-Antwort erscheint automatisch als neue Zeile
 * im Tabellenblatt "RSVP" (wird beim ersten Aufruf automatisch angelegt).
 */

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),                 // Zeitstempel des Eingangs
      data.name || '',
      data.attending || '',
      data.guests || '',
      data.comment || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('RSVP');

  if (!sheet) {
    sheet = ss.insertSheet('RSVP');
    sheet.appendRow(['Zeitstempel', 'Name', 'Teilnahme', 'Anzahl Gäste', 'Kommentar']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}
