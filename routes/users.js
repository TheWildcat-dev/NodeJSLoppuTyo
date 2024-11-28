const express = require('express');
const router = express.Router();
const DataBase =require("better-sqlite3");

// Luodaan tietokanta tai otetaan se käyttöön jos se on jo olemassa.
const db = new DataBase("users.db");

db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,  name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL)`);



//Hakee kaikki käyttäjät.
router.get('/', (req, res) => {
    const listUsers = db.prepare(`SELECT * FROM users`);
    const results = listUsers.all();
    // Tarkistetaan, onko tuloksia
    if (results.length === 0) {
        return res.send('Ei käyttäjiä löytynyt.');
    }

    // Lähetetään lista käyttäjistä JSON-muodossa
    //console.log(results);
    res.send(`Lista käyttäjistä: ${JSON.stringify(results)}`);
});


//Poistaa idn perustella
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    const deleteUserByID = req.prepare(`DELETE FROM users WHERE id= ? `);
    const result = deleteUserByID.run(id);

    if(result > 0){
        res.status(200).json({
            message: "User deleted",
            data: result,
        })
    } else {
        res.status(404).json({
            message: "User Not Found",
            data: result,
        });
    }
});


//Hakee nimellä, id:llä tai spostilla
router.get("/:search", (req, res) => {
    const searchQuery = req.params.search;
    //Korjaa results osio, koska samaa ei voi käyttää kumpaankin.
    const searchquery2 = searchQuery;
    let searchFromDB;
    let results;
    //Tarkistaa että onko haku numero vai teksti.
    if (isNaN(searchQuery)) {
        //Hakee jos ei ole numero.
        searchFromDB = db.prepare(`SELECT * FROM users WHERE name = ? OR email = ?`);
        results = searchFromDB. all(searchQuery, searchquery2);
    } else {
        //Hakee jos on numero.
        searchFromDB = db.prepare(`SELECT * FROM users WHERE id= ?`);
        results = searchFromDB. all(searchQuery);
    }

    // Tarkistetaan, onko tuloksia
    if (results.length === 0) {
        return res.send('Haku ei löytynyt mitään.');
    }
    res.status(200).send(`Lista haetuista tiedoista: ${JSON.stringify(results)}`);

    console.log(results);
});

// Päivitä
router.put("/:id", (req, res) => {
    const id = req.params.id;
    const {body} = req;
    const email = body.email;
    const password  = body.password;
    console.log(body);
    console.log(email);
    console.log(password);
    let update;
    let results

    if (email !== undefined) {
        update = db.prepare(`UPDATE users SET email = ? WHERE id = ?`);
        results = update.run(email, id);
        console.log("Email");

    } else if (!password === undefined) {
        update = db.prepare(`UPDATE users SET password = ? WHERE id = ?`);
        results = update.run(password, id);
        console.log("Password");
    }else{
        console.log("Else");
    }
    console.log(results);
    if(results.changes > 0){
        res.status(200).json({
            message: "User edited",
            data: results,
        })
    } else {
        res.status(404).json({
            message: "Error",
            data: results,
        });
    }
});


// Lisää
router.post("/", (req, res) => {
    const {body} = req;
    console.log(body);
    const name = body.name;
    const email = body.email;
    const password  = body.password;
    const insert = db.prepare(`INSERT INTO users (name, email, password) VALUES (?,?,?)`);
    const addUser = insert.run(name, email, password);
    const results = addUser.lastInsertRowid;

    if(results > 0){
        res.status(200).json({
            message: "User added",
            data: results,
        })
    }
});


module.exports = router;