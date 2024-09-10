# Use an official Node.js runtime as a parent image
FROM node:18.20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install any needed dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
# RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the Next.js application
# CMD ["npm", "start"]
CMD npm run dev
