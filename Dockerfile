FROM node:20-alpine

# Instalar dependencias del sistema necesarias para compilar paquetes nativos (como SQLite)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar la aplicación Next.js
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]