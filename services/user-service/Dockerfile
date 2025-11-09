FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "run", "dev"]
