FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm install 

COPY . .
COPY prisma ./prisma

# 🔥 Critical step
RUN npx prisma generate

CMD [ "npm", "run" , "dev" ]