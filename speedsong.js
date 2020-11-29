var argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const fs = require('fs');

// how to split video: https://stackoverflow.com/questions/5651654/ffmpeg-how-to-split-video-efficiently

var slices = null

var bitRate = 4800
const { exec } = require("child_process")
const { runInContext } = require("vm")

/*
async function processSlice(filename, index, ext, destFolders) {
    var start = slices[index].start
    var duration = slices[index].duration
    var type = slices[index].type
    var text = slices[index].text

    var audioSlicesDir = destFolders[0]
    var videoSlicesDir = destFolders[1]
    var videoFastDir = destFolders[2]
    var videoTextDir = destFolders[3]

    var fontSize = argv["fontsize"] || "170"
    if (argv["fontfile"]) {
        var fontfile = "fontfile="+argv["fontfile"]+": "
    } else {
        var fontfile = "fontfile=/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf: "
    }


    // slice up initial file

    if (type == 'rest') {
        // use a still image instead of video
        var command = `ffmpeg -v 0 -ss ${start} -i ${filename} -vframes 1 -f image2 ${videoSlicesDir}/slice${index}.jpg -y`
        await run(command)
        confirmFile(`${videoSlicesDir}/slice${index}.jpg`, "Didn't slice rest image.", command)
    } else {
        var command = `ffmpeg -v 0 -ss ${start} -i ${audioSlicesDir}/all.wav -to ${duration} -async 1 ${audioSlicesDir}/slice${index}.wav -y`
        await run(command)
        confirmFile(`${audioSlicesDir}/slice${index}.wav`, "Didn't slice audio.", command)

        var command = `ffmpeg -v 0 -ss ${start} -i ${filename} -to ${duration} -async 1 ${videoSlicesDir}/slice${index}.${ext} -y`
        await run(command)
        confirmFile(`${videoSlicesDir}/slice${index}.${ext}`, "Didn't slice video.", command)
    }




    if (type == "note") {
        var speed = slices[index].multiplier
        var displaySpeed = text || Math.round(speed * 100) / 100.0 + "x"
        var inverseSpeed = 1.0 / speed

        command = `ffmpeg -v 0 -i ${videoSlicesDir}/slice${index}.${ext} -filter_complex "[0:v]setpts=${inverseSpeed}*PTS[v];[0:a]asetrate=${bitRate}*${speed}[a]" -map "[v]" -map "[a]" ${videoFastDir}/fast${index}.${ext} -y`
        await run(command)
        confirmFile(`${videoFastDir}/fast${index}.${ext}`, "Didn't speed up note.", command)

        command = `ffmpeg -v 0 -i ${audioSlicesDir}/slice${index}.wav -filter_complex "[0:a]asetrate=${bitRate}*${speed}[a]" -map "[a]" ${audioSlicesDir}/fast${index}.wav -y`
        await run(command)
        confirmFile(`${audioSlicesDir}/fast${index}.wav`, "Didn't speed up audio note.", command)
 

        command = `ffmpeg -v 0 -i ${videoFastDir}/fast${index}.${ext} -vf drawtext="${fontfile} text='${displaySpeed}': fontcolor=white: fontsize=${fontSize}: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)*0.9" -codec:a copy ${videoTextDir}/text${index}.${ext} -y`
        await run(command)
        confirmFile(`${videoTextDir}/text${index}.${ext}`, "Didn't add text to note.", command)
    }

    if (type == "nothing") {
        command = `cp ${audioSlicesDir}/slice${index}.wav ${audioSlicesDir}/fast${index}.wav`
        await run(command)
        confirmFile(`${audioSlicesDir}/fast${index}.wav`, "Didn't copy nothing.", command)

        if (text == null) {
            command = `cp ${videoSlicesDir}/slice${index}.${ext} ${videoTextDir}/text${index}.${ext}`
            await run(command)
            confirmFile(`${videoTextDir}/text${index}.${ext}`, "Didn't copy nothing.", command)
        } else {
            command = `ffmpeg -v 0 -i ${videoSlicesDir}/slice${index}.${ext} -vf drawtext="${fontfile} text='${text}': fontcolor=white: fontsize=${fontSize}: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)*0.9" -codec:a copy ${videoTextDir}/text${index}.${ext} -y`
            await run(command)
            confirmFile(`${videoTextDir}/text${index}.${ext}`, "Didn't add text to nothing.", command)
        }
    }


    if (type == "rest") {
        var duration = slices[index].duration

        command = `ffmpeg -loop 1 -i ${videoSlicesDir}/slice${index}.jpg -f lavfi -i anullsrc -c:v copy -c:a aac -shortest -t ${duration} ${videoFastDir}/fast${index}.${ext} -y`
        await run(command)
        confirmFile(`${videoTextDir}/text${index}.${ext}`, "Didn't add silence to rest.", command)

        command = `ffmpeg -loop 1 -f lavfi -i anullsrc -c:a aac -shortest -t ${duration} ${audioSlicesDir}/fast${index}.wav -y`
        await run(command)
        confirmFile(`${audioSlicesDir}/fast${index}.wav`, "Didn't add silence to audio rest.", command)


        var fontSize = argv["fontsize"] || "170"
        if (argv["fontfile"]) {
            var fontfile = "fontfile="+argv["fontfile"]+": "
        } else {
            var fontfile = "fontfile=/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf: "
        }

        if (text == null) {
            text = "Pause"
        } 
        
        command = `ffmpeg -v 0 -i ${videoFastDir}/fast${index}.${ext} -vf drawtext="${fontfile} text='${text}': fontcolor=white: fontsize=${fontSize}: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)*0.9" -codec:a copy ${videoTextDir}/text${index}.${ext} -y`
        await run(command)
        confirmFile(`${videoTextDir}/text${index}.${ext}`, "Didn't add text to rest.", command)
    }

}
*/

//async function speedUp(index, ext, srcFolder, destFolder) {

// }


async function merge(ext, srcFolder, audioFolder) {
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
    confirmFile(`${outFile}`, "Didn't merge files.", mergeCommand)



    fileList = ''
    for(var i=0; i<slices.length; i++) {
        fileList += ` -i ${audioFolder}/fast${i}.wav `
    }

    var command = `ffmpeg ${fileList} -filter_complex '[0:0][1:0][2:0][3:0]concat=n=${slices.length}:v=0:a=1[out]' -map '[out]' audioMerged.wav`
    await confirmFile(`audioMerged.wav`, "Didn't merge audio files.", command)
    


    console.log("We're all done.  See the file " + outFile)
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

    const regex = /([01-9]*)([a-zA-Z])([b#]?)([01-9\.]*)(?:'([^,]*)')?/gm

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
        var text = m[5] || null

        if (note == "T") {
            tempo = parseFloat(beats)   // in this case, the number is not the beat length, but the tempo in beats per minute
        }

        if (note == "R") {
            var duration = 60.0 / tempo * beats
            slices.push({start:runningTime, duration:duration, type:"rest", text:text, multiplier:1})
        }

        if (note == "S") {
            runningTime += parseFloat(beats)    // beats is actually number of seconds
        }

        if (note == "N") {
            var duration = parseFloat(beats)    // beats is actually number of seconds
            slices.push({start:runningTime, duration:duration, type:"nothing", text:text, multiplier:1})
            runningTime += duration
        }

        if (note >= "A" && note <= "G") {
            var multiplier = getMultiplier(octave, note, accidental)
            var duration = 60.0 / tempo * beats * multiplier

            slices.push({multiplier: multiplier, start:runningTime, duration:duration, type:"note", tempo:tempo, beats:parseFloat(beats), text:text})

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

function confirmFile(filename, errorMessage, command) {
    if (fs.existsSync(filename)) {
        return true
    } else {
        console.log("File not found: " + filename)
        console.log("Error message: " + errorMessage)
        console.log("Command: " + command)
        process.exit()
        return false
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

async function processAllSlices(inputFile, outputFile) {

    // ffmpeg -y -t 5 -i test.mpg -ss 5 -t 5 -i test.mpg -filter_complex "[0:v]setpts=1*PTS[v1];[0:a]asetrate=44100*1[a1];[1:v]setpts=0.5*PTS[v2];[1:a]asetrate=44100*2[a2];[v1][a1][v2][a2]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" speedTwo.mpg

    var inputs = ""
    var filter = ""
    var preconcat = ""
    slices.forEach(function(slice, i) {
        inputs += ` -ss ${slice.start} -t ${slice.duration} -i ${inputFile} `
        filter += `[${i}:v]setpts=${1/slice.multiplier}*PTS[v${i}];[${i}:a]asetrate=${bitRate}*${slice.multiplier}[a${i}];`
        preconcat += `[v${i}][a${i}]`
    })

    var command = `ffmpeg -y ${inputs} -filter_complex "${filter}${preconcat}concat=n=${slices.length}:v=1:a=1[v][a]" -map "[v]" -map "[a]" ${outputFile}`

    await run(command)
    
    confirmFile(outputFile, "Big command didn't work.", command)

    console.log("We're all done.  See the file " + outputFile)
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

    await run("rm -rf audioSlices")
    await run("rm -rf videoSlices")
    await run("rm -rf videoFast")
    await run("rm -rf videoText")    

    await run("mkdir audioSlices")
    await run("mkdir videoSlices")
    await run("mkdir videoFast")
    await run("mkdir videoText")

    var inputFile = "in.mp4"
    if (argv["infile"]) {
        inputFile = argv["infile"]
    }

    var outFile = "out.mp4"
    if (argv["outfile"]) {
        outFile = argv["outfile"]
    }

    console.log("calling detectbitrate")
    await detectBitRate(inputFile)

    console.log("Detected bitrate of " + bitRate)

//    await run(`ffmpeg -i ${inputFile} audioSlices/all.wav`)

//    for(var i=0; i<slices.length; i++) {
//        await processSlice(inputFile, i, "mp4", ["audioSlices", "videoSlices", "videoFast", "videoText"])
//    }
    await processAllSlices(inputFile, outFile)
        
//    await merge("mp4", "videoText", "audioSlices")

    if (argv["nocleanup"]) {
        // don't clean up
    } else {
        await run("rm -rf audioSlices")
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

