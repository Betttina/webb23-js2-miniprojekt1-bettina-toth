const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");     // file-sync modul
const path = require("path"); // path-paket
const cors = require('cors'); // cors-paketet

// Använd CORS-middleware för att tillåta korsningsbegäranden från alla ursprungsdomäner
app.use(cors());

app.use(express.json());


const newData = { playerName: 'Alice', currentScore: 42 };

// Läs data från JSON-filen
fs.readFile('./data/highscore.json', 'utf-8', (readError, data) => {
    if (readError) {
        console.error('Fel vid läsning av JSON-fil:', readError);
    } else {
        const jsonData = JSON.parse(data); // om inläsningen lyckas: tolka json-data i json-format (som lagras i varibaln jsonData)

        jsonData.push(newData); // lägger till ny data till highscore-arrayen (jsonData)

        // Skrivningsprocess: uppdatera data till JSON-filen
        fs.writeFile('highscore.json', JSON.stringify(jsonData, null, 2), 'utf-8', (writeError) => {
            if (writeError) {
                console.error('Fel vid skrivning till JSON-fil:', writeError);
            } else {
                console.log('Data har skrivits till JSON-fil.');
            }
        });
    }
});



// Läs highscore-data från JSON-filen
let highScoreList = [];

try {
    const data = fs.readFileSync("./data/highscore.json", "utf-8");
    highScoreList = JSON.parse(data);
    console.log("Highscore-lista efter inläsning:", highScoreList);
} catch (error) {
    console.error("Fel vid inläsning av highscore.json:", error);
}

// sökvägen till highscore.json-filen definieras
const highScoreFilePath = path.join(__dirname, "data", "highscore.json");

app.get("/", (req, res) => {
    res.sendFile("./data/highscore.json");
});  // när user besöker startsidan till appen hämtas data från databasen

app.get("/api/highscore", (req, res) => {
    res.json(highScoreList);
});



app.post("/api/savehighscore", (req, res) => {
    const { playerName, currentScore } = req.body; // Ta emot playerName och currentScore från frontend

    // Skapa ett nytt high score-objekt
    const newHighScore = {
        playerName,
        currentScore,
    };

    highScoreList.push(newHighScore);

    highScoreList.sort((a, b) => b.currentScore - a.currentScore);

    highScoreList = highScoreList.slice(0, 5); //kapar arrayen vid första och sista positionen

    // Skriv uppdaterad highscore-lista till highscore.json-filen
    fs.writeFile(highScoreFilePath, JSON.stringify(highScoreList, null, 2), 'utf-8', (error) => {
        if (error) {
            console.error('Fel vid skrivning av highscore.json:', error);
            res.status(500).json({ success: false, error: 'Något gick fel.' });
        } else {
            res.json({ success: true });
        }
    });
});


app.listen(3000, () => {
    console.log(`Server is running on port ${port}`);
});

