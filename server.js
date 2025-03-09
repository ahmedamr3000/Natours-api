const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const app = require('./app');


// close the server when uncaught exception happen
process.on("uncaughtException", err => {
    console.log(err.name, err.message)
    console.log("UNCAUGHT EXCEPTION: Shutting down the application.....")
    process.exit(1)
})


// connect to mongo atlas
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

let server;

mongoose
    .connect(DB)
    .then((conn) => {
        console.group('DB connected successfully');

        // listen to requests coming to server
        const port = process.env.PORT || 3000;
        server = app.listen(port, () => {
            console.log(`listening on port ${port}`);
        });
    })


// close the server when unhandled rejection happen
process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log("UNHANDLED REJECTION: Shutting down the application......")
    server.close(() => {
        process.exit(1);
    })
})

// close the server when receiving SIGTERM
process.on("SIGTERM", () => {
    console.log("SIGTERM RECEIVED. Shutting down gracefully")
    server.close(() => {
        console.log("Process terminated")
    })
})
