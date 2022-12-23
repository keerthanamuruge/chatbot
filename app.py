from flask import Flask, render_template, url_for, request, redirect, jsonify
from chat import main
import speech_recognition as sr
import json
import logging
from pathlib import Path

logging.basicConfig(filename='chatbotlog.log', level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')

listener = sr.Recognizer()
app = Flask(__name__)


@app.route('/')
def chatbot():
    return render_template('index.html')


@app.route("/audio_txt", methods=["POST"])
def index():

    response = {}

    file_path = '/home/softsuave/Downloads/' + request.get_json()['file_name']
    path = Path(file_path)
    while not path.is_file():
        pass

    with open(file_path, 'rb') as file:
        if file:
            recognizer = sr.Recognizer()
            audioFile = sr.AudioFile(file)
            with audioFile as source:
                data = recognizer.record(source)
            try:
                transcript = recognizer.recognize_google(data, key=None)
                logging.debug(f'Transcript message: {transcript}')
                response['message'] = main.chatbot_text_transformation(transcript)

            except:
                response['message'] = transcript = "Not able to hear your voice"
    # logging.debug(request.files['file'].filename)
    # file = request.data
    # with open(os.path.abspath(f'backend/audios/{file}'), 'rb') as f:

    #    if file:
    #       recognizer = sr.Recognizer()
    #       audioFile = sr.AudioFile(file)
    #       with audioFile as source:
    #          data = recognizer.record(source)
    #       try:
    #          transcript = recognizer.recognize_google(data, key=None)
    #          logging.debug(f'Transcript message: {transcript}')
    #          response['message'] = main.chatbot_text_transformation(transcript)
    #          response.headers.add('Access-Control-Allow-Origin', '*')
    #       except:
    #          response['message'] = transcript  = "Not able to hear your voice"
    return json.dumps(response)

# @app.route("/blob_audio_txt", methods=["POST"])
# def blob_idx():

#    transcript = ""
#    response = {}
#    file = request.files

#    return json.dumps(file)
