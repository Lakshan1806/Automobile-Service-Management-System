# File: project/service/user-service/Dockerfile

FROM node:18-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# App runs on port 5001 according to your server.js
EXPOSE 5001

# Command to run the app
CMD ["node", "src/server.js"]