import whisper
import os

model = None

def transcribe_audio(file_path: str) -> str:
    global model
    if model is None:
        model = whisper.load_model("base")  # Load model on first use
    
    if not file_path or not os.path.exists(file_path):
        raise ValueError("Invalid or missing audio file")

    result = model.transcribe(file_path)

    transcript = result.get("text")
    if not transcript:
        raise RuntimeError("Transcription failed")

    return transcript.strip()