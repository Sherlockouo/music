docker buildx build --push --platform linux/amd64,linux/arm64 -f Dockerfile.web -t sherlockouo/xtify-music-web:latest . &
docker buildx build --push --platform linux/amd64,linux/arm64 -f Dockerfile.server -t sherlockouo/xtify-music-server:latest . & 
wait