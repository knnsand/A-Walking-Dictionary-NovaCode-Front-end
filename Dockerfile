# Dockerfile
# Imagen de desarrollo: instala dependencias y levanta el servidor de Vite
# con hot reload, escuchando en todas las interfaces para que Docker pueda
# exponer el puerto al host.

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
