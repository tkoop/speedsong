# Speedsong
Speed up a video in slices, so that it plays a song.

# How to install it
```
sudo apt-get install ffmpeg
git clone https://github.com/tkoop/speedsong.git
cd speedsong
```

  
# How to use it
Place a video here (in the "speedsong" directory) called in.mp4
```
node speedsong --notes "E,D,C,D,E,E,E2,D,D,D2,E,G,G2,E,D,C,D,E,E,E,E,D,D,E,D,C4"
```

It will create a file called out.mp4

# Command line arguments

```
--notes "A,B2,C2,D2,3E0.5,5F,5G2"
```
Or "-n".  You must pass in notes, so Speedsong knows how to speed up the video.  The notes are comma-separated.  
A..G 
The octave of the note, according to Scientific Pitch Notation, prescedes the note name.  The default is 4.  Middle would be "4C", or just "C".  One note lower would be "3B".  This notation doesn't know or care about quarter notes or eighth notes.  It only cares about beats.  The number of beats per note is specified after the letter.  If you want a beat to be quarter notes, then a half note is "C2" and a quarter note is "C1". One is the default number of beats, so you can leave it out.  An eighth note would be "C0.5".  
R
This is a rest.  You can add a number of beats after it, just like A..G.  The video will be muted for this many beats.
T
You can set the tempo (as beats per minute), with the letter "T" (as if it were a note) followed by the number of beats per minute.  "T60" would set each beat to last one second.  The default tempo is 100.
N
This stands for "nothing."  Instead of giving it a number of beats, you give it a number of seconds.  Audio and video are played at 1x, but without any text overlay.  This is useful for an introduction or something.


```
--notesfile "notes.txt"
```
Or "-nf".  Instead of specifying the notes in the command line, you can store them in a file and specify the file name.  If no notes or notesfile was specified, it defauls to a file called "notes.txt"

```
--infile "in.mp4"
```
The video file to process.  It defaults to "in.mp4".

```
--outfile "out.mp4"
```
The video file to produce.  It defaults to "out.mp4".

```
--showcommands
```
Shows the commands its running.  Used for debugging.

```
--nocleanup
```
Doesn't delete the directories and temporary files it creates when its done.  Used for debugging.

```
--analyze
```
Don't run anything.  Just look at the notes and spit out an analysis of them.  This is useful in case you want to know how long your video should be.

```
--trialrun
```
Don't run anything, but display the commands we would run.


```
--fontsize
```
The size of the font used on the text overlay.  Defaults to 170.


```
--fontfile
```
The font file to use for the text overlay.  Defaults to /usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf



