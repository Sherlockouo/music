FROM node:16.20.1

WORKDIR /app

COPY . .

RUN npm install -g pnpm 
RUN pnpm install 


ENV NODE_ENV=production \
    ELECTRON_WEB_SERVER_PORT=42710 \
    ELECTRON_DEV_NETEASE_API_PORT=30001 \
    UNBLOCK_SERVER_PORT=30003 \
    VITE_APP_NETEASE_API_URL=/netease

EXPOSE 42710


CMD ["pnpm", "dev"]
