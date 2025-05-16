# Usar Node oficial
FROM node:20

# Crear la carpeta de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias adentro del contenedor
RUN npm install

# 🔥 Reconstruir sqlite3 para Linux
RUN npm rebuild sqlite3

# Copiar el resto del código (sin node_modules gracias al .dockerignore)
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar
CMD ["node", "index.cjs"]
