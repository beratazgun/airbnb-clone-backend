# Bucket creation

aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket airbnb-backend-clone-aws --no-sign-request

# List buckets

aws --endpoint-url=http://localhost:4566 s3 ls s3://airbnb-backend-clone-aws/

# Upload file

aws --endpoint-url=http://localhost:4566 s3 cp ./README.md s3://airbnb-backend-clone-aws/README.md

# Download file

aws --endpoint-url=http://localhost:4566 s3 cp s3://airbnb-backend-clone-aws/README.md ./README.md

# Delete file

aws --endpoint-url=http://localhost:4566 s3 rm s3://airbnb-backend-clone-aws/README.md
