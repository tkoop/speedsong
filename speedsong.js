var argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const fs = require('fs');

// how to split video: https://stackoverflow.com/questions/5651654/ffmpeg-how-to-split-video-efficiently

var slices = null

var bitRate = 4800
const { exec } = require("child_process")
const { runInContext } = require("vm")


async function makeSlice(filename, index, ext, destFolder) {
    var start = slices[index].start
    var duration = slices[index].duration
    var type = slices[index].type

    if (type == 'rest') {
        // use a still image instead of video
        var command = `ffmpeg -v 0 -ss ${start} -i ${filename} -vframes 1 -f image2 ${destFolder}/slice${index}.jpg -y`
    } else {
        var command = `ffmpeg -v 0 -ss ${start} -i ${filename} -to ${duration} -async 1 ${destFolder}/slice${index}.${ext} -y`
    }

    await run(command)
}


async function speedUp(index, ext, srcFolder, destFolder) {
    var type = slices[index].type

    if (type == "note") {
        var speed = slices[index].multiplier
        var displaySpeed = Math.round(speed * 100) / 100.0 + "x"
        var inverseSpeed = 1.0 / speed

        command = `ffmpeg -v 0 -i ${srcFolder}/slice${index}.${ext} -filter_complex "[0:v]setpts=${inverseSpeed}*PTS[v];[0:a]asetrate=${bitRate}*${speed}[a]" -map "[v]" -map "[a]" ${destFolder[0]}/fast${index}.${ext} -y`
        await run(command)

        var fontSize = argv["fontsize"] || "170"
        if (argv["fontfile"]) {
            var fontfile = "fontfile="+argv["fontfile"]+": "
        } else {
            var fontfile = "fontfile=/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf: "
        }
 
        command = `ffmpeg -v 0 -i ${destFolder[0]}/fast${index}.${ext} -vf drawtext="${fontfile} text='${displaySpeed}': fontcolor=white: fontsize=${fontSize}: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)*0.9" -codec:a copy ${destFolder[1]}/text${index}.${ext} -y`
        await run(command)
    }

    if (type == "nothing") {
        command = `cp ${srcFolder}/slice${index}.${ext} ${destFolder[1]}/text${index}.${ext}`
        await run(command)
    }


    if (type == "rest") {
        var duration = slices[index].duration

        command = `ffmpeg -loop 1 -i ${srcFolder}/slice${index}.jpg -f lavfi -i anullsrc -c:v copy -c:a aac -shortest -t ${duration} ${destFolder[0]}/fast${index}.${ext} -y`
        await run(command)

        var fontSize = argv["fontsize"] || "170"
        if (argv["fontfile"]) {
            var fontfile = "fontfile="+argv["fontfile"]+": "
        } else {
            var fontfile = "fontfile=/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf: "
        }
 
        command = `ffmpeg -v 0 -i ${destFolder[0]}/fast${index}.${ext} -vf drawtext="${fontfile} text='Pause': fontcolor=white: fontsize=${fontSize}: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)*0.9" -codec:a copy ${destFolder[1]}/text${index}.${ext} -y`
        await run(command)
    }

}


async function merge(ext, srcFolder) {
    var filterList = ""
    var fileList = ""

    for(var i=0; i<slices.length; i++) {
        fileList += ` -i ${srcFolder}/text${i}.${ext} `
        filterList += `[${i}:v] [${i}:a] `
    }

    var outFile = "out.mp4"
    if (argv["outfile"]) {
        outFile = argv["outfile"]
    }

    var mergeCommand = `ffmpeg -v 0 ${fileList} -filter_complex "${filterList} concat=n=${slices.length}:v=1:a=1 [v] [a]" -map "[v]" -map "[a]" ${outFile} -y`

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
    notes = "" + notes;

    slices = []

    var bits = notes.split(",")
    var tempo = 100
    var runningTime = 0

    const regex = /([01-9]*)([a-zA-Z])([b#]?)([01-9\.]*)/gm

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
        if (beats == "") beats = 1

        if (note == "T") {
            tempo = beats   // in this case, the number is not the beat length, but the tempo in beats per minute
        }

        if (note == "R") {
            var duration = 60.0 / tempo * beats
            slices.push({start:runningTime, duration:duration, type:"rest"})
        //    runningTime += duration   // running time doesn't increase, because we will "pause" instead of "mute"
        }

        if (note == "N") {
            var duration = parseFloat(beats)    // beats is actually number of seconds
            slices.push({start:runningTime, duration:duration, type:"nothing"})
            runningTime += duration
        }

        if (note >= "A" && note <= "G") {
            var multiplier = getMultiplier(octave, note, accidental)
            var duration = 60.0 / tempo * beats * multiplier

            slices.push({multiplier: multiplier, start:runningTime, duration:duration, type:"note", tempo:tempo, beats:beats})

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
        if (fs.existsSync(argv["notesfile"])) {
            const notes = fs.readFileSync(argv["notesfile"])
            parseSlicesFromString(notes)
        } else {
            console.log(`File ${argv["nf"]} not found.`)
        }
    }
    if (argv["nf"]) {
        if (fs.existsSync(argv["nf"])) {
            const notes = fs.readFileSync(argv["nf"])
            parseSlicesFromString(notes)
        } else {
            console.log(`File ${argv["nf"]} not found.`)
        }
    }
    if (!argv["notes"] && !argv["n"] && !argv["notesfile"] && !argv["nf"]) {
        if (fs.existsSync("notes.txt")) {
            const notes = fs.readFileSync("notes.txt")
            parseSlicesFromString(notes)
        }
    }
}

async function detectBitRate(file) {
    var line = await run(`ffmpeg -i ${file} 2>&1 >/dev/null | grep Hz`)

    if (argv["trialrun"]) {
        line = " 44300 Hz "
    }

    const regex = /(\d*) Hz/gm;
    let m;

    m = regex.exec(line)

    console.log("Hz is " + m[1])

    bitRate = m[1]
}

async function main() {
    parseSlices()

    if (slices == null) {
        console.error("No notes were found.  Specify some with --notes \"abc\" or --notesfile \"file.txt\"")
        return
    }

    if (argv["analyze"]) {
        console.log(slices)
        var totalStretchedDuration = 0;
        var totalFinalDuration = 0;
        slices.forEach(function(item) {
            totalStretchedDuration += item.duration
            if (item.multiplier && item.multiplier != 0) {
                totalFinalDuration += item.duration / item.multiplier
            } else {
                totalFinalDuration += item.duration
            }
        })
        console.log("Total video in duration: " + totalStretchedDuration)
        console.log("Total video out duration: " + totalFinalDuration)
        return
    }

    await run("mkdir videoSlices")
    await run("mkdir videoFast")
    await run("mkdir videoText")

    var inputFile = "in.mp4"
    if (argv["infile"]) {
        inputFile = argv["infile"]
    }

    console.log("calling detectbitrate")
    await detectBitRate(inputFile)

    for(var i=0; i<slices.length; i++) {
        await makeSlice(inputFile, i, "mp4", "videoSlices")
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
        if (argv["trialrun"]) {
            console.log("We would run command: " + command);
            resolve('nothing ran');
            return;
        }

        if (argv["showcommands"]) {
            console.log("Running command: " + command);
        }

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

