# Ravaa Account — React 19 + Vite 8 (static)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Vite build butuh VITE_API_URL saat build
ARG VITE_API_URL=http://localhost:2711
ARG VITE_APP_MODE=home
ARG VITE_HOME_HIDE_ADMIN=true
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_MODE=$VITE_APP_MODE
ENV VITE_HOME_HIDE_ADMIN=$VITE_HOME_HIDE_ADMIN
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
