import os
from google import genai


def generate_summary(transcript: str) -> str:
    try:
        if not transcript:
            return "No transcript available"

        # ✅ Create client
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        # Reduce token usage
        short_text = transcript[:3000]

        # ✅ Generate summary
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=f"""
            Summarize this meeting in simple points:

            - Key Points
            - Decisions
            - Action Items

            Transcript:
            {short_text}
            """
        )

        return response.text

    except Exception as e:
        print("🔥 GEMINI ERROR:", e)

        # fallback
        sentences = transcript.split(".")
        return " ".join(sentences[:2]) + "."