//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");


//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
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
			const downloadLink = document.getElementById("download-file");
			filename = downloadLink.download.replace(/:/g, "_");
			fetch("/audio_txt", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					"file_name": filename
				})
				})
				.then((response) => response.json())
  				.then((data) => 

				document.getElementById('reply-msg').innerHTML = data['message']

				);
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
    	recordButton.disabled = false;
    	stopButton.disabled = true;

	});

	//disable the record button
    recordButton.disabled = true;
    stopButton.disabled = false;
}

function stopRecording() {
	var div = document.getElementById('recordingsList');
	console.log("stopRecording() called");
	
	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//disable the stop button
	stopButton.disabled = true;
	recordButton.disabled = false;
	
	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
	recorder.finishRecording();
	
	while(div.firstChild){
   	 	div.removeChild(div.firstChild);
	}
}

function createDownloadLink(blob,encoding) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');
	link.id = "download-file";

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;


	link.href = url;
	link.download = new Date().toISOString() + '.'+encoding;
	link.innerHTML = link.download;

	// blob contnt
	// const formData = new FormData();
	// console.log(url)
  	// formData.append('audio-file', url);
	// fetch("/blob_audio_txt", {
	// 	method: "POST",
	// 	headers: {
	// 		"Content-Type": "application/json"
	// 	},
	// 	body: formData
	// 	})
	// 	.then((response) => response.json())
	// 	  .then((data) => 

	// 	document.getElementById('reply-msg').innerHTML = data['message']

	// 	);


	function click_download_link() {
		return new Promise(resolve => {
			console.log(link)
			link.click()
		});
	  }
	
	async function downloadcall() {
		console.log('calling');
		const result = await click_download_link();
		console.log(result);
		// expected output: "resolved"
	  }
	downloadcall()

	
	//add the new audio and a elements to the li element
	li.appendChild(au);
	li.appendChild(link);
	//add the li element to the ordered list
	recordingsList.appendChild(li);
}


