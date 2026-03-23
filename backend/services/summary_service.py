from google import genai
import os

def generate_summary(transcript: str) -> str:
    try:
        if not transcript:
            return "No transcript available"

        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        # reduce token usage (IMPORTANT for quota)
        short_text = transcript[:3000]

        response = client.models.generate_content(
            model="gemini-2.0-flash",
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

        # ✅ fallback (VERY IMPORTANT)
        sentences = transcript.split(".")
        return " ".join(sentences[:2]) + "."