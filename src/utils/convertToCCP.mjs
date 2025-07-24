import fs from 'fs/promises';
import zlib from 'zlib';
import path from 'path';
import {create} from 'tar';
import { parseStringPromise, Builder } from 'xml2js';
                    

export async function convert(cs4kconfig,configToolVersion) {
    const CCPconf = await getDefaultCCP(configToolVersion);

    CCPconf.Configuration.Text1 = cs4kconfig.Configuration.Text1 ?? "";
    CCPconf.Configuration.Text2 = cs4kconfig.Configuration.Text2 ?? "";
    CCPconf.Configuration.GlobalOptions[0].InstallationName1 = cs4kconfig.Configuration.GlobalOptions[0].InstallationName1 ?? "";
    CCPconf.Configuration.GlobalOptions[0].InstallationName2 = cs4kconfig.Configuration.GlobalOptions[0].InstallationName2 ?? "";
    CCPconf.Configuration.GlobalOptions[0].VersionHistory = cs4kconfig.Configuration.GlobalOptions[0].VersionHistory ?? "";
    CCPconf.Configuration.GlobalOptions[0].GreetingText = cs4kconfig.Configuration.GlobalOptions[0].GreetingText ?? "";
    CCPconf.Configuration.ZoneDefinition = cs4kconfig.Configuration.ZoneDefinition;
    for(var i=0;i<CCPconf.Configuration.ZoneDefinition[0].Zone.length;i++){
        CCPconf.Configuration.ZoneDefinition[0].Zone[i].ShowOnDisplays = "1";
        CCPconf.Configuration.ZoneDefinition[0].Zone[i].ControlOnDisplays = "1";
    }
    CCPconf.Configuration.GroupDefinition = [{"Group": [{"Number": ["1"],"Text": ["Default"]}]}];

    const newLMX = convertLoops(cs4kconfig);
    if(newLMX){
        newLMX.forEach(card => {
            CCPconf.Configuration.CentralUnit[0].Card.push(card);
        });
    }
    
    return CCPconf;
}

async function getDefaultCCP(version) {
    const configPath = path.join(__dirname, 'src', 'defaultCCPConf', `${version}.ccp`);
    
    try {
        const compressedConfig = await fs.readFile(configPath);
        console.log(compressedConfig)
        const decompressedConfig = await gunzipAsync(compressedConfig);
        var configXml = decompressedConfig.toString('utf-8');
        configXml = configXml.slice(configXml.indexOf('<'));
        const configJson = await parseStringPromise(configXml);
        return configJson;
    } catch (err) {
        throw new Error(`Failed to load config: ${err.message}`);
    }
}

function gunzipAsync(buffer) {
    return new Promise((resolve, reject) => {
        zlib.gunzip(buffer, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

function convertLoops(config){
    var loops = [];
    config.Configuration.CentralUnit[0].Card.forEach(card => {
        if(card.$.Type == "LB3"){
            loops.push(...card.Loop);
        }
    });
    if(loops.length>0){

        const LMX = createLMX(loops);
        
        return LMX

    } else {
        return
    }
}

function createLMX(loops){
    
    var LMX = [];
    loops.forEach(loop => {
        if (!loop.LoopUnit) return;

        var LMXTemplate =  {
            $: {
                Type: "LMX",
                Address: +loop.LogicalAddress[0] + 10
            },
            "Text1": "",
            "Text2": "",
            "Function": "SLAVE",
            "ChannelBSupervision": "1",
            "ShowOnDisplays": "1",
            "ControlOnDisplays": "1",
            "Loop": {
                $: {
                    Type: "ANALOGUE",
                    Address: loop.LogicalAddress[0]
                },
                "Text1": loop.Text1,
                "Text2": loop.Text2,
                "LogicalAddress": loop.LogicalAddress[0],
                "Zone": loop.LogicalAddress[0],
                "Function": "LOOP",
                "LoopUnit": []
            },
            "AlarmBlinkThreshold": "0",
            "XFireSupervision": "0",
            "PrealarmsDisabled": "1",
            "DirtySensorReportOption": "1",
            "crc": "7606"
        }


        loop.LoopUnit.forEach(unit => {

            const loopUnitTemplate = {
                $: {
                    Type: unit.$.Type,
                    Address: unit.LogicalAddress[0]
                },
                "SubType": "",
                "Active": "1",
                "Text1": unit.Text1[0],
                "Text2": unit.Text2[0],
                "Function": "0",
                "SoftType": "0",
                "Zone": unit.Zone[0],
                "LogicalAddress": unit.LogicalAddress[0] 
            }

            LMXTemplate.Loop.LoopUnit.push(loopUnitTemplate);
        });

        LMX.push(LMXTemplate);
    });

    return LMX;
}

export async function createCCPFIle(path, CCPconf){

    const builder = new Builder({
        headless: false,
        xmldec: { version: '1.0', encoding: 'utf-8' },
        renderOpts: {
            pretty: false,     
            indent: '',        
            newline: ''        
        }
     });
    var xmlConfig = builder.buildObject(CCPconf); 

    xmlConfig += "<!-- chsumprohibited-->";

    const tempDir = './temp';
    const xmlFilePath = './temp/configuration.c4d';
    const tarPath = './temp/config.tar';

    await fs.mkdir(tempDir, { recursive: true });

    await fs.writeFile(xmlFilePath, xmlConfig, 'utf-8');

    await create(
        {
            file: tarPath,
            cwd: tempDir
        },
        ['configuration.c4d']
    );

    const gzip = zlib.createGzip();
    const tarBuffer = await fs.readFile(tarPath);
    const compressed = zlib.gzipSync(tarBuffer);

    await fs.writeFile(path, compressed);

    
    await fs.rm(tempDir, { recursive: true, force: true });

}


