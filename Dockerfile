# Backend only - for web service deployment
FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Expose backend port
EXPOSE 3000

# Start backend
CMD ["npm", "start"]