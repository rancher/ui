FROM node:7
RUN mkdir /source
WORKDIR /source
COPY package.json bower.json ./
COPY scripts ./scripts
RUN yarn install && yarn global add bower phantomjs-prebuilt && bower --allow-root install && yarn cache clean && bower --allow-root cache clean
COPY . /source
EXPOSE 8000
CMD ["yarn","start","--","--ssl=false"]
