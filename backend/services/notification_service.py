import boto3
import os
from botocore.exceptions import ClientError

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
SNS_TOPIC_ARN = os.getenv("SNS_TOPIC_ARN")

sns_client = boto3.client("sns", region_name=AWS_REGION)

def send_email_notification(subject: str, message: str):
    if not SNS_TOPIC_ARN:
        print("SNS_TOPIC_ARN not configured.")
        return

    try:
        sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=subject,
            Message=message
        )
    except ClientError as e:
        print("SNS Error:", e.response["Error"]["Message"])