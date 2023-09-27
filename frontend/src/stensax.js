// Hitta HTML-element
const nameInput = document.getElementById("name");
const nameInputLabel = document.getElementById("name-label");
const startButton = document.getElementById("startButton");
const gameContainer = document.getElementById("game");
const playerName = document.getElementById("playerName");
const playerScore = document.getElementById("playerScore");
const rockButton = document.getElementById("rockButton");
const scissorsButton = document.getElementById("scissorsButton");
const paperButton = document.getElementById("paperButton");
const resultContainer = document.getElementById("result");
const resultText = document.getElementById("resultText");
const restartButton = document.getElementById("restartButton");
const nameForm = document.getElementById("nameForm");
const playerChoiceElement = document.getElementById("playerChoice");
const computerChoiceElement = document.getElementById("computerChoice");
const highScoreList = document.getElementById("highScoreList"); // Här lagrar vi referensen till highscore-listan
const newPlayerButton = document.getElementById("newPlayer"); // Knapp för ny spelare

initializeHighScoreList();

// Spelvariabler
let name = "";
let playerPoints = 0;
let computerPoints = 0;

// Lyssna på formuläret för att starta spelet
nameForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Förhindra standardformulärinskickning
    name = nameInput.value;
    if (name) {
        playerName.textContent = name;
        showGameScreen();
    }
});

// visa spelet
function showGameScreen() {
    nameInput.style.display = "none"; // Dölj input
    nameInputLabel.style.display = "none";
    startButton.style.display = "none";
    gameContainer.style.display = "block"; // Visa spel-div
    resultContainer.style.display = "none";
    restartButton.style.display = "none";
}

// visa resultatet efter varje spelrunda
function showResultScreen(result) {
    resultText.textContent = result;
    resultContainer.style.display = "block";
}

// uppdatera poängen för user
function updateScores() {
    playerName.textContent = name;
    playerScore.textContent = playerPoints;
}

// generera ett slumpmässigt val av sten, sax eller påse för datorn
function getRandomChoice() {
    const choices = ["rock", "scissors", "paper"];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

// Lyssna på val av sten
rockButton.addEventListener("click", function () {
    playRound("rock");
});

// Lyssna på val av sax
scissorsButton.addEventListener("click", function () {
    playRound("scissors");
});

// Lyssna på val av påse
paperButton.addEventListener("click", function () {
    playRound("paper");
});

// utförandet av en spelrunda
function playRound(playerChoice) {
    const computerChoice = getRandomChoice();

    let result;
    if (playerChoice === computerChoice) {
        result = "Oavgjort! 👀";
    } else if (
        (playerChoice === "rock" && computerChoice === "scissors") ||
        (playerChoice === "scissors" && computerChoice === "paper") ||
        (playerChoice === "paper" && computerChoice === "rock")
    ) {
        result = "Du vinner rundan!";
        playerPoints++;
    } else {
        result = "Datorn vinner rundan!";
        computerPoints++;
    }

    updateScores();
    showResultScreen(result);

    if (computerPoints === 1) {
        let finalResult = "Game over! Datorn vinner spelet! 💻";
        showResultScreen(finalResult);
        rockButton.disabled = true;
        scissorsButton.disabled = true;
        paperButton.disabled = true;
        restartButton.style.display = "block";
        computerChoiceElement.style.display = "none";
        playerChoiceElement.style.display = "none";

        // Spara high score-data när spelet är över
        const highScoreData = { playerName: name, currentScore: playerPoints };
        saveHighScore(highScoreData, function () {
            // Anropa initializeHighScoreList() för att uppdatera highscore-listan i frontend
            initializeHighScoreList();
        });
    } else {
        playerChoiceElement.textContent = `Spelare: ${playerChoice}`;
        computerChoiceElement.textContent = `Dator: ${computerChoice}`;
        playerChoiceElement.style.display = "block";
        computerChoiceElement.style.display = "block";
    }
}

// Lyssna på starta om-knappen, återställer spelet.
restartButton.addEventListener("click", function () {
    playerPoints = 0;
    computerPoints = 0;
    updateScores();
    restartButton.style.display = "none";
    rockButton.disabled = false;
    scissorsButton.disabled = false;
    paperButton.disabled = false;
    showGameScreen();

});

// Funktion för att visa knappen för ny spelare
function showNewPlayerButton() {
    newPlayerButton.style.display = "block";
}

// Lyssna på knappen för ny spelare
newPlayerButton.addEventListener("click", function () {
    nameInput.style.display = "block";
    nameInputLabel.style.display = "block";
    startButton.style.display = "block";
    gameContainer.style.display = "none";
    resultContainer.style.display = "none";
    newPlayerButton.style.display = "none";
});

// Spara high score på servern när användaren klickar på "New Player"-knappen
newPlayerButton.addEventListener("click", function () {
    window.location.reload(); // Ladda om sidan för att starta med en ny spelare
});



/*-----------------------high score board --- ny kod*/

// get high score-listan
function initializeHighScoreList() {
    // Gör en fetch-förfrågan till din backend för att hämta high score-data
    fetch("http://localhost:3000/api/highscore")
        .then((response) => response.json())
        .then((data) => {
            // Sortera highscore-data i fallande ordning baserat på currentScore
            data.sort((a, b) => b.currentScore - a.currentScore);

            // Ta de fem högsta resultaten (om de finns)
            const topFive = data.slice(0, 5);

            // Rensa befintliga resultat från listan
            while (highScoreList.firstChild) {
                highScoreList.removeChild(highScoreList.firstChild);
            }

            // Uppdatera highscore-listan med de fem högsta resultaten
            topFive.forEach((score, index) => {
                const listItem = document.createElement("li");
                listItem.textContent = `${index + 1}. ${score.playerName}: ${score.currentScore}`;
                highScoreList.appendChild(listItem);
            });
        })
        .catch((error) => {
            console.error("Fel vid hämtning av highscore-data:", error);
        });
}

// Skicka POST-förfrågan med high score-data till backend
function saveHighScore(highScoreData, callback) {
    // Skicka POST-förfrågan med high score-data till backend
    fetch('http://localhost:3000/api/savehighscore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(highScoreData), // Skicka objektet som JSON
    })
        .then((response) => response.json())
        .then((data) => {
            // Hantera svaret från servern om det behövs
            console.log('Svar från server:', data);
            if (typeof callback === 'function') {
                callback(); // Anropa callback-funktionen efter att highscore-listan har uppdaterats
            }
        })
        .catch((error) => {
            console.error('Fel vid sändning av data:', error);
        });
    initializeHighScoreList();
}



