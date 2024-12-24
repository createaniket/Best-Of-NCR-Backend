const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();
const app = express();

// Database connection
connectDB();

// Middleware
app.use(express.json());
console.log("i am her eno")

const CategoryRoute = require("./src/routes/category")
const ServiceRoute = require("./src/routes/service")

const ShopRoute = require("./src/routes/shop")

const UserRoute = require("./src/routes/user")





app.use("/category", CategoryRoute)
app.use("/service", ServiceRoute)

app.use("/shop", ShopRoute)

app.use("/user", UserRoute)



console.log("i am her jwlnce")


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));