// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const ipc = require('electron').ipcRenderer;

const buttonCreated = document.getElementById('upload');
const buttonConvert = document.getElementById('convert');
const filePath = document.getElementById('file_path');
const headers = document.getElementById('headers');
const headerBody = document.getElementById('header_body');
const newSelect = document.getElementById('headers_select');
const textSelected = document.getElementById('text_selected');
const csvPath = document.getElementById('csv_file_path');
let selected_headers = [];
let json_path = "";
let csv_path = "";


/**
 * Select Select Button Clicked
 */
buttonCreated.addEventListener('click', function (event) {
    buttonCreated.classList.add('disabled');
    ipc.send('open-file-dialog')
});

/**
 * Select Convert Button Clicked
 */
buttonConvert.addEventListener('click', function (event) {
    buttonConvert.classList.add('disabled');
    if (selected_headers.length) {
        ipc.send('selected_header', { selected_headers: selected_headers, csvPath: csv_path, jsonPath: json_path });
    }
});

ipc.on('coverstion-completed', function (event, data) {
    setCSVfilePath(json_path);
    buttonConvert.classList.remove('disabled');
});

/**
 * OpenDialog Selected a file
 */
ipc.on('selected-file', function (event, data) {
    
    if (data.path != "" && data.headers.length > 0) {
        json_path = data.path;
        filePath.innerText = data.path;
        setCSVfilePath(data.path)
        newSelect.innerText = null;
        data.headers.forEach(function (element, index) {
            var opt = document.createElement("option");
            opt.value = element;
            opt.innerHTML = element;
            opt.selected = true;
            newSelect.appendChild(opt);
        });
        selected_headers = data.headers;
        addActivityItem();
        headerBody.classList.remove('invisible');
    }else{
        headerBody.classList.add('invisible');
    }
    buttonCreated.classList.remove('disabled');
});

/**
 * SelectBox Click Event
 */
newSelect.addEventListener("click", function () {
    addActivityItem();
});
/**
 * SelectBox Change Event
*/
newSelect.addEventListener("change", function () {
    addActivityItem();
});

function setCSVfilePath(path) {
    csv_path = path.replace(/.json/gi, "_" + getFormattedTime() + ".csv");
    csvPath.innerText = csv_path;
}


function addActivityItem() {
    var options = newSelect.selectedOptions;
    var values = Array.from(options).map(({ value }) => value);
    selected_headers = values;
    textSelected.value = selected_headers.join(', ');
    // if (selected_headers.length) {
    //     ipc.send('selected_header', { selected_headers: selected_headers, csvPath: csv_path, jsonPath: json_path });
    // }
}

function getFormattedTime() {
    var today = new Date();
    var y = today.getFullYear();
    // JavaScript months are 0-based.
    var m = today.getMonth() + 1;
    var d = today.getDate();
    var h = today.getHours();
    var mi = today.getMinutes();
    var s = today.getSeconds();
    return y + "-" + m + "-" + d + "-" + h + "-" + mi + "-" + s;
}