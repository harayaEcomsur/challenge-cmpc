FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn global add @nestjs/cli && \
    yarn install

COPY . .

# Crear directorio dist si no existe
RUN mkdir -p dist

# Configurar variables de entorno por defecto
ENV NODE_ENV=development
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=postgres
ENV DB_DATABASE=libros_db
ENV DB_SYNCHRONIZE=true
ENV JWT_SECRET=your-super-secret-key-change-in-production
ENV JWT_EXPIRATION_TIME=3600s
ENV PORT=3001
ENV FRONTEND_URL=http://localhost:3000

EXPOSE 3001

CMD ["yarn", "start:dev"] 