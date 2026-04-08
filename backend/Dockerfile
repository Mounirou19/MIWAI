FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source including prisma schema
COPY . .

# Generate Prisma client (uses schema at src/prisma/schema.prisma)
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Expose port
EXPOSE 4000

# Start: run migrations, seed, then start server
CMD ["sh", "-c", "npx prisma migrate deploy --schema=src/prisma/schema.prisma && npx ts-node --transpile-only src/seed.ts && npx ts-node --transpile-only src/index.ts"]
