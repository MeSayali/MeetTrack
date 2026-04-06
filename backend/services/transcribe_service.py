import whisper
import os
import logging

logger = logging.getLogger(__name__)

model = None

def transcribe_audio(file_path: str) -> str:
    global model
    try:
        print(f"🎙️  Starting transcription for: {file_path}")
        if model is None:
            print("📦 Loading Whisper model...")
            model = whisper.load_model("base")  # Load model on first use
            print("✅ Whisper model loaded")
        
        if not file_path or not os.path.exists(file_path):
            raise ValueError("Invalid or missing audio file")

        print(f"🔄 Transcribing audio...")
        result = model.transcribe(file_path)

        transcript = result.get("text")
        if not transcript:
            raise RuntimeError("Transcription failed")

        print(f"✅ Transcription complete: {len(transcript)} characters")
        return transcript.strip()
    except Exception as e:
        print(f"❌ ERROR in transcribe_audio: {str(e)}")
        logger.error(f"Transcription error: {str(e)}")
        raise