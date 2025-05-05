# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Vite as a development dependency
RUN npm install --save-dev vite

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Vite uses
EXPOSE 2597

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]   