import boto3
import os
from dotenv import load_dotenv

load_dotenv()

# Centralized SNS client [cite: 2026-02-12]
sns = boto3.client(
    "sns",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def send_email_notification(message):
    """Publishes meeting results to the configured SNS Topic""" [cite: 2026-02-12]
    topic_arn = os.getenv("SNS_TOPIC_ARN")
    
    if not topic_arn:
        print("Error: SNS_TOPIC_ARN not found in environment.") [cite: 2026-02-12]
        return None

    response = sns.publish(
        TopicArn=topic_arn,
        Message=message,
        Subject="Meeting Summary & Action Items"
    )
    return response