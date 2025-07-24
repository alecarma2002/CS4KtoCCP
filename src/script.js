var fs = nw.require('fs');
const xml2js = nw.require('xml2js');
const createTable = nw.require('./utils/createExcelTable.mjs');
const convertToCCP = nw.require('./utils/convertToCCP.mjs');


var loopUnits = [];
var configJson;
var configToolVersion;

var dialogBox = document.getElementById("dialogBox");
var fileInput = document.getElementById("choseFile");
var closeBtn = document.getElementById("closeBtn");
var convertBtn = document.getElementById("convertBtn");
var convertPathBtn = document.getElementById("convertPathBtn");
var excelBtn = document.getElementById("excelBtn");
var excelPathBtn = document.getElementById("excelPathBtn");
var versionConfirmBtn = document.getElementById("versionConfirmBtn");
var versionSelectDropdown = document.getElementById("versionSelectDropdown");

checkVersion();



fileInput.addEventListener("change", parseConfigFile);

document.getElementById("choseFileBtn").addEventListener("click", () => {
    loopUnits = [];
    dialogBox.innerHTML = "";
    excelBtn.style.display = "none";
    convertBtn.style.display = "none";
    fileInput.click();
});

excelBtn.addEventListener("click", () => {
    excelPathBtn.click();
});

excelPathBtn.addEventListener("change", (event) => {
    
    const filePath = event.target.files[0]?.path;
    if (!filePath) return;

    try {
        dialogBox.innerHTML += `<br>Creating Excel file...`;
        createTable.Excel(filePath,loopUnits)
        dialogBox.innerHTML += `<br>Succesfully created file at ${filePath}`;
        loopUnits = [];
        excelBtn.style.display = "none";
        closeBtn.style.display = "";
    } catch (error) {
        console.log(error)
        dialogBox.innerHTML += `<br>Could not create the Excel file`;
    }

    
});

versionConfirmBtn.addEventListener("click",()=>{
    configToolVersion = versionSelectDropdown.value;
    popup.style.display = "none";
    convertPathBtn.click();
});

convertBtn.addEventListener("click", () =>{
    popup.style.display = "";
})

convertPathBtn.addEventListener("change", async (event) =>{
    const filePath = event.target.files[0]?.path;
    if (!filePath) return;

    try {
        dialogBox.innerHTML += "<br>Converting to CCP....";
        const CCPconf = await convertToCCP.convert(configJson,configToolVersion);
        console.log(CCPconf)

        dialogBox.innerHTML += "<br>Succesfully converted to CCP configuration";

        if(CCPconf){

            dialogBox.innerHTML += "<br>Saving CCP configuration...";

            const res = await convertToCCP.createCCPFIle(filePath , CCPconf);
            console.log(res)
            
            dialogBox.innerHTML += `<br>Succesfully saved CCP configuration at ${filePath}`;
            dialogBox.scrollTop = dialogBox.scrollHeight;
            excelBtn.style.display = "none";
            convertBtn.style.display = "none";
            closeBtn.style.display = "";
            
            
        }

    } catch (error) {
        dialogBox.innerHTML += "<br>error while converting file";
        console.log(error)
    }
    
});

closeBtn.addEventListener("click", ()=>{
    nw.Window.get().close();
});

function parseConfigFile(event){
    const filePath = event.target.files[0].path;
    fileInput.value = '';
    dialogBox.style.display = "";
    dialogBox.innerHTML += `<br>Configuration found at ${filePath}`;
    dialogBox.innerHTML += "<br>Parsing Configuration....";
    fs.readFile(filePath, 'utf8', function(err, configXml) {
        if (err) dialogBox.innerHTML += `<br>Cannot read file!!!!`;;

        xml2js.parseString(configXml, (err, parsedConfigJson) => {
            if (err) dialogBox.innerHTML += `<br>Failed to parse configuration, invalid XML!!!`;
            configJson = parsedConfigJson;

            var loops = [];
            configJson.Configuration.CentralUnit[0].Card.forEach(card => {
                if(card.$.Type == "LB3"){
                    loops.push(...card.Loop);
                }
            });
            if(loops.length>0){
                dialogBox.innerHTML += `<br>Configuration file parsed correctly.`;
                parseLoops(loops);
            } else {
                dialogBox.innerHTML += `<br>No loops found in configuration.`;
                convertBtn.style.display = "";
            }
            
        });
    });
}

function parseLoops(loops){
    dialogBox.innerHTML += `<br>Parsing loop units....`;
    loops.forEach(loop => {
        if (!loop.LoopUnit) return;

        loop.LoopUnit.forEach(unit => {

            var loopUnit = {
                Module_Address: +loop.LogicalAddress[0] + 10,
                Loop_Address: loop.LogicalAddress[0],
                Zone: unit.Zone[0],
                Unit_Address: unit.LogicalAddress[0],
                Description1: unit.Text1[0],
                Description2: unit.Text2[0],
            };

            loopUnits.push(loopUnit);
        });
    });
    dialogBox.innerHTML += `<br>Succesfully found ${loopUnits.length} loop units.`;
    excelBtn.style.display = "";
    convertBtn.style.display = "";
    dialogBox.scrollTop = dialogBox.scrollHeight;
}

async function checkVersion(){
    const availableVersions = await getAvailableVersions();
    console.log(availableVersions)

    availableVersions.forEach(version => {
        const newVersion = document.createElement('option');
        newVersion.value = version;
        newVersion.text = version;
        versionSelectDropdown.appendChild(newVersion);
    });
    
}

function getAvailableVersions(){
    return new Promise((resolve, reject) => {
        fs.readdir("src/defaultCCPConf", (err, files) => {
            if (err) {
                console.error('Error reading folder:', err);
                reject(err);
            }

            const FileNames = files.map(file => file.replace(".ccp", ""));
            resolve(FileNames);
        });
    })
    
}

