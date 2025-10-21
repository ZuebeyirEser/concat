# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:22 AS build-stage

WORKDIR /app

# Copy package.json and yarn.lock for better caching
COPY package.json yarn.lock /app/

# Enable Corepack and install dependencies using yarn
RUN corepack enable
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY ./ /app/

ARG VITE_API_URL=${VITE_API_URL}

# Build the application using yarn
RUN yarn build


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1

COPY --from=build-stage /app/dist/ /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
