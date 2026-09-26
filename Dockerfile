FROM node:20-alpine

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código (incluyendo la base de datos local)
COPY . .

# Compilar la aplicación Next.js de forma limpia
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Arrancar la app
CMD ["npm", "start"]