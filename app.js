// ==========================================
// QUEEZLUV - APPLICATION
// ==========================================

const STORAGE_KEY = "queezluv_answers";

let questions = [];
let currentQuestionIndex = 0;

let state = {
    username: "",
    answers: {}
};


// ==========================================
// ELEMENTS HTML
// ==========================================

const homeScreen = document.getElementById("homeScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const usernameInput = document.getElementById("username");

const startButton = document.getElementById("startButton");
const viewResultsButton = document.getElementById("viewResultsButton");

const questionCounter = document.getElementById("questionCounter");
const progressPercentage = document.getElementById("progressPercentage");
const progressFill = document.getElementById("progressFill");

const questionNumber = document.getElementById("questionNumber");
const questionTitle = document.getElementById("questionTitle");
const questionDescription = document.getElementById("questionDescription");

const answersContainer = document.getElementById("answersContainer");

const customAnswerContainer = document.getElementById("customAnswerContainer");
const customAnswer = document.getElementById("customAnswer");

const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const recapContainer = document.getElementById("recapContainer");
const resultSubtitle = document.getElementById("resultSubtitle");

const copyButton = document.getElementById("copyButton");
const restartButton = document.getElementById("restartButton");
const copyFeedback = document.getElementById("copyFeedback");


// ==========================================
// SAUVEGARDE
// ==========================================

function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

viewResultsButton.addEventListener("click", () => {
    displayResults();
});


function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);

        if (parsed && typeof parsed === "object") {
            state = {
                username: parsed.username || "",
                answers: parsed.answers || {}
            };
        }

    } catch (error) {
        console.error("Impossible de charger les réponses :", error);
    }
}


// ==========================================
// CHARGEMENT DES QUESTIONS
// ==========================================

async function loadQuestions() {

    try {

        const response = await fetch("questions.json");

        if (!response.ok) {
            throw new Error("Impossible de charger questions.json");
        }

        const data = await response.json();

        questions = data.questions || [];

        if (questions.length === 0) {
            throw new Error("Aucune question trouvée.");
        }

        loadProgress();

        usernameInput.value = state.username;

        // Afficher le bouton des résultats si un questionnaire a déjà été rempli
        const hasSavedResults = questions.some(question => {
            const id = String(question.questionId);
            return isAnswerComplete(question, state.answers[id]);
        });

        if (hasSavedResults) {
            viewResultsButton.classList.remove("hidden");
        }

    } catch (error) {

        console.error(error);

        document.getElementById("homeScreen").innerHTML = `
            <div class="welcome-card">
                <h1>Oups !</h1>
                <p class="intro">
                    Impossible de charger les questions.
                    Vérifiez que votre fichier questions.json est bien présent
                    et que le site est ouvert avec un serveur local.
                </p>
            </div>
        `;

        startButton.disabled = true;
    }
}


// ==========================================
// NAVIGATION ENTRE LES ECRANS
// ==========================================

function showScreen(screen) {

    homeScreen.classList.add("hidden");
    quizScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    screen.classList.remove("hidden");
}


// ==========================================
// DEMARRER LE QUESTIONNAIRE
// ==========================================

startButton.addEventListener("click", () => {

    state.username = usernameInput.value.trim();

    saveProgress();

    currentQuestionIndex = 0;

    showScreen(quizScreen);

    displayQuestion();

});


// ==========================================
// AFFICHER UNE QUESTION
// ==========================================

function displayQuestion() {

    const question = questions[currentQuestionIndex];

    if (!question) return;

    const questionId = String(question.questionId ?? currentQuestionIndex + 1);

    const savedAnswer = state.answers[questionId];

    const responses = Array.isArray(question.reponses)
        ? question.reponses
        : [];

    questionNumber.textContent =
        `QUESTION ${String(currentQuestionIndex + 1).padStart(2, "0")}`;

    questionTitle.textContent = question.question || "Question sans titre";

    questionCounter.textContent =
        `Question ${currentQuestionIndex + 1} / ${questions.length}`;

    const percentage = Math.round(
        ((currentQuestionIndex + 1) / questions.length) * 100
    );

    progressPercentage.textContent = `${percentage} %`;
    progressFill.style.width = `${percentage}%`;


    // Texte secondaire facultatif

    const description =
        question.description ||
        question.precision ||
        question.texteSecondaire ||
        question.aide ||
        "";

    questionDescription.replaceChildren();

    if (description) {

        questionDescription.classList.remove("hidden");

        addTextWithLinks(questionDescription, description);

    } else {

        questionDescription.classList.add("hidden");

    }


    answersContainer.replaceChildren();

    customAnswerContainer.classList.add("hidden");
    customAnswer.value = "";


    // Une seule réponse dans le JSON = réponse libre

    if (responses.length === 1) {

        displayFreeTextQuestion(question, savedAnswer);

    } else {

        displayChoiceQuestion(question, responses, savedAnswer);

    }


    previousButton.disabled = currentQuestionIndex === 0;

    previousButton.style.visibility =
        currentQuestionIndex === 0 ? "hidden" : "visible";

    nextButton.textContent =
        currentQuestionIndex === questions.length - 1
            ? "Terminer ♥"
            : "Suivant →";

    updateNextButton();

}


// ==========================================
// TEXTE SECONDAIRE ET LIENS
// ==========================================

function addTextWithLinks(container, content) {

    const text = String(content);

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    let lastIndex = 0;

    for (const match of text.matchAll(urlRegex)) {

        const url = match[0];
        const index = match.index;

        container.appendChild(
            document.createTextNode(text.slice(lastIndex, index))
        );

        const link = document.createElement("a");

        link.href = url;
        link.textContent = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        container.appendChild(link);

        lastIndex = index + url.length;
    }

    container.appendChild(
        document.createTextNode(text.slice(lastIndex))
    );
}


// ==========================================
// QUESTION A REPONSE LIBRE
// ==========================================

function displayFreeTextQuestion(question, savedAnswer) {

    const textarea = document.createElement("textarea");

    textarea.className = "free-answer";
    textarea.placeholder =
        question.reponses[0] || "Écrivez votre réponse ici...";

    textarea.rows = 4;

    textarea.value =
        typeof savedAnswer === "string" ? savedAnswer : "";

    textarea.addEventListener("input", () => {

        const questionId = String(
            question.questionId ?? currentQuestionIndex + 1
        );

        state.answers[questionId] = textarea.value;

        saveProgress();

        updateNextButton();

    });

    answersContainer.appendChild(textarea);
}


// ==========================================
// QUESTIONS A CHOIX
// ==========================================

function displayChoiceQuestion(question, responses, savedAnswer) {

    const questionId = String(
        question.questionId ?? currentQuestionIndex + 1
    );

    let selectedValue = "";

    if (typeof savedAnswer === "string") {
        selectedValue = savedAnswer;
    }

    if (
        savedAnswer &&
        typeof savedAnswer === "object" &&
        savedAnswer.type === "other"
    ) {
        selectedValue = savedAnswer.label || "Autre (Préciser)";
    }


    responses.forEach((response) => {

        const isOther = /^autre(\s*\(.*\))?$/i.test(response.trim());

        const button = document.createElement("button");

        button.type = "button";
        button.className = "answer-option";

        button.textContent = response;

        if (selectedValue === response) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {

            answersContainer
                .querySelectorAll(".answer-option")
                .forEach(option => option.classList.remove("selected"));

            button.classList.add("selected");

            if (isOther) {

                const otherValue =
                    savedAnswer &&
                    typeof savedAnswer === "object" &&
                    savedAnswer.type === "other"
                        ? savedAnswer.value || ""
                        : "";

                state.answers[questionId] = {
                    type: "other",
                    label: response,
                    value: otherValue
                };

                customAnswerContainer.classList.remove("hidden");

                customAnswer.value = otherValue;

                customAnswer.focus();

            } else {

                state.answers[questionId] = response;

                customAnswerContainer.classList.add("hidden");

                customAnswer.value = "";

            }

            saveProgress();

            updateNextButton();

        });

        answersContainer.appendChild(button);

    });


    // Restaurer le champ Autre si nécessaire

    if (
        savedAnswer &&
        typeof savedAnswer === "object" &&
        savedAnswer.type === "other"
    ) {

        customAnswerContainer.classList.remove("hidden");

        customAnswer.value = savedAnswer.value || "";

        const otherButton = [...answersContainer.children].find(
            button => button.textContent === savedAnswer.label
        );

        if (otherButton) {
            otherButton.classList.add("selected");
        }

    }


    // Sauvegarder le texte personnalisé

    customAnswer.oninput = () => {

        const selectedOther = state.answers[questionId];

        if (!selectedOther || selectedOther.type !== "other") return;

        selectedOther.value = customAnswer.value;

        saveProgress();

        updateNextButton();

    };

}


// ==========================================
// VALIDATION DES REPONSES
// ==========================================

function isAnswerComplete(question, answer) {

    if (answer === undefined || answer === null) {
        return false;
    }

    const responses = Array.isArray(question.reponses)
        ? question.reponses
        : [];

    // Question libre

    if (responses.length === 1) {
        return typeof answer === "string" && answer.trim().length > 0;
    }

    // Réponse Autre

    if (typeof answer === "object" && answer.type === "other") {
        return typeof answer.value === "string" &&
            answer.value.trim().length > 0;
    }

    // Réponse classique

    return typeof answer === "string" && answer.length > 0;

}


function updateNextButton() {

    const question = questions[currentQuestionIndex];

    const questionId = String(
        question.questionId ?? currentQuestionIndex + 1
    );

    const answer = state.answers[questionId];

    nextButton.disabled = !isAnswerComplete(question, answer);

}


// ==========================================
// BOUTON SUIVANT
// ==========================================

nextButton.addEventListener("click", () => {

    const question = questions[currentQuestionIndex];

    const questionId = String(
        question.questionId ?? currentQuestionIndex + 1
    );

    if (!isAnswerComplete(question, state.answers[questionId])) {
        return;
    }

    if (currentQuestionIndex < questions.length - 1) {

        currentQuestionIndex++;

        displayQuestion();

    } else {

        displayResults();

    }

});


// ==========================================
// BOUTON PRECEDENT
// ==========================================

previousButton.addEventListener("click", () => {

    if (currentQuestionIndex > 0) {

        currentQuestionIndex--;

        displayQuestion();

    }

});


// ==========================================
// AFFICHER LES RESULTATS
// ==========================================

function displayResults() {

    showScreen(resultScreen);

    recapContainer.replaceChildren();

    resultSubtitle.textContent = state.username
        ? `Voici les réponses de ${state.username}.`
        : "Voici le récapitulatif de vos réponses.";


    questions.forEach((question, index) => {

        const questionId = String(
            question.questionId ?? index + 1
        );

        const answer = state.answers[questionId];

        const recapItem = document.createElement("div");

        recapItem.className = "recap-item";

        const number = document.createElement("span");

        number.className = "recap-number";

        number.textContent =
            `QUESTION ${String(index + 1).padStart(2, "0")}`;


        const title = document.createElement("h3");

        title.textContent = question.question;


        const answerText = document.createElement("p");

        answerText.className = "recap-answer";


        if (
            answer &&
            typeof answer === "object" &&
            answer.type === "other"
        ) {

            answerText.textContent =
                `${answer.label} : ${answer.value}`;

        } else {

            answerText.textContent =
                answer || "Aucune réponse";

        }


        recapItem.appendChild(number);
        recapItem.appendChild(title);
        recapItem.appendChild(answerText);

        recapContainer.appendChild(recapItem);

    });

}


// ==========================================
// COPIER LE RECAPITULATIF
// ==========================================

copyButton.addEventListener("click", async () => {

    let text = "QueezLuv - Apprivoisez votre moitié\n\n";

    if (state.username) {
        text += `Réponses de : ${state.username}\n\n`;
    }

    questions.forEach((question, index) => {

        const questionId = String(
            question.questionId ?? index + 1
        );

        const answer = state.answers[questionId];

        let answerValue = "Aucune réponse";

        if (
            answer &&
            typeof answer === "object" &&
            answer.type === "other"
        ) {

            answerValue = `${answer.label} : ${answer.value}`;

        } else if (answer) {

            answerValue = answer;

        }

        text += `${index + 1}. ${question.question}\n`;
        text += `Réponse : ${answerValue}\n\n`;

    });


    try {

        await navigator.clipboard.writeText(text);

        copyFeedback.textContent =
            "Récapitulatif copié ! Vous pouvez maintenant le partager.";

    } catch (error) {

        copyFeedback.textContent =
            "Impossible de copier automatiquement. Essayez depuis un navigateur sécurisé.";

    }

});


// ==========================================
// RECOMMENCER
// ==========================================

restartButton.addEventListener("click", () => {

    const confirmed = confirm(
        "Voulez-vous vraiment recommencer le questionnaire ? Vos réponses actuelles seront effacées."
    );

    if (!confirmed) return;

    state = {
        username: "",
        answers: {}
    };

    currentQuestionIndex = 0;

    localStorage.removeItem(STORAGE_KEY);

    usernameInput.value = "";

    showScreen(homeScreen);

});


// ==========================================
// INITIALISATION
// ==========================================

loadQuestions();