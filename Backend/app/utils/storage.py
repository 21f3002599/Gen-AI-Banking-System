import boto3
from botocore.client import Config

ENDPOINT_URL = "https://ujevsibhrnctthptfyoj.storage.supabase.co/storage/v1/s3"
REGION_NAME = "ap-south-1"
AWS_ACCESS_KEY_ID = "39b9d010198aa81a79439ba8b09dfc83"
AWS_SECRET_ACCESS_KEY = "52423a7c9ea91eca1a3c1224215e9a24c04ffb905aa4497522eb51f4dbc57202"

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name=REGION_NAME
    )

def upload_file_to_s3(file_obj, bucket_name: str, object_name: str, content_type: str = None):
    s3 = get_s3_client()
    try:
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type
        
        print(f"Uploading {object_name} to bucket {bucket_name}...")
        s3.upload_fileobj(file_obj, bucket_name, object_name, ExtraArgs=extra_args)
        
        # Return public URL
        # Supabase S3 URL format: https://<project_id>.supabase.co/storage/v1/object/public/<bucket>/<key>
        # Project ID is ujevsibhrnctthptfyoj
        url = f"https://ujevsibhrnctthptfyoj.supabase.co/storage/v1/object/public/{bucket_name}/{object_name}"
        print(f"Upload successful! URL: {url}")
        return url
    except Exception as e:
        print(f"Error uploading to S3: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Failed to upload file to storage: {str(e)}")

def list_buckets():
    s3 = get_s3_client()
    response = s3.list_buckets()
    return [bucket['Name'] for bucket in response['Buckets']]
