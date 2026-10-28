FROM node:24.22.1-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=optional

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
