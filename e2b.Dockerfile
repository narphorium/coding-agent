# You can use most Debian-based base images
FROM e2bdev/code-interpreter:latest

RUN pip install cowsay
RUN npm install cowsay


# Install dependencies and customize sandbox
RUN apt-get update && apt-get install -y git
