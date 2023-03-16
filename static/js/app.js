//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;
var isRecord = false;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var micIcon = document.getElementById("micIcon1")
var micdisableIcon =document.getElementById("micIcon2")




function triggerRecording(){
	isRecord = !isRecord
	console.log('Happy birthday to me', isRecord)
	if (isRecord){
		startRecording()
	}
	else{
		stopRecording()
	}
}

function startRecording() {
	micIcon.style.display = 'none';
	micdisableIcon.style.display = 'block'
	document.getElementById('reply-msg').innerHTML = 'Listening.....';
		document.getElementById('output').style.display = 'block';
	
	console.log("startRecording() called");

	/*
		Simple constraints object, for more advanced features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

    /*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {


		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		//update the format 
		// document.getElementById("formats").innerHTML="Format: 2 channel "+encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value+" @ "+audioContext.sampleRate/1000+"kHz"

		//assign to gumStream for later use
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);
		
		//stop the input from playing back through the speakers
		//input.connect(audioContext.destination)

		//get the encoding 
		encodingType = "wav";
		
		//disable the encoding selector
		encodingTypeSelect.disabled = true;

		recorder = new WebAudioRecorder(input, {
		  workerDir: "static/js/", // must end with slash
		  encoding: encodingType,
		  numChannels:2, //2 is the default, mp3 encoding supports only 2
		  onEncoderLoading: function(recorder, encoding) {
		    // show "loading encoder..." display
;
		  },
		  onEncoderLoaded: function(recorder, encoding) {
		    // hide "loading encoder..." display

		  }
		});

		recorder.onComplete = function(recorder, blob) { 

			createDownloadLink(blob,recorder.encoding);
			
			encodingTypeSelect.disabled = false;
		}

		recorder.setOptions({
		  timeLimit:120,
		  encodeAfterRecord:encodeAfterRecord,
	      ogg: {quality: 0.5},
	      mp3: {bitRate: 160}
	    });

		//start the recording process
		recorder.startRecording();


	}).catch(function(err) {
	  	//enable the record button if getUSerMedia() fails

	});

	//disable the record button
}

function stopRecording() {
	micdisableIcon.style.display = 'none'
	micIcon.style.display = 'block';

	console.log("stopRecording() called");
	
	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//disable the stop button
	
	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
	recorder.finishRecording();
	
	
}

function createDownloadLink(blob,encoding) {

	var url = URL.createObjectURL(blob);

	const formData = new FormData();
  	formData.append('audio-file', blob);
	fetch("/audio_txt", {
		method: "POST",
		body: formData
		})
		.then((response) => response.json())
		  .then((data) => {

		document.getElementById('reply-msg').innerHTML = data['message'];
		document.getElementById('output').style.display = 'block';}

		);
}


