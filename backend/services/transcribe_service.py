import whisper
import os

# Load model once (important)
model = whisper.load_model("base")  
# Options: tiny, base, small, medium, large

def transcribe_audio(file_path: str) -> str:
    if not file_path or not os.path.exists(file_path):
        raise ValueError("Invalid or missing audio file")

    result = model.transcribe(file_path)

    transcript = result.get("text")
    if not transcript:
        raise RuntimeError("Transcription failed")

    return transcript.strip()