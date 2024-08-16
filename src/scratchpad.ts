import path from "path";
import fs from "fs";

import axios from "axios";

import { CASCLocal, EncryptionError, LocaleFlag, M2File, MO3Converter, MO3File, constants } from "./wowFiles";
import BufferWrapper from "./wowFiles/buffer";

// const fileId = 1011653; // Humanmale HD
//const fileId = 3846071; // BIG CHANGES, considered updated.
// const fileId = 3777553; // BIG CHANGES, considered updated.
// const fileId = 4045732; // SMALL changes in particle emitter, considered to be an updated version for now.
// const fileId = 3749959;
// const fileId = 3621079; // WRITES FULL 5 values OF 0 in fallback, timestamps[0].length?
// const fileId = 3567294; MUltiTextureParam0[0][1] = negative 
// const fileId = 3169041; // Several smaller changes, considered updated
// const fileId = 3168684; // Small change in gravity values, considered updated.
// const fileId = 3168564; // Updated.

// const fileiD = 3879628 // TODO

// const startingFileId = 1510595; // Small difference in texture, considered updated
// const startingFileId = 521269; // SMall difference in gravity z in the 7th position of the decimal places, considered acceptable

// 1518556
// 1518557
// 1022598

const fileId = 1890765;

const outDir = "C:/Workspace/Freedom/wowheadmodelViewer/";
const encryptedFilesHandle = fs.createWriteStream(path.join(outDir, "encyrypted.txt"), {flags:'a'});
const skippedFilesHandle = fs.createWriteStream(path.join(outDir, "skipped.txt"), {flags:'a'});

async function main() {
    var casc = new CASCLocal("C:\\FreedomWoW\\Client", LocaleFlag.enUS);
    console.log("Initialising CASC...")
    await casc.init(constants.BUILDINFO);
    await casc.load(0);

    await testMO3OutputForFileId(casc, fileId);
}

async function testMO3OutputForFileId(casc: CASCLocal, fileId: number) {

    console.log(`Loading M2 file ${fileId}...`)
    try {
        var m2File = new M2File();
        m2File.deserialize(await casc.getFile(fileId));
        await m2File.loadSkins(casc);
        await m2File.loadSkeleton(casc);
        await m2File.loadAnims(casc);
    } catch (e) {
        if (e instanceof EncryptionError) {
            encryptedFilesHandle.write(fileId + "\n")
            return;
        } else {
            throw e;
        }
    }

    console.log(`Loading MO3 file ${fileId}...`)
    try {
        const mo3Resp = await axios.get<Uint8Array>(`https://wow.zamimg.com/modelviewer/live/mo3/${fileId}.mo3`, {
            responseType: 'arraybuffer',
            headers: {
                'Origin': 'https://www.wowhead.com',
                'Referer': 'https://www.wowhead.com',
            }
        });
        var mo3FileData = BufferWrapper.from(mo3Resp.data);
    }
    catch {
        return true;
    }


    console.log(`Converting M2 file ${fileId}...`)
    const convertedmo3 = MO3Converter.fromM2(m2File).serializeToBuffer();
    const parsedMo3File = MO3File.deserialize(mo3FileData);
    const convertedFile = MO3File.deserialize(convertedmo3);

    const isEqual = parsedMo3File.equals(convertedFile);

    console.log(`File ${fileId} is: ${isEqual ? 'EQUAL' : 'NOT EQUAL'}`);
    if (!isEqual) {
        const skippable =
            // Just skip this item if the m2 flags don't even line up. Means item has probably changed significantly.
            m2File.flags !== parsedMo3File.m2flags
            // Also skip this item if the vertice data is wrong. Another indicator of significant change, since this data structure is pretty simple.
            || !parsedMo3File.verticesEqual(convertedFile)

        if (skippable) {
            console.log(`SKIPPED File ${fileId} becase flags or vertices were different, considerd updated`)
            skippedFilesHandle.write(fileId + "\n")
        } else {
            console.log("Writing deserialized M2 file...")
            fs.writeFileSync(path.join(outDir, `${fileId}_m2_parsed.json`), JSON.stringify(m2File, null, 2));

            console.log("Writing deserialized MO3 file...")
            fs.writeFileSync(path.join(outDir, `${fileId}_mo3_parsed.json`), JSON.stringify(parsedMo3File, null, 2));

            fs.writeFileSync(path.join(outDir, `${fileId}_mo3_converted.json`), JSON.stringify(convertedFile, null, 2))
            throw new Error("Found mismatched output for fileId: " + fileId);
        }
    }

}



main();