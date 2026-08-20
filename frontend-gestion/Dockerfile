# ============ ETAPA DE COMPILACIÓN ============
FROM node:20-alpine AS build
WORKDIR /app

# Copia manifests y hace install limpio
COPY package*.json ./
RUN npm ci

# Copia el resto y compila el frontend
COPY . .

# URL base del backend vista desde el navegador (por defecto mismo origen vía nginx)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ============ ETAPA DE SERVICIO (NGINX) ============
FROM nginx:alpine

# Estáticos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración de nginx (sirve estáticos + proxy /api al backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
