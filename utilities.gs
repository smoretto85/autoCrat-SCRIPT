function fixIssue3495(documentId) {
  var document = DocumentApp.openById(documentId);
  removeEmptyTables(document.getBody());
  document.saveAndClose();
}

function removeEmptyTables(element) {
  if (element.getType() == DocumentApp.ElementType.TABLE && element.getNumChildren() == 0) {
    Logger.log('Found an empty table, removing it.');
    element.removeFromParent();
  } else {
    if (element.getNumChildren) {
      for (var i = 0; i < element.getNumChildren(); i++) {
        removeEmptyTables(element.getChild(i));
      }
    }
  }
}



function autoCrat_removeTimeoutTrigger() {
  var triggers = ScriptApp.getScriptTriggers();
  if (triggers.length>0) {
  for (var i=0; i<triggers.length; i++) {
    var handlerFunction = triggers[i].getHandlerFunction();
    if (handlerFunction=='autoCrat_runMerge') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}
}

function autoCrat_preemptTimeout() {
  var date = new Date();
  var newDate = new Date(date);
  newDate.setSeconds(date.getSeconds() + 60);
  ScriptApp.newTrigger('autoCrat_runMerge').timeBased().at(newDate).create();
  Browser.msgBox('Merge paused, restarting in one minute to avoid service timeout.');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//----------------------------------------- Tracking ----------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////////


//This function makes a call to the correct installation function.
//Embed this in the function that creates first actively loaded UI panel within the script
function setSid() { 
  var scriptNameLower = scriptName.toLowerCase();
  var sid = ScriptProperties.getProperty(scriptNameLower + "_sid");
  if (sid == null || sid == "")
  {
    var dt = new Date();
    var ms = dt.getTime();
    var ms_str = ms.toString();
    ScriptProperties.setProperty(scriptNameLower + "_sid", ms_str);
    var uid = UserProperties.getProperty(scriptNameLower + "_uid");
    if (uid) {
      logRepeatInstall();
    } else {
      logFirstInstall();
      UserProperties.setProperty(scriptNameLower + "_uid", ms_str);
    }      
  }
}

function logRepeatInstall() {
  var systemName = ScriptProperties.getProperty("systemName")
  NVSL.log("Repeat%20Install", scriptName, scriptTrackingId, systemName)
}

function logFirstInstall() {
  var systemName = ScriptProperties.getProperty("systemName")
  NVSL.log("First%20Install", scriptName, scriptTrackingId, systemName)
}


function autoCrat_institutionalTrackingUi() {
  NVSL.openInstitutionalTrackingUi();
}

function autoCrat_logDocCreation() {
   var systemName = ScriptProperties.getProperty('systemName');
   NVSL.log("Merged%20Doc%20Created", scriptName ,scriptTrackingId, systemName)
}

// utility function to clear all merge status messages and doc links associated with rows in the source sheet
// some may find it useful to set this on a regular time trigger (once a day, for example) within a given workflow
function autoCrat_clearAllFlags() {
  var sheetName = ScriptProperties.getProperty('sheetName');
  var ss = SpreadsheetApp.getActive();
  if ((sheetName)&&(sheetName!='')) {
    var sheet = ss.getSheetByName(sheetName);
    var headers = autoCrat_fetchSheetHeaders(sheetName);
    var lastCol = sheet.getLastColumn();
    var statusCol = headers.indexOf("Document Merge Status");
    var linkCol = headers.indexOf("Link to merged Doc");
    var urlCol = headers.indexOf("Merged Doc URL");
    var lastRow = sheet.getLastRow();
    if ((statusCol!=-1)&&(lastRow>1)) {
      var range = sheet.getRange(3, statusCol+1, lastRow-1, 1).clear();
    }
    if ((linkCol != -1)&&(lastRow>1)) {
      var range = sheet.getRange(3, linkCol+1, lastRow-1, 1).clear();
    }
    if ((urlCol != -1)&&(lastRow>1)) {
      var range = sheet.getRange(3, urlCol+1, lastRow-1, 1).clear();
    }
  }
}
