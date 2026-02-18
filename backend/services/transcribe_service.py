import boto3
import os
import time
import uuid
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET = os.getenv("TRANSCRIBE_BUCKET")  # create this bucket in S3

s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

transcribe = boto3.client(
    "transcribe",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)


def transcribe_audio(file_path: str) -> str:
    job_name = f"transcription-{uuid.uuid4()}"
    file_name = os.path.basename(file_path)

    # Upload to S3
    s3.upload_file(file_path, S3_BUCKET, file_name)

    media_uri = f"s3://{S3_BUCKET}/{file_name}"

    # Start transcription job
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={"MediaFileUri": media_uri},
        MediaFormat=file_name.split(".")[-1],
        LanguageCode="en-US"
    )

    # Poll job status
    while True:
        status = transcribe.get_transcription_job(
            TranscriptionJobName=job_name
        )

        job_status = status["TranscriptionJob"]["TranscriptionJobStatus"]

        if job_status == "COMPLETED":
            transcript_url = status["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
            break

        if job_status == "FAILED":
            raise Exception("Transcription failed")

        time.sleep(5)

    # Download transcript
    import requests
    response = requests.get(transcript_url)
    transcript_text = response.json()["results"]["transcripts"][0]["transcript"]

    return transcript_text
