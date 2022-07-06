FROM node:lts-bullseye

WORKDIR /app

COPY ["api/package.json", "api/package-lock.json*", "./"]
RUN npm install

COPY api .
# TODO: avoid using npm script
#ENTRYPOINT ["npm", "run"]
EXPOSE 3001
CMD ["node", "./bin/www"]