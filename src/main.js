let videoStream = null,
    audioStream = null,
    mixedStream = null,
    chunks = [],
    recorder = null

const videoFeedback = document.querySelector('.video-feedback');
const startButton = document.querySelector('.start-button');
const stopButton = document.querySelector('.stop-button');
const recordedVideo = document.querySelector('.recorded-video');
const downloadButton = document.querySelector('.download-button');
const filetypeDropdown = document.querySelector('.filetype-dropdown');
const postRecording = document.querySelector('.post-recording');

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
filetypeDropdown.addEventListener('change', makeVideo);

async function setupStream () {
    try {
        videoStream = await navigator.mediaDevices.getDisplayMedia( {
            video: true
        })

        // Capture audio separately so that it isn't included in the video feedback screen.
        audioStream = await navigator.mediaDevices.getUserMedia( {
            audio : {
                autoGainControl: false,
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        })

        setupVideoFeedback();
    } catch (error) {
        console.error(error)
    }
}

function setupVideoFeedback () {
    if (videoStream) {
        videoFeedback.srcObject = videoStream;
        videoFeedback.play();
    } else {
        console.warn('No stream available for video feedback')
    }
}

async function startRecording () {
    // If the postRecording section is not hidden, set it to hidden.
    if(!postRecording.classList.contains("hidden")) {
        postRecording.classList.add("hidden")
    }

    // Reset chunks in case this is not the first recording
    chunks = []

    await setupStream();

    if (videoStream && audioStream) {
        stream = new MediaStream([
            ...videoStream.getTracks(),
            ...audioStream.getTracks()])
    }
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.start(200);

    startButton.disabled = true;
    stopButton.disabled = false;
}

function stopRecording() {
    recorder.stop();

    makeVideo();

    startButton.disabled = false;
    stopButton.disabled = true;

    // Unhide recorded video preview, download button, and filetype dropdown
    postRecording.classList.remove("hidden");
    postRecording.scrollIntoView({behavior: "smooth", block: "start"});

    videoStream.getTracks().forEach(track => track.stop());
    audioStream.getTracks().forEach(track => track.stop());

    console.log("Stopped recording");
}

function makeVideo (e) {
    
    const blob = new Blob(chunks, {
        type: `video/${e ? e.target.value : "mp4"}`
    })
    
    url = URL.createObjectURL(blob);
    console.log(url);
    downloadButton.href = url;
    downloadButton.download = `video${filetypeDropdown.options[filetypeDropdown.selectedIndex].text}`
    console.log(downloadButton.download);

    recordedVideo.src = url;
    recordedVideo.load();
    recordedVideo.onloadeddata = () => {
        recordedVideo.play();
    }
}