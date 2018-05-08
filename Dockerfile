FROM node:7
RUN mkdir /source
WORKDIR /source
COPY package.json ./
COPY scripts ./scripts
RUN yarn install && yarn global add phantomjs-prebuilt && yarn cache clean
COPY . /source
EXPOSE 8000
CMD ["yarn","start","--","--ssl=false"]
