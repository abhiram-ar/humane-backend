FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg

WORKDIR /app

COPY package.json .

RUN npm install 

COPY . .

CMD [ "npm", "run" , "dev" ]