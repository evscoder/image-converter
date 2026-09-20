FROM node:20-alpine

WORKDIR /server

COPY server/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY server ./

EXPOSE 3001

CMD ["npm", "run", "dev"]
