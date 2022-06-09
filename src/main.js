let videoStream = null,
    audioStream = null,
    mixedStream = null,
    chunks = [],
    recorder = null,
    recordedVideo = null;

const startButton = document.querySelector('.start-button');
const stopButton = document.querySelector('.stop-button');
const videoFeedback = document.querySelector('.video-feedback');

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);

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
    await setupStream();

    if (videoStream && audioStream) {
        stream = new MediaStream([
            ...videoStream.getTracks(),
            ...audioStream.getTracks()])
    }
    recorder = new MediaRecorder(stream);
    recorder.onstop = handleStop;
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.start(200);

    startButton.disabled = true;
    stopButton.disable = false;
}

function stopRecording() {
    recorder.stop();

    startButton.disabled = false;
    stopButton.disabled = true;

    console.log("Stopped recording")
}

function handleStop (e) {
    const blob = new Blob(chunks, {
        type: 'video/mp4'
    })
    chunks = [];

    // Incomplete
}