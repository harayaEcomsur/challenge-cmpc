FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn global add vite && \
    yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"] 