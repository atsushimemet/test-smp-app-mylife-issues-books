/**
 * Google Apps Script for Life Challenges Recommender
 * Google SheetsのデータをCSV形式で公開するためのスクリプト
 */

/**
 * スプレッドシートの指定されたシートをCSV形式で出力
 * @param {string} sheetName - シート名
 * @return {string} CSV形式の文字列
 */
function exportSheetToCsv(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('シート "' + sheetName + '" が見つかりません');
  }
  
  var data = sheet.getDataRange().getValues();
  var csvContent = '';
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var csvRow = '';
    
    for (var j = 0; j < row.length; j++) {
      var cellValue = row[j].toString();
      
      // カンマや改行、ダブルクォートを含む場合はダブルクォートで囲む
      if (cellValue.indexOf(',') !== -1 || 
          cellValue.indexOf('\n') !== -1 || 
          cellValue.indexOf('"') !== -1) {
        cellValue = '"' + cellValue.replace(/"/g, '""') + '"';
      }
      
      csvRow += cellValue;
      if (j < row.length - 1) {
        csvRow += ',';
      }
    }
    
    csvContent += csvRow + '\n';
  }
  
  return csvContent;
}

/**
 * Roadmapシートをファイル出力
 */
function exportRoadmapToCsv() {
  try {
    var csvContent = exportSheetToCsv('Roadmap');
    var blob = Utilities.newBlob(csvContent, 'text/csv', 'roadmap.csv');
    
    // Google Driveに保存
    DriveApp.createFile(blob);
    Logger.log('Roadmap CSV exported successfully');
    
    return csvContent;
  } catch (error) {
    Logger.log('Error exporting Roadmap CSV: ' + error.toString());
    throw error;
  }
}

/**
 * BooksシートをCSV出力
 */
function exportBooksToCsv() {
  try {
    var csvContent = exportSheetToCsv('Books');
    var blob = Utilities.newBlob(csvContent, 'text/csv', 'books.csv');
    
    // Google Driveに保存
    DriveApp.createFile(blob);
    Logger.log('Books CSV exported successfully');
    
    return csvContent;
  } catch (error) {
    Logger.log('Error exporting Books CSV: ' + error.toString());
    throw error;
  }
}

/**
 * WebアプリケーションのdoGet関数
 * URLパラメータでシートを指定してCSVを返す
 */
function doGet(e) {
  var sheetName = e.parameter.sheet;
  
  if (!sheetName) {
    return ContentService
      .createTextOutput('シート名を指定してください (?sheet=Roadmap または ?sheet=Books)')
      .setMimeType(ContentService.MimeType.TEXT);
  }
  
  try {
    var csvContent = exportSheetToCsv(sheetName);
    
    return ContentService
      .createTextOutput(csvContent)
      .setMimeType(ContentService.MimeType.CSV)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  } catch (error) {
    return ContentService
      .createTextOutput('エラー: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * 定期的にCSVを更新するトリガー関数
 */
function scheduledUpdate() {
  try {
    exportRoadmapToCsv();
    exportBooksToCsv();
    Logger.log('Scheduled CSV update completed');
  } catch (error) {
    Logger.log('Scheduled update error: ' + error.toString());
  }
}

/**
 * トリガーをセットアップする関数
 */
function setupTriggers() {
  // 既存のトリガーを削除
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // 1時間ごとに実行するトリガーを作成
  ScriptApp.newTrigger('scheduledUpdate')
    .timeBased()
    .everyHours(1)
    .create();
    
  Logger.log('Trigger setup completed');
}