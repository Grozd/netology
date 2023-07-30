FROM amd64/node:20.4-alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY src/ src/

CMD [ "npm", "run", "start" ]