var argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const fs = require('fs');

// how to split video: https://stackoverflow.com/questions/5651654/ffmpeg-how-to-split-video-efficiently

var slices = null;

/*
var slices = [
    {start:0,time:5,stretchedTime:5,stretchedNoteTime:5,stretchedStartTime:0,multiplier:1},
    {start:5,time:0.75,stretchedTime:1.5,stretchedNoteTime:1.5,stretchedStartTime:5,multiplier:2},
    {start:5.75,time:0.5625,stretchedTime:1.06185860176691,stretchedNoteTime:1.06185860176691,stretchedStartTime:6.5,multiplier:1.88774862536339},
    {start:6.3125,time:0.1875,stretchedTime:0.315336155720143,stretchedNoteTime:0.315336155720143,stretchedStartTime:7.56185860176691,multiplier:1.68179283050743},
    {start:6.5,time:1.125,stretchedTime:1.68559546148627,stretchedNoteTime:1.68559546148627,stretchedStartTime:7.87719475748705,multiplier:1.49830707687668},
    {start:7.625,time:0.375,stretchedTime:0.500564945313763,stretchedNoteTime:0.500564945313763,stretchedStartTime:9.56279021897332,multiplier:1.33483985417003},
    {start:8,time:0.75,stretchedTime:0.944940787421155,stretchedNoteTime:0.944940787421155,stretchedStartTime:10.0633551642871,multiplier:1.25992104989487},
    {start:8.75,time:0.75,stretchedTime:0.84184653623203,stretchedNoteTime:0.84184653623203,stretchedStartTime:11.0082959517082,multiplier:1.12246204830937},
    {start:9.5,time:1.125,stretchedTime:1.125,stretchedNoteTime:1.125,stretchedStartTime:11.8501424879403,multiplier:1},
    {start:10.625,time:0.375,stretchedTime:0.561865153828756,stretchedNoteTime:0.561865153828756,stretchedStartTime:12.9751424879403,multiplier:1.49830707687668},
    {start:11,time:1.125,stretchedTime:1.89201693432086,stretchedNoteTime:1.89201693432086,stretchedStartTime:13.537007641769,multiplier:1.68179283050743},
    {start:12.125,time:0.375,stretchedTime:0.630672311440286,stretchedNoteTime:0.630672311440286,stretchedStartTime:15.4290245760899,multiplier:1.68179283050743},
    {start:12.5,time:1.125,stretchedTime:2.12371720353381,stretchedNoteTime:2.12371720353381,stretchedStartTime:16.0596968875302,multiplier:1.88774862536339},
    {start:13.625,time:0.375,stretchedTime:0.70790573451127,stretchedNoteTime:0.70790573451127,stretchedStartTime:18.183414091064,multiplier:1.88774862536339},
    {start:14,time:2.625,stretchedTime:5.25,stretchedNoteTime:5.25,stretchedStartTime:18.8913198255752,multiplier:2},
    {start:16.625,time:0.375,stretchedTime:0.75,stretchedNoteTime:0.75,stretchedStartTime:24.1413198255752,multiplier:2},
    {start:17,time:0.375,stretchedTime:0.75,stretchedNoteTime:0.75,stretchedStartTime:24.8913198255752,multiplier:2},
    {start:17.375,time:0.375,stretchedTime:0.70790573451127,stretchedNoteTime:0.70790573451127,stretchedStartTime:25.6413198255752,multiplier:1.88774862536339},
    {start:17.75,time:0.375,stretchedTime:0.630672311440286,stretchedNoteTime:0.630672311440286,stretchedStartTime:26.3492255600865,multiplier:1.68179283050743},
    {start:18.125,time:0.375,stretchedTime:0.561865153828756,stretchedNoteTime:0.561865153828756,stretchedStartTime:26.9798978715268,multiplier:1.49830707687668},
    {start:18.5,time:0.5625,stretchedTime:0.842797730743134,stretchedNoteTime:0.842797730743134,stretchedStartTime:27.5417630253556,multiplier:1.49830707687668},
    {start:19.0625,time:0.1875,stretchedTime:0.250282472656881,stretchedNoteTime:0.250282472656881,stretchedStartTime:28.3845607560987,multiplier:1.33483985417003},
    {start:19.25,time:0.375,stretchedTime:0.472470393710578,stretchedNoteTime:0.472470393710578,stretchedStartTime:28.6348432287556,multiplier:1.25992104989487},
    {start:19.625,time:0.375,stretchedTime:0.75,stretchedNoteTime:0.75,stretchedStartTime:29.1073136224662,multiplier:2},
    {start:20,time:0.375,stretchedTime:0.75,stretchedNoteTime:0.75,stretchedStartTime:29.8573136224662,multiplier:2},
    {start:20.375,time:0.375,stretchedTime:0.70790573451127,stretchedNoteTime:0.70790573451127,stretchedStartTime:30.6073136224661,multiplier:1.88774862536339},
    {start:20.75,time:0.375,stretchedTime:0.630672311440286,stretchedNoteTime:0.630672311440286,stretchedStartTime:31.3152193569774,multiplier:1.68179283050743},
    {start:21.125,time:0.375,stretchedTime:0.561865153828756,stretchedNoteTime:0.561865153828756,stretchedStartTime:31.9458916684177,multiplier:1.49830707687668},
    {start:21.5,time:0.5625,stretchedTime:0.842797730743134,stretchedNoteTime:0.842797730743134,stretchedStartTime:32.5077568222465,multiplier:1.49830707687668},
    {start:22.0625,time:0.1875,stretchedTime:0.250282472656881,stretchedNoteTime:0.250282472656881,stretchedStartTime:33.3505545529896,multiplier:1.33483985417003},
    {start:22.25,time:0.375,stretchedTime:0.472470393710578,stretchedNoteTime:0.472470393710578,stretchedStartTime:33.6008370256465,multiplier:1.25992104989487},
    {start:22.625,time:0.375,stretchedTime:0.472470393710578,stretchedNoteTime:0.472470393710578,stretchedStartTime:34.0733074193571,multiplier:1.25992104989487},
    {start:23,time:0.375,stretchedTime:0.472470393710578,stretchedNoteTime:0.472470393710578,stretchedStartTime:34.5457778130676,multiplier:1.25992104989487},
    {start:23.375,time:0.375,stretchedTime:0.472470393710578,stretchedNoteTime:0.472470393710578,stretchedStartTime:35.0182482067782,multiplier:1.25992104989487},
    {start:23.75,time:0.375,stretchedTime:0.472470393710578,stretchedNoteTime:0.472470393710578,stretchedStartTime:35.4907186004888,multiplier:1.25992104989487},
    {start:24.125,time:0.1875,stretchedTime:0.236235196855289,stretchedNoteTime:0.236235196855289,stretchedStartTime:35.9631889941994,multiplier:1.25992104989487},
    {start:24.3125,time:0.1875,stretchedTime:0.250282472656881,stretchedNoteTime:0.250282472656881,stretchedStartTime:36.1994241910547,multiplier:1.33483985417003},
    {start:24.5,time:1.125,stretchedTime:1.68559546148627,stretchedNoteTime:1.68559546148627,stretchedStartTime:36.4497066637116,multiplier:1.49830707687668},
    {start:25.625,time:0.1875,stretchedTime:0.250282472656881,stretchedNoteTime:0.250282472656881,stretchedStartTime:38.1353021251978,multiplier:1.33483985417003},
    {start:25.8125,time:0.1875,stretchedTime:0.236235196855289,stretchedNoteTime:0.236235196855289,stretchedStartTime:38.3855845978547,multiplier:1.25992104989487},
    {start:26,time:0.375,stretchedTime:0.420923268116015,stretchedNoteTime:0.420923268116015,stretchedStartTime:38.62181979471,multiplier:1.12246204830937},
    {start:26.375,time:0.375,stretchedTime:0.420923268116015,stretchedNoteTime:0.420923268116015,stretchedStartTime:39.042743062826,multiplier:1.12246204830937},
    {start:26.75,time:0.375,stretchedTime:0.420923268116015,stretchedNoteTime:0.420923268116015,stretchedStartTime:39.463666330942,multiplier:1.12246204830937},
    {start:27.125,time:0.1875,stretchedTime:0.210461634058007,stretchedNoteTime:0.210461634058007,stretchedStartTime:39.884589599058,multiplier:1.12246204830937},
    {start:27.3125,time:0.1875,stretchedTime:0.236235196855289,stretchedNoteTime:0.236235196855289,stretchedStartTime:40.095051233116,multiplier:1.25992104989487},
    {start:27.5,time:1.125,stretchedTime:1.50169483594129,stretchedNoteTime:1.50169483594129,stretchedStartTime:40.3312864299713,multiplier:1.33483985417003},
    {start:28.625,time:0.1875,stretchedTime:0.236235196855289,stretchedNoteTime:0.236235196855289,stretchedStartTime:41.8329812659126,multiplier:1.25992104989487},
    {start:28.8125,time:0.1875,stretchedTime:0.210461634058007,stretchedNoteTime:0.210461634058007,stretchedStartTime:42.0692164627679,multiplier:1.12246204830937},
    {start:29,time:0.375,stretchedTime:0.375,stretchedNoteTime:0.375,stretchedStartTime:42.2796780968259,multiplier:1},
    {start:29.375,time:0.75,stretchedTime:1.5,stretchedNoteTime:1.5,stretchedStartTime:42.6546780968259,multiplier:2},
    {start:30.125,time:0.375,stretchedTime:0.630672311440286,stretchedNoteTime:0.630672311440286,stretchedStartTime:44.1546780968259,multiplier:1.68179283050743},
    {start:30.5,time:0.5625,stretchedTime:0.842797730743134,stretchedNoteTime:0.842797730743134,stretchedStartTime:44.7853504082662,multiplier:1.49830707687668},
    {start:31.0625,time:0.1875,stretchedTime:0.250282472656881,stretchedNoteTime:0.250282472656881,stretchedStartTime:45.6281481390093,multiplier:1.33483985417003},
    {start:31.25,time:0.375,stretchedTime:0.472470393710578,stretchedNoteTime:0.472470393710578,stretchedStartTime:45.8784306116662,multiplier:1.25992104989487},
    {start:31.625,time:0.375,stretchedTime:0.500564945313763,stretchedNoteTime:0.500564945313763,stretchedStartTime:46.3509010053768,multiplier:1.33483985417003},
    {start:32,time:0.75,stretchedTime:0.944940787421155,stretchedNoteTime:0.944940787421155,stretchedStartTime:46.8514659506906,multiplier:1.25992104989487},
    {start:32.75,time:0.75,stretchedTime:0.84184653623203,stretchedNoteTime:0.84184653623203,stretchedStartTime:47.7964067381117,multiplier:1.12246204830937},
    {start:33.5,time:1.5,stretchedTime:1.5,stretchedNoteTime:1.5,stretchedStartTime:48.6382532743438,multiplier:1},
    {start:35,time:5,stretchedTime:5,stretchedNoteTime:5,stretchedStartTime:50.1382532743438,multiplier:1},
    
    ];
*/

const { exec } = require("child_process");
const { runInContext } = require("vm");


async function makeSlice(filename, index, ext, destFolder) {
    var start = slices[index].start
    var duration = slices[index].duration

    var command = `ffmpeg -v 0 -ss ${start} -i ${filename} -to ${duration} -async 1 ${destFolder}/slice${index}.${ext} -y`

    await run(command)
}


async function speedUp(index, ext, srcFolder, destFolder) {
    var speed = slices[index].multiplier
    var displaySpeed = Math.round(speed * 100) / 100.0 + "x"
    var inverseSpeed = 1.0 / speed

    command = `ffmpeg -v 0 -i ${srcFolder}/slice${index}.${ext} -filter_complex "[0:v]setpts=${inverseSpeed}*PTS[v];[0:a]asetrate=44100*${speed}[a]" -map "[v]" -map "[a]" ${destFolder[0]}/fast${index}.${ext} -y`
    await run(command)

    command = `ffmpeg -v 0 -i ${destFolder[0]}/fast${index}.${ext} -vf drawtext="fontfile=/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf: text='${displaySpeed}': fontcolor=white: fontsize=34: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)*0.9" -codec:a copy ${destFolder[1]}/text${index}.${ext} -y`
    await run(command)

}


async function merge(ext, srcFolder) {
    var filterList = ""
    var fileList = ""

    for(var i=0; i<slices.length; i++) {
        fileList += ` -i ${srcFolder}/text${i}.${ext} `
        filterList += `[${i}:v] [${i}:a] `
    }

    var mergeCommand = `ffmpeg -v 0 ${fileList} -filter_complex "${filterList} concat=n=${slices.length}:v=1:a=1 [v] [a]" -map "[v]" -map "[a]" merged.${ext} -y`

    await run(mergeCommand)
}

function getMultiplier(octave, note, accidental) {
    var scale1 = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    var scale2 = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

    var index = scale1.indexOf(note + accidental)
    if (index < 0) index = scale2.indexOf(note + accidental)

    if (index < 0) {
        console.error(`Note not found: '${note}${accidenal}'`)
        return 0
    }
    
    var multiplier = Math.pow(Math.pow(2, 1.0/12), index)

    if (octave > 4) {
        multiplier *= Math.pow(2, octave - 4)
    }
    if (octave < 4) {
        multiplier *= Math.pow(0.5, 4 - octave)
    }

    return multiplier
}


function parseSlicesFromString(notes) {
    console.log("parsing notes: " + notes);

    slices = []

    var bits = notes.split(",")
    var tempo = 100
    var runningTime = 0

    const regex = /([01-9]*)([a-zA-Z])([b#]?)([01-9\.]+)/gm

    bits.forEach(function(bit) {
        let m = regex.exec(bit)
        regex.lastIndex = 0

        if (m == null) {
            console.error("This part of the notes cannot be parsed: '"+bit+"'")
            return
        }
        var octave = m[1]
        if (octave == "") octave = "4"
        var note = m[2].toUpperCase()
        var accidental = m[3]
        var beats = m[4]
        console.log(`Octave ${octave} accidenal ${accidental} note ${note} beats ${beats}`)
        if (beats == "") beats = 1

        if (note == "T") {
            tempo = beats   // in this case, the number is not the beat length, but the tempo in beats per minute
        }

        if (note >= "A" && note <= "G") {
            var multiplier = getMultiplier(octave, note, accidental)
            var duration = 60.0 / tempo * beats * multiplier

            slices.push({multiplier: multiplier, start:runningTime, duration:duration})

            runningTime += duration
        }
    });
}


function parseSlices() {
    if (argv["notes"]) {
        parseSlicesFromString(argv["notes"])
    }
    if (argv["n"]) {
        parseSlicesFromString(argv["n"])
    }
    if (argv["notesfile"]) {
        const notes = fs.readFileSync(argv["notesfile"])
        parseSlicesFromString(notes)
    }
    if (argv["nf"]) {
        const notes = fs.readFileSync(argv["nf"])
        parseSlicesFromString(notes)
    }
}

async function main() {
    parseSlices()

    if (slices == null) {
        console.error("No notes were found.  Specify some with --notes \"abc\" or --notesfile \"file.txt\"")
        return
    }

    if (argv["debug"]) {
        console.log(slices)
        return
    }

    await(run("mkdir videoSlices"))
    await(run("mkdir videoFast"))
    await(run("mkdir videoText"))

    for(var i=0; i<slices.length; i++) {
        await makeSlice('raw.mp4', i, "mp4", "videoSlices")
    }

    for(var i=0; i<slices.length; i++) {
        await speedUp(i, "mp4", "videoSlices", ["videoFast", "videoText"])
    }
        
    await merge("mp4", "videoText")

    if (argv["nocleanup"]) {
        // don't clean up
    } else {
        await(run("rm -rf videoSlices"))
        await(run("rm -rf videoFast"))
        await(run("rm -rf videoText"))    
    }
}
    


main()


function run(command) {
    return new Promise((resolve, reject) => {
        console.log("Running command: " + command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve(`stderr: ${stderr}`);
                return;
            }
            if (stderr) {
                resolve(`stderr: ${stderr}`);
                return;
            }
            resolve(`stdout: ${stdout}`);
        });
    });
}

