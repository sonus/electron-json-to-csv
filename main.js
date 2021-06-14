// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const dialog = require('electron').dialog;
ipc = require('electron').ipcMain
const path = require('path')
const os = require('os')
const fs = require('fs');
const { readFile, writeFile } = require('fs').promises;
const jsonexport = require('jsonexport');
let json_data = {};
let result_data = {};


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 513,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  //DEVELOPMENT
  // mainWindow.webContents.openDevTools();

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
    title: 'Select Json File',
    properties: ['openFile', 'openDirectory'],
    filters: [
      { name: 'Json', extensions: ['json'] },
    ]
  }).then(result => {
    if (!result.canceled) {
      let rawdata = fs.readFileSync(result.filePaths[0]);
      json_data = JSON.parse(rawdata);
      event.sender.send('selected-file', { path: result.filePaths[0], headers: Object.keys(json_data[0]) })
    }else{
      event.sender.send('selected-file', { path: '', headers: [] })
    }
  }).catch(err => {
    console.log(err)
  })
})

ipc.on('selected_header', function (event, result) {
  result_data = result;

  const reader = fs.createReadStream(result.jsonPath);
  const writer = fs.createWriteStream(result.csvPath);

  reader.pipe(jsonexport()).pipe(writer);

  // let rawdata1 = fs.readFileSync(result.jsonPath);
  // const json = JSON.parse(rawdata1);
  // var xls = json2xls(json);
  // fs.writeFileSync(result.csvPath +".xlsx", xls, 'binary');




  event.sender.send('coverstion-completed', { path: 1 })

  // (async () => {
  //   const data = await parseJSONFile(result.jsonPath);
  //   const CSV = arrayToCSV(data, result.selected_headers);
  //   await writeCSV(result.csvPath, CSV);
  //   // console.log(`Successfully converted ${result.csvPath}!`);
  //   event.sender.send('coverstion-completed', { path: 1 })
  // })();
})


async function parseJSONFile(fileName) {
  try {
    const file = await readFile(fileName);
    return JSON.parse(file);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

function arrayToCSV(data, headers) {
  csv = data.map(function (row) {
    for (var key in row) {
      if (headers.indexOf(key) <= -1) {
        delete row[key];
      }
    }
    // console.log(row);
    return Object.values(row);
  });
  // csv = data.map(row => Object.values(row));
  csv.unshift(headers);
  return csv.join('\n');
}

async function writeCSV(fileName, data) {
  try {
    await writeFile(fileName, data, 'utf8');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}