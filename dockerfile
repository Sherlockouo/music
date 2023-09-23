# Todo: 构建docker版本 
# Dockerfile for the web (React) project
FROM nginx:latest
FROM node:16.20.1

ENV NODE_ENV=production \
  ELECTRON_WEB_SERVER_PORT=42710 \
  ELECTRON_DEV_NETEASE_API_PORT=30001 \
  UNBLOCK_SERVER_PORT=30003 \
  VITE_APP_NETEASE_API_URL=/netease

RUN npm i -g pnpm 
RUN npm install -g turbo
RUN pnpm config set registry https://registry.npm.taobao.org
RUN npm config set registry https://registry.npm.taobao.org

COPY package.json /app/
# 将构建文件复制到Nginx的默认静态文件目录下
# web项目
COPY packages/web/dist /usr/share/nginx/html
COPY packages/server/dist /app/server
COPY packages/server/package.json /app/server/
COPY packages/server/prisma /app/server/
COPY packages/desktop/dist /app/electron/
COPY packages/desktop/scripts /app/electron/scripts
COPY packages/desktop/package.json /app/electron/
# 设置工作目录
# 暴露Nginx的默认HTTP端口


WORKDIR /app 
RUN pnpm i 

WORKDIR /app/server 
RUN npm i -g prisma

RUN pnpm i
# RUN pnpm install 
RUN node app.js 

WORKDIR /app/electron 
RUN npm i -g tsx
RUN pnpm i
# RUN pnpm install 
RUN node index.js

WORKDIR /usr/share/nginx/html
EXPOSE 80

# 启动Nginx服务器
CMD ["nginx", "-g", "daemon off;"]
