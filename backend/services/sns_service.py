import boto3
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize SNS client using secure environment variables
sns = boto3.client(
    "sns",
    region_name=os.getenv("AWS_REGION", "ap-south-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)
def subscribe_email(email):
    response = sns.subscribe(
        TopicArn=os.getenv("SNS_TOPIC_ARN"),
        Protocol="email",
        Endpoint=email
    )
    print("Check your email and CONFIRM subscription!")
    return response
subscribe_email("ransingriya@gmail.com")
def test_sns():
    sns.publish(
        TopicArn=os.getenv("SNS_TOPIC_ARN"),
        Message="Test message from your app",
        Subject="Test SNS"
    )

test_sns()
def create_notification_topic():
    """Creates the topic and returns the ARN for your .env file"""
    response = sns.create_topic(Name="MeetingNotificationTopic")
    print(f"Update your .env with this ARN: {response['TopicArn']}")
    return response["TopicArn"]

if __name__ == "__main__":
    create_notification_topic()