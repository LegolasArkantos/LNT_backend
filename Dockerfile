# Use an official Node.js runtime as a parent image
FROM node:18.17.0-alpine
# Set the working directory in the container
WORKDIR /lnt_backend/LNT_backend

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install dependencies
RUN npm install


# Bundle app source
COPY . .

# Expose the port on which your Express app runs
EXPOSE 4000

# Command to run your app
CMD ["node", "app.js"]
