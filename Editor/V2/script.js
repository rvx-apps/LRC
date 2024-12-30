// Select DOM elements
const audioFile = document.getElementById('audioFile');
const playPauseButton = document.getElementById('playPauseButton');
const progressWrapper = document.getElementById('progressWrapper');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const lyricsInput = document.getElementById('lyricsInput');
const generateButtons = document.getElementById('generateButtons');
const lyricsDisplay = document.getElementById('lyricsDisplay');
const syncedLyricsDisplay = document.getElementById('syncedLyricsDisplay');
const embedLyricsButton = document.getElementById('embedLyrics');
const undoButton = document.getElementById('undoButton');

let audioPlayer = new Audio();
let syncedLyrics = [];

// Toast notification
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Load audio
audioFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
    audioPlayer.load();
    audioPlayer.addEventListener('loadedmetadata', () => {
      durationDisplay.textContent = formatTime(audioPlayer.duration);
      Toast.fire({ icon: 'success', title: 'Audio loaded successfully!' });
    });
  }
});

// Play/pause audio
playPauseButton.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseButton.textContent = '⏸';
  } else {
    audioPlayer.pause();
    playPauseButton.textContent = '▶';
  }
});

// Update progress bar
audioPlayer.addEventListener('timeupdate', () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.style.width = `${progress}%`;
  currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
});

// Generate lyric buttons
generateButtons.addEventListener('click', () => {
  const lyrics = lyricsInput.value.split('\n');
  if (!lyricsInput.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'No Lyrics Entered',
      text: 'Please input some lyrics before generating buttons!',
    });
    return;
  }

  lyricsDisplay.innerHTML = ''; // Clear previous buttons
  lyrics.forEach((line) => {
    if (line.trim() !== '') {
      const button = document.createElement('button');
      button.textContent = line;
      button.addEventListener('click', () => captureTimestamp(line));
      lyricsDisplay.appendChild(button);
    }
  });

  Swal.fire({
    icon: 'success',
    title: 'Buttons Generated',
    text: 'Click on the buttons to timestamp the lyrics.',
  });
});

// Capture timestamp
function captureTimestamp(line) {
  const timestamp = formatTime(audioPlayer.currentTime, true);
  const syncedLine = `[${timestamp}] ${line}`;
  syncedLyrics.push(syncedLine);
  displaySyncedLyrics();
}

// Display synced lyrics
function displaySyncedLyrics() {
  syncedLyricsDisplay.innerHTML = '';
  syncedLyrics.forEach((line, index) => {
    const lineElement = document.createElement('div');
    lineElement.textContent = line;
    lineElement.className = 'synced-line';
    lineElement.addEventListener('click', () => editLine(index));
    syncedLyricsDisplay.appendChild(lineElement);
  });
}

// Undo the last synced line
undoButton.addEventListener('click', () => {
  if (syncedLyrics.length > 0) {
    syncedLyrics.pop();
    displaySyncedLyrics();
    Toast.fire({ icon: 'info', title: 'Last sync undone.' });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Undo Failed',
      text: 'No synced lines to undo!',
    });
  }
});

// Edit a synced line
function editLine(index) {
  Swal.fire({
    title: 'Edit Synced Line',
    input: 'text',
    inputValue: syncedLyrics[index],
    showCancelButton: true,
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      syncedLyrics[index] = result.value;
      displaySyncedLyrics();
      Toast.fire({ icon: 'success', title: 'Synced line updated.' });
    }
  });
}

// Embed lyrics into MP3
embedLyricsButton.addEventListener('click', async () => {
  const originalFile = document.getElementById('audioFile').files[0];
  if (!originalFile) {
    Swal.fire({
      icon: 'error',
      title: 'No MP3 File Selected',
      text: 'Please select an MP3 file first!',
    });
    return;
  }

  const lyricsText = syncedLyrics.join('\n');
  if (!lyricsText) {
    Swal.fire({
      icon: 'error',
      title: 'No Lyrics to Embed',
      text: 'Please generate and timestamp lyrics before embedding!',
    });
    return;
  }

  const arrayBuffer = await originalFile.arrayBuffer();
  const writer = new ID3Writer(arrayBuffer);
  writer.setFrame('USLT', {
    description: 'Lyrics',
    lyrics: lyricsText,
  });

  writer.addTag();
  const taggedBlob = writer.getBlob();
  const url = URL.createObjectURL(taggedBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${originalFile.name}_with_lyrics.mp3`;
  downloadLink.click();

  Swal.fire({
    icon: 'success',
    title: 'Lyrics Embedded',
    text: 'The MP3 file has been updated with embedded lyrics and downloaded!',
  });
});

// Format time
function formatTime(seconds, withMilliseconds = false) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return withMilliseconds
    ? `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
