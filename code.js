const underlinedWord = document.getElementById("underlined-word");
const word = document.getElementById("word");
const guess = document.getElementById("guess");
const hint = document.getElementById("hint");
const hintBtn = document.getElementById("hintBtn");
const shoebill1 = document.getElementById("shoebill1");
const keyboard = document.getElementById("keyboard");
const charBtnArr = document.getElementsByClassName("charBtn");
const timerElement = document.getElementById("timer");
const normalBtn = document.getElementById("normalBtn");
const timerBtn = document.getElementById("timerBtn");
const MAX_MISTAKES = 9;
const CHAR_NUM = 27;

let chosenWord = "";
let isBtn = true;
let mistakesCounter = 0;
let isFirstGame = true;
let isTimerMode = false;
let time = 10;
let score = 0;
let countdown;
let guessedLetters = [];

const lettersObj = {
    'e': 'ק', 'r': 'ר', 't': 'א', 'y': 'ט', 'u': 'ו', 'i': 'ן', 'o': 'ם', 'p': 'פ',
    'a': 'ש', 's': 'ד', 'd': 'ג', 'f': 'כ', 'g': 'ע', 'h': 'י', 'j': 'ח', 'k': 'ל',
    'l': 'ך', ';': 'ף', 'z': 'ז', 'x': 'ס', 'c': 'ב', 'v': 'ה', 'b': 'נ', 'm': 'צ',
    ',': 'ת', '.': 'ץ', 'n': 'מ'
};

const wordsObj = {
 שוביל: "החיה הקורסית הכי חמודה",
 איפיון: "מוצר",
  מדס: "ספורט",
  פיגמה: "תוכנות גרפיות",
  לונסי: "תוכנות גרפיות",
  חנתר: "מנהיג",
  מוסקו: "קמע",
  מפל: "הקורס הכי טוב בבסמח",
  סבבה: "בסדר? בסדר.",
  ווינקי_ל: "בסיום השימוש במחשב",
  וופל: "האוכל הכי טוב בתקשוב",
  גחנון: "האוכל הכי שומני בתקשוב",
  שמה: "תור ארוך",
  סטפר: "אסור לשכוח לפני תרצ!",
  דיבאג: "חיפושית מחשב",
  בסמח: `הבית ספר הכי טוב בצה"ל!`,
  שרוך: "מקבלים ב12 באוגוסט",
  תשחץ: "המשחק האהוב בקורס", 
  ועדת_החכמתי: "הועדה הכי טובה",
  האלבום_השבועי: "מפינות ועדת בחכמתי",
  שקם: "פתוח 5 דקות ביום",
  סקווישים: "מה שלימור יכולה לפתוח עסק ממנו",
  אוואלה: "הבקבוק ששולט בקורס (אחרי מוסקו)"
};


// עדכון תצוגת האותיות והקווים במסך
const renderWordSlots = () => {
    word.innerHTML = ''; // ניקוי התיבה
    
    // מעבר על כל אות במילה הנבחרת
    for (let i = 0; i < chosenWord.length; i++) {
        const char = chosenWord[i];
        const slot = document.createElement('div');
        slot.classList.add('letter-slot');
        slot.id = `slot-${i}`;
        
        if (char === '_' || char === ' ') {
            slot.classList.add('space');
            slot.textContent = ' ';
        } else if (guessedLetters.includes(char)) {
            slot.textContent = char;
        } else {
            slot.textContent = '';
        }
        
        word.appendChild(slot);
    }
};

const hintBtnStyle = () => {
    hintBtn.style.width = "95%";
    hintBtn.style.height = "40%";
    hintBtn.style.top = "155%";
    hintBtn.style.left = "50%";
    hintBtn.style.transform = "translate(-50%)";
    hintBtn.style.letterSpacing = "1.5px";
    hintBtn.style.display = "block";
};

const startTimer = () => {
    clearInterval(countdown);
    time = 59;

    countdown = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;

        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        if (time === 0) {
            clearInterval(countdown);
            guess.textContent = `אוי נגמר הזמן! הצלחת לפתור : ${score} מילים!`;
            keyboard.style.display = "none";
            hint.style.display = "none";
            document.querySelector(".word-paragraph").style.display = "none";
            document.getElementById("shoebill-lost").style.visibility = "visible";
            hintBtnStyle();
            hintBtn.textContent = "התחל משחק חדש!";
            hintBtn.removeEventListener("click", hintReveal);
            hintBtn.addEventListener("click", initGame);
            return;
        }

        time--;
    }, 1000);
};

normalBtn.addEventListener("click", () => {
    isTimerMode = false;
    normalBtn.classList.add("active");
    timerBtn.classList.remove("active");
    initGame(); 
});

timerBtn.addEventListener("click", () => {
    isTimerMode = true;
    timerBtn.classList.add("active");
    normalBtn.classList.remove("active");
    initGame(); 
});

const randomWord = () => {
    let keyArr = Object.keys(wordsObj);
    chosenWord = keyArr[Math.floor(Math.random() * keyArr.length)];
    renderWordSlots();
    return chosenWord;
};

const showLetters = (event) => {
    let inWord = false;
    let heLetter = "";
    let targetBtn = null;

    if (isBtn) {
        heLetter = event.currentTarget.textContent;
        targetBtn = event.currentTarget;
    } else {
        const charCode = event.keyCode;
        let enLetter = "";

        switch (charCode) {
            case 188: enLetter = ","; break;
            case 186: enLetter = ";"; break;
            case 190: enLetter = "."; break;
            default: enLetter = String.fromCharCode(charCode).toLowerCase();
        }

        heLetter = lettersObj[enLetter];

        for (let i = 0; i < CHAR_NUM; i++) {
            if (heLetter === charBtnArr[i].textContent) {
                targetBtn = charBtnArr[i];
                break;
            }
        }
    }

    if (!heLetter) return;

    if (!guessedLetters.includes(heLetter)) {
        guessedLetters.push(heLetter);
    }

    if (chosenWord.includes(heLetter)) {
        inWord = true;
        if (targetBtn) targetBtn.style.backgroundColor = "rgb(143, 146, 151)";
        renderWordSlots();
    } else {
        if (targetBtn) {
            targetBtn.style.backgroundColor = "rgb(143, 146, 151)";
            mistakesCounter++;
            showHangman();
            removeBtnAnimated(targetBtn);
        }
    }

    isFinished();
};

const nextWord = () => {
    for (let i = 1; i <= MAX_MISTAKES; i++) {
        document.getElementById(`part${i}`).style.visibility = "hidden";
    }

    for (let i = 0; i < charBtnArr.length; i++) {
        charBtnArr[i].style.visibility = "visible";
        charBtnArr[i].style.pointerEvents = "auto";
        charBtnArr[i].style.backgroundColor = "rgb(173, 190, 216)";
    }

    chosenWord = "";
    guessedLetters = [];
    hint.textContent = "";
    hintBtn.style.display = "block";

    mistakesCounter = 0;
    hintBtn.addEventListener("click", hintReveal);

    randomWord();
};

const removeBtnAnimated = (btn) => {
    btn.style.pointerEvents = "none";

    const rect = btn.getBoundingClientRect();
    const parentRect = keyboard.getBoundingClientRect();
    const pixelSize = 6;

    for (let x = 0; x < rect.width; x += pixelSize) {
        for (let y = 0; y < rect.height; y += pixelSize) {
            const pixel = document.createElement("div");

            pixel.classList.add("pixel");
            pixel.style.backgroundColor = getComputedStyle(btn).backgroundColor;
            pixel.style.left = `${rect.left - parentRect.left + x}px`;
            pixel.style.top = `${rect.top - parentRect.top + y}px`;
            pixel.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
            pixel.style.setProperty("--dy", `${(Math.random() - 0.5) * 120}px`);
            keyboard.appendChild(pixel);
            pixel.addEventListener("animationend", () => {
                pixel.remove();
            });
        }
    }
    btn.style.visibility = "hidden";
};

const showHangman = () => {
    if (mistakesCounter <= MAX_MISTAKES && mistakesCounter > 0) {
        document.getElementById(`part${mistakesCounter}`).style.visibility = "visible";
    }
};

const isFinished = () => {
    let didWin = true;

    for (let i = 0; i < chosenWord.length; i++) {
        const char = chosenWord[i];
        if (char !== '_' && char !== ' ' && !guessedLetters.includes(char)) {
            didWin = false;
            break;
        }
    }

    if (didWin) {
        if (!isTimerMode) {
            clearInterval(countdown);
            keyboard.style.display = "none";
            hint.style.display = "none";
            guess.textContent = "כל הכבוד ניצחת!";
            document.getElementById("shoebill2").style.animation = "fly 2.5s linear forwards";
            hintBtn.style.display = "block";
            hintBtn.textContent = "התחל משחק חדש!";
            hintBtn.removeEventListener("click", hintReveal);
            hintBtn.addEventListener("click", initGame);
        } else {
            setTimeout(() => {
                score++;
                document.getElementById("score").textContent = `מילים: ${score}`;
                nextWord();
            }, 500);
        }
        return;
    }

    if (mistakesCounter === MAX_MISTAKES) {
        if (isTimerMode) {
            if (time === 0) {
                guess.textContent = `אוי נגמר הזמן! הצלחת לפתור : ${score} מילים!`;
            }
            nextWord();
            return;
        }

        guess.textContent = "אוי... נראה שטעית יותר מדי!";
        clearInterval(countdown);
        
        keyboard.style.display = "none";
        hint.style.display = "none";
        document.querySelector(".word-paragraph").style.display = "none";
        document.getElementById("shoebill-lost").style.visibility = "visible";
    
        hintBtn.style.display = "block";
        hintBtn.textContent = "התחל משחק חדש!";
        hintBtn.removeEventListener("click", hintReveal);
        hintBtn.addEventListener("click", initGame);
    }
};

const hintReveal = () => {
    hintBtn.style.display = "none";
    hintBtn.removeEventListener("click", hintReveal);
    hint.textContent = wordsObj[chosenWord];
};

const initGame = () => {
    clearInterval(countdown);

    if (isTimerMode) {
        timerElement.style.display = "block";
        document.getElementById("score").style.display = "block";
        startTimer();
    } else {
        timerElement.style.display = "none";
        document.getElementById("score").style.display = "none";
    }

    mistakesCounter = 0;
    chosenWord = "";
    guessedLetters = [];

    word.textContent = "";
    hint.textContent = "";
    guess.textContent = "תתחיל לנחש!";

    score = 0;
    document.getElementById("score").textContent = `מילים: ${score}`;
    document.getElementById("shoebill2").style.animation = "none";

    keyboard.style.display = "flex";
    document.querySelector(".word-paragraph").style.display = "flex";

    hint.style.display = "block";
    hintBtn.style.display = "block";
    hintBtn.style.top = "90%";
    hintBtn.textContent = "תן רמז קטן";

    hintBtn.removeEventListener("click", initGame);
    hintBtn.removeEventListener("click", hintReveal);
    hintBtn.addEventListener("click", hintReveal);

    document.getElementById("shoebill-lost").style.visibility = "hidden";

    for (let i = 1; i <= MAX_MISTAKES; i++) {
        document.getElementById(`part${i}`).style.visibility = "hidden";
    }

    for (let i = 0; i < charBtnArr.length; i++) {
        charBtnArr[i].style.visibility = "visible";
        charBtnArr[i].style.pointerEvents = "auto";
        charBtnArr[i].style.backgroundColor = "rgb(173, 190, 216)";
    }

    randomWord();
};

const init = () => {
    document.addEventListener("keydown", (e) => {
        isBtn = false;
        showLetters(e);
    });

    for (let i = 0; i < CHAR_NUM; i++) {
        charBtnArr[i].addEventListener("click", (e) => {  
            isBtn = true;
            showLetters(e);
        });
    }

    hintBtn.addEventListener("click", hintReveal);
    normalBtn.click();
};

init();