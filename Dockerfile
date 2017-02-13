FROM node:6
RUN mkdir /source
WORKDIR /source
COPY package.json bower.json ./
COPY scripts ./scripts
RUN npm install && npm install -g bower phantomjs && bower --allow-root  install && npm cache clean && bower --allow-root cache clean
COPY . /source
RUN npm test
CMD ["npm","start","--","--ssl=false"]
