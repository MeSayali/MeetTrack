import spacy

# Load model once
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

    doc = nlp(transcript)
    action_items = []

    for sent in doc.sents:
        sentence_text = sent.text.strip()
        sentence_lower = sentence_text.lower()

        # Check if sentence contains action keyword
        if any(keyword in sentence_lower for keyword in ACTION_KEYWORDS):

            assigned_to = None
            deadline = None

            # Extract named entities
            for ent in sent.ents:
                if ent.label_ == "PERSON":
                    assigned_to = ent.text
                if ent.label_ in ["DATE", "TIME"]:
                    deadline = ent.text

            action_items.append({
                "description": sentence_text,
                "assigned_to": assigned_to,
                "deadline": deadline,
                "status": "Pending"
            })

    return action_items