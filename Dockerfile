# TrelloApi/Dockerfile
FROM node:14

WORKDIR /app

COPY package.json ./
COPY .env ./
RUN npm install

COPY . .

EXPOSE 5000
CMD ["npm", "run", "start"]
