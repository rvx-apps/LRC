    const audioFile = document.getElementById('audioFile');
    const playPauseButton = document.getElementById('playPauseButton');
    const progressWrapper = document.getElementById('progressWrapper');
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const lyricsInput = document.getElementById('lyricsInput');
    const generateButtons = document.getElementById('generateButtons');
    const lyricsDisplay = document.getElementById('lyricsDisplay');
    const syncedLyricsDisplay = document.getElementById('syncedLyrics');
    const copyLyrics = document.getElementById('copyLyrics');

    let audioPlayer = new Audio();
    let syncedLyrics = [];

    // Load audio
    audioFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        audioPlayer.src = url;
        audioPlayer.load();
        audioPlayer.addEventListener('loadedmetadata', () => {
          durationDisplay.textContent = formatTime(audioPlayer.duration);
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

    progressWrapper.addEventListener('click', (e) => {
      const rect = progressWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      audioPlayer.currentTime = (clickX / width) * audioPlayer.duration;
    });

    // Generate lyric buttons
    generateButtons.addEventListener('click', () => {
      const lyrics = lyricsInput.value.split('\n');
      lyricsDisplay.innerHTML = ''; // Clear previous buttons
      lyrics.forEach((line) => {
        if (line.trim() !== '') {
          const button = document.createElement('button');
          button.textContent = line;
          button.addEventListener('click', () => captureTimestamp(line));
          lyricsDisplay.appendChild(button);
        }
      });
    });

    // Capture timestamp for a lyric
    function captureTimestamp(line) {
      const timestamp = formatTime(audioPlayer.currentTime, true);
      const syncedLine = `[${timestamp}]${line}`;
      syncedLyrics.push(syncedLine);
      displaySyncedLyrics();
    }

    // Display synced lyrics
    function displaySyncedLyrics() {
      syncedLyricsDisplay.textContent = syncedLyrics.join('\n');
    }

    // Copy synced lyrics to clipboard
    copyLyrics.addEventListener('click', () => {
      navigator.clipboard.writeText(syncedLyrics.join('\n')).then(() => {
        alert('Synced lyrics copied to clipboard!');
      });
    });

    // Format time (with optional milliseconds)
    function formatTime(seconds, withMilliseconds = false) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return withMilliseconds
        ? `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
        : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                                                 }
