import speech_recognition as sr
listener = sr.Recognizer()


def get_text():
    try:
        with sr.Microphone() as source:
            print("listining.........")
            listener.adjust_for_ambient_noise(source, duration=1)
            voice = listener.listen(source)
            cmd = listener.recognize_google(voice)
    except Exception as e:
        cmd = ""

    return cmd

