import json
import numpy as np
from tensorflow import keras
import colorama

colorama.init()
from colorama import Fore, Style, Back


import pickle

import logging

logging.basicConfig(filename='chatbotlog.log', level=logging.DEBUG, format='%(asctime)s:%(levelname)s:%(message)s')

with open("chat/content.json") as file:
    data = json.load(file)


def chatbot_text_transformation(inp_text):
    # load trained model
    model = keras.models.load_model('chat_model')

    # load tokenizer object
    with open('tokenizer.pickle', 'rb') as handle:
        tokenizer = pickle.load(handle)

    # load label encoder object
    with open('label_encoder.pickle', 'rb') as enc:
        lbl_encoder = pickle.load(enc)

    max_len = 20

    print(Fore.LIGHTBLUE_EX + "User: " + Style.RESET_ALL, end="")

    result = model.predict(keras.preprocessing.sequence.pad_sequences(tokenizer.texts_to_sequences([inp_text]),
                                                                      truncating='post', maxlen=max_len))
    tag = lbl_encoder.inverse_transform([np.argmax(result)])

    for i in data['intents']:
        if i['tag'] == tag:
            response = np.random.choice(i['responses'])
            logging.debug({'tag': tag, 'response message': response})
            return response
