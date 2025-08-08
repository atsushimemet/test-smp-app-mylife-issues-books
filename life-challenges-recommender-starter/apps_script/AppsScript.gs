/**
 * スプレッドシートから Roadmap/Books を CSV で返す Apps Script 例
 * デプロイ: ウェブアプリとしてデプロイ（誰でもアクセス可）
 * 例: https://script.google.com/macros/s/.../exec?type=roadmap
 */

function doGet(e) {
  var type = (e && e.parameter && e.parameter.type) || 'roadmap';
  var sheetName = type === 'books' ? 'Books' : 'Roadmap';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return ContentService.createTextOutput('Sheet not found').setMimeType(ContentService.MimeType.TEXT);
  }

  var data = sheet.getDataRange().getValues();
  var csv = data.map(function (row) {
    return row.map(function (cell) {
      if (typeof cell === 'string' && (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1 || cell.indexOf('\n') !== -1)) {
        return '"' + cell.replace(/"/g, '""') + '"';
      }
      return cell;
    }).join(',');
  }).join('\n');

  return ContentService
    .createTextOutput(csv)
    .setMimeType(ContentService.MimeType.CSV);
}