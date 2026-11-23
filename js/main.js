const textBoxes = document.querySelectorAll('input[type="text"], input[type="email"]');
const contractCheckbox = document.getElementById('contract');
const continueButton = document.getElementById('continue-button');

// The application form exists on index.html. Keep this code page-safe so the quiz
// can use the same JavaScript file without needing the application form elements.
if (contractCheckbox && continueButton) {
    function updateButtonState() {
        const everyTextBoxHasInformation = [...textBoxes].every((textBox) => textBox.value.trim() !== '');
        continueButton.disabled = !(contractCheckbox.checked && everyTextBoxHasInformation);
    }

    textBoxes.forEach((textBox) => textBox.addEventListener('input', updateButtonState));
    contractCheckbox.addEventListener('change', updateButtonState);
    continueButton.addEventListener('click', () => {
        window.location.href = 'JobApplicationGame.html';
    });
}

const quizForm = document.getElementById('quiz-form');

if (quizForm) {
    const questions = [...quizForm.querySelectorAll('.quiz-question')];
    const counter = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress-bar');
    const message = document.getElementById('quiz-message');
    const previousButton = document.getElementById('previous-question');
    const nextButton = document.getElementById('next-question');
    const completePanel = document.getElementById('quiz-complete');
    const restartButton = document.getElementById('restart-quiz');
    const applicationMessage = document.getElementById('application-message');
    const rejectionNotification = document.getElementById('rejection-notification');
    const sliders = quizForm.querySelectorAll('input[type="range"]');
    let currentQuestion = 0;

    sliders.forEach((slider) => {
        const output = document.getElementById(`${slider.id.replace('-slider', '')}-output`);
        if (output) {
            slider.addEventListener('input', () => {
                const suffix = slider.id === 'years-slider' ? ' year' : slider.id === 'awards-slider' ? ' award' : '';
                const pluralSuffix = slider.id === 'years-slider' ? ' years' : slider.id === 'awards-slider' ? ' awards' : '';
                output.textContent = `${slider.value}${slider.value === '1' ? suffix : pluralSuffix}`;
            });
        }
    });

    function showQuestion(index) {
        currentQuestion = index;
        questions.forEach((question, questionIndex) => {
            question.classList.toggle('is-active', questionIndex === currentQuestion);
        });

        const questionNumber = currentQuestion + 1;
        counter.textContent = `Question ${questionNumber} of ${questions.length}`;
        progressBar.style.width = `${(questionNumber / questions.length) * 100}%`;
        previousButton.disabled = currentQuestion === 0;
        nextButton.textContent = currentQuestion === questions.length - 1 ? 'Finish quiz' : 'Next question';
        message.textContent = '';
    }

    // FAILURE EVENT: Question 1 B/C and any failed Question 2 slider use this same ending.
    function triggerFailure() {
        quizForm.reset();
        quizForm.hidden = true;
        applicationMessage.hidden = false;
        rejectionNotification.hidden = false;
    }

    nextButton.addEventListener('click', () => {
        const selectedAnswer = questions[currentQuestion].querySelector('input:checked');
        const hasSliderAnswer = currentQuestion === 1 && questions[currentQuestion].querySelector('input[type="range"]');
        if (!selectedAnswer && !hasSliderAnswer) {
            message.textContent = 'Please choose an answer before continuing.';
            return;
        }

        if (currentQuestion === 0 && ['B', 'C'].includes(selectedAnswer.value)) {
            triggerFailure();
            return;
        }

        if (currentQuestion === 1) {
            const years = Number(document.getElementById('years-slider').value);
            const awards = Number(document.getElementById('awards-slider').value);
            const confidence = Number(document.getElementById('confidence-slider').value);
            const sliderFailure = years < 10 || awards < 15 || confidence !== 10;

            if (sliderFailure) {
                triggerFailure();
                return;
            }

            showQuestion(currentQuestion + 1);
            return;
        }

        if (currentQuestion === questions.length - 1) {
            quizForm.hidden = true;
            completePanel.hidden = false;
            return;
        }

        showQuestion(currentQuestion + 1);
    });

    previousButton.addEventListener('click', () => showQuestion(currentQuestion - 1));
    restartButton.addEventListener('click', () => {
        quizForm.reset();
        completePanel.hidden = true;
        applicationMessage.hidden = true;
        rejectionNotification.hidden = true;
        quizForm.hidden = false;
        showQuestion(0);
    });

    showQuestion(0);
}

const spinButton = document.getElementById('spin-button');

if (spinButton) {
    const symbols = ['🍒', '⭐', '💎', '🍀', '🔔', '🍋'];
    const reels = [...document.querySelectorAll('.slot-reel')];
    const slotMessage = document.getElementById('slot-message');

    spinButton.addEventListener('click', () => {
        spinButton.disabled = true;
        slotMessage.textContent = 'Spinning...';
        reels.forEach((reel) => reel.classList.add('is-spinning'));

        window.setTimeout(() => {
            const result = reels.map((reel) => {
                const symbol = symbols[Math.floor(Math.random() * symbols.length)];
                reel.textContent = symbol;
                reel.classList.remove('is-spinning');
                return symbol;
            });

            slotMessage.textContent = result.every((symbol) => symbol === result[0])
                ? 'Jackpot!'
                : 'Thanks for spinning!';
            spinButton.disabled = false;
        }, 900);
    });
}
