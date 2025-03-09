# Natours

Natours is a tour booking web application built with modern web development technologies. The application allows users to explore various tours, view detailed information about each tour, and book tours online. 
also can add review and rating to each tour

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)


## Features

- User authentication and authorization
- Secure password hashing and management
- RESTful API design
- CRUD operations for managing tours, users, and bookings
- Data validation and sanitization
- Error handling and logging
- Integration with third-party services (e.g., email, payment gateways)
- Efficient database querying and management using MongoDB
- Data aggregation and filtering
- geospatial data visualization and interactive maps using leaflet package
  
## Technologies Used

- JavaScript
- Node.js
- Express.js
- Mongodb
- Mongoose
- mailtrap
- JWT
- multer
- pug template engine
- stripe payment gateway
- NPM (Node Package Manager)

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine. You can download them from [Node.js official website](https://nodejs.org/).

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/adel-eleraky/natours-api.git
    ```

2. Navigate to the project directory:
    ```sh
    cd natours
    ```

3. Install the dependencies:
    ```sh
    npm install
    ```

4. Set up environment variables:

    Create a `config.env` file in the root of your project and add the following variables (modify according to your setup):
    ```plaintext
    
   PORT=3000
    NODE_ENV=development
    DATABASE=Your_database_url
    DATABASE_PASSWORD=Your_database_password
    
    JWT_SECRET=my-json-web-token-very-long-secret
    JWT_EXPIRE_IN=90d
    
    JWT_COOKIE_EXPIRE_IN=90
    
    EMAIL_HOST=sandbox.smtp.mailtrap.io
    EMAIL_USERNAME=mailtrap_username
    EMAIL_PASSWORD=mailtrap_password
    EMAIL_PORT=587
    EMAIL_FROM=mailtrap_email_from
    
    STRIPE_SECRET_KEY=stripe_secret_key
    STRIPE_PUBLIC_KEY=stripe_public key
    STRIPE_WEBHOOK_SECRET=stripe_webhook_secret
    
    BREVO_USERNAME=Brevo_username
    BREVO_PASSWORD=Brevo_password
    ```

5. Start the API server:
    ```sh
    npm run dev
    ```

6. Compile js and watch for changes:
    ```sh
    npm run watch:js
    ```

Now you can test the API from postman
also check the API [documentation](https://documenter.getpostman.com/view/30514600/2sA2xny9wd) for more information
