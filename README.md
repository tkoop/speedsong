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
--notes "A,B,C,D,E,F,G"
```
Or "-n".  You must pass in notes, so Speedsong knows how to speed up the video.  The notes are comma-separated.  The octave of the note, according to Scientific Pitch Notation, prescedes the note name.  The default is 4.  Middle would be "4C", or just "C".  One note lower would be "3B".