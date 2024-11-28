const express = require('express');
const app = express();
require('dotenv').config()
const port =  process.env.SERVER_PORT;

app.use(express.static("www"));
app.use(express.json());

//routers
const usersRoute = require("./routes/users");



app.get("/", (req, res) => {
    res.send("www-kansiota ei löytynt. Tarkista, että se on olemassa ja sisältää index.html-tiedoston.");
});

app.use("/users", usersRoute);

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});
