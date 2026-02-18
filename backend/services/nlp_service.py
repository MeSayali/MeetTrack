import spacy

# Load spaCy model once
nlp = spacy.load("en_core_web_sm")

ACTION_KEYWORDS = [
    "will",
    "need to",
    "needs to",
    "must",
    "should",
    "assign",
    "schedule",
    "complete",
    "follow up",
    "prepare",
    "send",
    "review"
]


def extract_action_items(transcript: str):
    """
    Extract action items from meeting transcript
    Returns a list of structured action items
    """

    doc = nlp(transcript)
    action_items = []

    for sent in doc.sents:
        sentence_text = sent.text.strip().lower()

        if any(keyword in sentence_text for keyword in ACTION_KEYWORDS):
            action_items.append({
                "action": sent.text.strip()
            })

    return action_items
