FROM node:carbon

RUN npm install pm2 -g
RUN pm2 install profiler

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 4000

CMD [ "pm2-runtime", "process.yml" ]
