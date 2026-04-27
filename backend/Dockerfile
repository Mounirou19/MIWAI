FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=src/prisma/schema.prisma

# Compile TypeScript → JavaScript
RUN npm run build && cp -r src/generated dist/generated

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=src/prisma/schema.prisma && npx ts-node --transpile-only src/seed.ts && node dist/index.js"]
