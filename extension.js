const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

let documentHistory = new Map();

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  /* Activate the extension */
  console.log("History extension activated.");

  const saveTab = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const tabName = editor.document.fileName;
      const tabContent = editor.document.getText();
      if (!documentHistory.has(tabName)) {
        documentHistory.set(tabName, tabContent);
        saveToDisk(tabName, tabContent);
      }
    }
  };

  const saveAllTabs = () => {
    vscode.workspace.textDocuments.forEach((document) => {
      const tabContent = document.getText();
      const tabName = document.fileName;
      if (!documentHistory.has(tabName)) {
        documentHistory.set(tabName, tabContent);
        saveToDisk(tabName, tabContent);
      }
    });
  };

  const saveToDisk = (tabName, tabContent) => {
    if (documentHistory.size > 0) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        console.log(workspaceFolders[0].uri.fsPath);
        const historyDir = path.join(
          workspaceFolders[0].uri.fsPath,
          ".history"
        );
        if (!fs.existsSync(historyDir)) {
          fs.mkdirSync(historyDir);
        }

        const filePath = path.join(historyDir, `${path.basename(tabName)}.txt`);
        fs.writeFileSync(filePath, tabContent);
      } else {
        vscode.window.showInformationMessage("No workspace folders found.");
      }
    }
  };

  let saveHistory = vscode.commands.registerCommand(
    "sql-history.saveHistory",
    function () {
      saveTab();
      console.log(documentHistory);
      vscode.window.showInformationMessage("Tab was added to SQL History!");
    }
  );

  let saveAllTabsHistory = vscode.commands.registerCommand(
    "sql-history.saveAllTabsHistory",
    function () {
      saveAllTabs();
      console.log(documentHistory);
      vscode.window.showInformationMessage(
        "All tabs were added to SQL History!"
      );
    }
  );

  let saveToDiskHistory = vscode.commands.registerCommand(
    "sql-history.saveToDiskHistory",
    function () {
      saveAllTabs();
      console.log(documentHistory);
      vscode.window.showInformationMessage(
        "All tabs were saved to SQL History!"
      );
    }
  );

   let disposable = vscode.commands.registerCommand('sql-history.logOpenDocuments', () => {
    vscode.workspace.textDocuments.forEach((document) => {
        console.log(`Document: ${document.fileName}`);
    });
});


  /*
    Run saveAllTabs every 5 minutes after the extension is activated;
  */
  setInterval(saveAllTabs, 300000);

  context.subscriptions.push(
    saveHistory,
    saveAllTabsHistory,
    saveToDiskHistory,
    disposable
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
