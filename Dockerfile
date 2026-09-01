FROM node:20-bullseye-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema first for caching
COPY prisma ./prisma/

# Install dependencies (including production and devDependencies needed for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
