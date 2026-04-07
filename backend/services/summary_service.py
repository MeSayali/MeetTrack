import os
import google.generativeai as genai


def generate_summary(transcript: str) -> str:
    try:
        if not transcript:
            return "No transcript available"

        # ✅ Configure genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Reduce token usage
        short_text = transcript[:3000]

        # ✅ Generate summary
        response = model.generate_content(f"""
            Summarize this meeting in simple points:

            - Key Points
            - Decisions
            - Action Items

            Transcript:
            {short_text}
            """)

        return response.text

    except Exception as e:
        print("🔥 GEMINI ERROR:", e)

        # fallback
        sentences = transcript.split(".")
        return " ".join(sentences[:2]) + "."