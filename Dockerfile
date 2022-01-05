FROM node:lts-bullseye

WORKDIR /app

COPY ["api/package.json", "api/package-lock.json*", "./"]
RUN npm install

COPY api .
CMD [ "npm", "run", "dev"]