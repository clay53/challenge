console.log('----index.js working correctly----')

/**
 * @typedef {{questions: {prompt: string, options: Object.<string, string>}[], results: string[]}} UTBQuizData
 */

// this is the questions data that you should use, feel free to change the questions data
// for testing purpose
/** @type {UTBQuizData} */
const data = {
  questions: [
      {
          prompt: 'Slowly, over time, have your parents stopped saying your name and started calling you by generic names like "champ", "kiddo", "disappointment", or "buddy"?',
          options: {
              A: "They usually say my name two to five times every sentence to make sure they don't forget it.",
              B: "When I call, they tell me to 'hold on, I need to check your birth certificate.'",
              C: "They usually ask me if I'm calling the wrong number.",
              D: "I never talk to my parents."
          }
      },
      {
          prompt: 'When was the last time your parents expressed disappointment in you?',
          options: {
              A: "Never. I am a paradigm of human excellence.",
              B: "The third time they caught me in a compromising position with a peach.",
              C: "When I asked them for a single bean.",
              D: "When I called them over the phone sobbing, telling them that I miss them and wish they were a larger presence in my life."
          }
      },
      {
          prompt: 'How much of your childhood trauma stems specifically from the way your parents raised you?',
          options: {
              A: "T-trauma? Who has that? Ha. Hahahahahahahahah-",
              B: "My parents are two very nice, gentle people who never really wanted to commit to the responsibilities of childrearing and I suffered for it.",
              C: "Let's not talk about it.",
              D: "I was raised as an upstanding, moral individual thanks to the occasional spanking."
          }
      },
      {
          prompt: 'Do you often dream of your mother giving you a nice, warm sponge bath, as if your brain is craving maternal comfort?',
          options: {
              A: "Yes, but it is my father who is doing the sponging.",
              B: "No, I do not dream because I cannot fall asleep at night because I worry that my parents hate me.",
              C: "Yes, except I wasn't dreaming, and I was, in fact, remembering the last night I spent time with my mother before returning to school.",
              D: " I'm allergic to sponges, so this is not a dream, but a nightmare."
          }
      },
      {
          prompt: "If you were asked to identify the sound of your father's voice, would you be able to do it?",
          options: {
              A: "No, because my father's voice is identical to that of James Earl Jones and I think every man sounds like James Earl Jones.",
              B: "No, because my father has a medical condition that does not allow him to speak.",
              C: "No, because I have not talked to my father since I left home.",
              D: "No, because my father is a chronic smoker, smokes twenty cigarettes a day, and as a result his voice becomes more unrecognizable with every passing day."
          }
      },
      {
          prompt: "If you do not call your parents, will they ever call you?",
          options: {
              A: "No.",
              B: "No.",
              C: "No.",
              D: "No.",
          }
      },
  ],
  results: [
      "Your parents don't miss you and just feel obligated to talk to you when they call. You are a nuisance in their life and a constant drain on their financial resources. You're the reason they weren't able to go to Cancun this year, and you should be ashamed of it.",
      "Your parents don't miss you and just feel obligated to talk to you! You are their greatest disappointment, and you will never live up to the high expectations set by your older sibling. You will forever live in their shadow, and your parents will leave everything to your high-achieving sibling and will only leave you one bean.",
      "Your parents feel obligated to talk to you, but still love you. They are just rediscovering themselves in their old age and deserve the time to do so. They'll always be there for you, and are your biggest supporters. I hope you give them the chance to do so.",
      "Your parents don't miss you, and you are in fact a horrible person. Your parents are right to disown you. I am sorry, but you will need to put yourself up for adoption right now.",
  ]
}

// Write your code below...

class UTBQuiz extends HTMLElement {
    /** @type {boolean} */
    #rendered = false;

    /** @type{UTBQuizData} */
    #data;

    /** @type{HTMLDivElement} */
    #questionsDiv;

    constructor() {
        super();
    }

    connectedCallback() {
        // ensure if element is moved it doesn't try to remake itself. I know it's not necessary for this example, but I thought it would be good to demonstrate reusability
        if (this.rendered) {
            console.log("already rendered");
            return;
        }
        console.log("rendering...");
        this.#rendered = true;

        // Get data

        const dataSourceAttr = this.getAttribute("data-source");
        if (dataSourceAttr === "built-in" || dataSourceAttr === null) {
            this.#data = data;
            this.#onData();
        } else {
            const xhr = new XMLHttpRequest();
            try {
                xhr.onload = () => {
                    if (xhr.status !== 200) {
                        let msg = `Bad quiz data response: ${xhr.statusText} (${xhr.status}): ${xhr.responseText}`;
                        console.error(msg, xhr);
                        this.replaceChildren(document.createTextNode(msg));
                        return;
                    }
                    try {
                        const data = JSON.parse(xhr.response);
                        this.#data = data;
                    } catch (error) {
                        let msg = `Failed to parse data because ${error}`;
                        console.error (msg, error);
                        this.replaceChildren(document.createTextNode(msg));
                    }
                    this.#onData();
                }
                xhr.open("GET", dataSourceAttr);
                xhr.send();
            } catch (error) {
                const msg = `Failed to get quiz data from ${dataSourceAttr} because ${error}`;
                console.error(msg, error);
                this.replaceChildren(document.createTextNode(msg));
            }
        }
    }

    #onData() {
        // bonus types
        /**
         * @typedef{Object} QuestionDivExt
         * @property {HTMLButtonElement} optionsDiv
         * @typedef {HTMLButtonElement & QuestionDivExt} QuestionDiv
         */

        /**
         * @typedef{Object} OptionDivExt
         * @property {HTMLButtonElement} optionCheckBox
         * @typedef {HTMLButtonElement & OptionDivExt} OptionDiv
         */

        // Render questions 

        this.#questionsDiv = document.createElement("div");

        for (let questionIndex = 0; questionIndex < this.#data.questions.length; questionIndex++) {
            const question = this.#data.questions[questionIndex];
            /** @type {QuestionDiv} */
            const questionDiv = document.createElement("div");

            const questionHeader = document.createElement("h2");
            questionHeader.innerText = `${questionIndex+1}. ${question.prompt}`;

            questionDiv.optionsDiv = document.createElement("div");

            /**
             * @function
             * @param {number} targetOptionIndex
             */
            function selectOptionByIndex(targetOptionIndex) {
                for (let currentOptionIndex = 0; currentOptionIndex < questionDiv.optionsDiv.children.length; currentOptionIndex++) {
                    /** @type(OptionDiv) */
                    const optionDiv = questionDiv.optionsDiv.children[currentOptionIndex];
                    
                    if (currentOptionIndex !== targetOptionIndex) {
                        // class list functions are idempotent - no need to check if checked already or not
                        optionDiv.optionCheckBox.classList.remove("option-check-box-checked");
                        optionDiv.optionCheckBox.classList.add("option-check-box-unchecked");
                    } else {
                        // class list functions are idempotent - no need to check if checked already or not
                        optionDiv.optionCheckBox.classList.remove("option-check-box-unchecked");
                        optionDiv.optionCheckBox.classList.add("option-check-box-checked");
                    }
                }
                tryCalculateResults();
            }

            const optionsKeys = Object.keys(question.options);
            for (let optionIndex = 0; optionIndex < optionsKeys.length; optionIndex++) {
                const optionKey = optionsKeys[optionIndex];

                // construct OptionDiv
                /** @type{OptionDiv} */
                const optionDiv = document.createElement("div");

                optionDiv.optionCheckBox = document.createElement("button");
                optionDiv.optionCheckBox.innerText = optionKey;
                optionDiv.optionCheckBox.classList.add("option-check-box");
                optionDiv.optionCheckBox.classList.add("option-check-box-unchecked");
                optionDiv.optionCheckBox.addEventListener('click', () => {
                    selectOptionByIndex(optionIndex);
                });
                
                const optionDescriptionP = document.createElement("span");
                optionDescriptionP.innerText = question.options[optionKey];

                // Render optionDiv
                optionDiv.replaceChildren(optionDiv.optionCheckBox, optionDescriptionP);

                // Linearly render optionsDiv
                questionDiv.optionsDiv.appendChild(optionDiv);
            }

            questionDiv.replaceChildren(questionHeader, questionDiv.optionsDiv);

            this.#questionsDiv.appendChild(questionDiv);
        }

        const showButton = document.createElement("button");
        /** @type{"disabled"|"notShowing"|"showing"} */
        let showButtonState = "disabled";
        showButton.disabled = true;
        if (this.#data.questions.length > 0) {
            showButton.innerText = "No questions have been answered";
        } else {
            showButton.innerText = "This quiz has no questions?!";
        }
        const notShowingMsg = "Click to show results";

        const resultP = document.createElement("p");

        const tryCalculateResults = () => {
            if (showButtonState === "showing") {
                return null;
            }
            const optionCounts = [];
            const unansweredQuestions = [];
            for (let questionIndex = 0; questionIndex < this.#questionsDiv.children.length; questionIndex++) {
                /** @type {QuestionDiv} */
                const questionDiv = this.#questionsDiv.children[questionIndex];
                let chosenOptionIndex = null;
                for (let optionIndex = 0; optionIndex < questionDiv.optionsDiv.children.length; optionIndex++) {
                    /** @type{OptionDiv} */
                    const optionDiv = questionDiv.optionsDiv.children[optionIndex];
                    if (optionDiv.optionCheckBox.classList.contains("option-check-box-checked")) {
                        chosenOptionIndex = optionIndex;
                        break;
                    }
                }
                if (chosenOptionIndex === null) {
                    unansweredQuestions.push(questionIndex);
                    continue;
                }
                if (optionCounts[chosenOptionIndex] === undefined) {
                    optionCounts[chosenOptionIndex] = 1; // may leave empty slots - remember to handle properly when reading
                } else {
                    optionCounts[chosenOptionIndex]++;
                }
            }
            if (unansweredQuestions.length > 0) {
                if (unansweredQuestions.length === 1) {
                    showButton.innerText = `Question ${unansweredQuestions[0]+1} is unanswered`;
                } else if (unansweredQuestions.length === 2) {
                    showButton.innerText = `Questions ${unansweredQuestions[0]+1} and ${unansweredQuestions[1]+1} are unanswered`;
                } else {
                    let msg = `Questions ${unansweredQuestions[0]+1}`;
                    for (let i = 1; i < unansweredQuestions.length-1; i++) {
                        msg += `, ${unansweredQuestions[i]+1}`;
                    }
                    msg += `, and ${unansweredQuestions[unansweredQuestions.length-1]+1} are unanswered`;
                    showButton.innerText = msg;
                }
                return null;
            }
            if (optionCounts.length === 0) {
                return null;
            }
            let maxIndex = -1;
            let maxCount = 0;
            for (let i = 0; i < optionCounts.length; i++) {
                const count = optionCounts[i];
                if (count === undefined) {
                    continue;
                }
                if (count > maxCount) {
                    maxIndex = i;
                    maxCount = count;
                }
            }
            if (showButtonState === "disabled") {
                showButtonState = "notShowing";
                showButton.innerText = notShowingMsg;
                showButton.disabled = false;
            }
            return maxIndex;
        }


        showButton.addEventListener('click', () => {
            if (showButtonState === "disabled") {
                return;
            }
            if (showButtonState === "notShowing") {
                const resultIndex = tryCalculateResults();
                if (typeof(resultIndex) !== "number") {
                    return;
                }
                const resultText = this.#data.results[resultIndex];
                if (resultText === undefined) {
                    const error = `Result index ${resultIndex} is not in data's results. Is the data malformed?`;
                    console.error(error);
                    alert(error);
                    return;
                }
                resultP.innerText = resultText;

                // disable options buttons
                for (const questionDiv of this.#questionsDiv.children) {
                    for (const optionDiv of /** @type {HTMLCollectionOf<OptionDiv>} */ (questionDiv.optionsDiv.children)) {
                        optionDiv.optionCheckBox.disabled = true;
                    }
                }

                showButtonState = "showing";
                showButton.innerText = "Retake Quiz";
            } else if (showButtonState === "showing") {
                // no need to recalculate results because can't change while showing
                
                // reenable options buttons
                for (const questionDiv of this.#questionsDiv.children) {
                    for (const optionDiv of /** @type {HTMLCollectionOf<OptionDiv>} */ (questionDiv.optionsDiv.children)) {
                        optionDiv.optionCheckBox.disabled = false;
                    }
                }

                // hide result
                resultP.innerText = "";

                showButtonState = "notShowing";
                showButton.innerText = notShowingMsg;
            }
        });

        this.replaceChildren(this.#questionsDiv, showButton, resultP);
    }
}
customElements.define("utb-quiz", UTBQuiz);
