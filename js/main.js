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

// #region Choice level // 
const quizForm = document.getElementById('quiz-form');

if (quizForm && quizForm.dataset.layout === 'all-at-once') {
    const allAtOnceQuestions = [...quizForm.querySelectorAll('.quiz-question')];
    const allAtOnceMessage = document.getElementById('quiz-message');

    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const unanswered = allAtOnceQuestions.find(question => !question.querySelector('input:checked'));

        if (unanswered) {
            allAtOnceMessage.textContent = `Please answer question ${unanswered.dataset.question} before submitting.`;
            unanswered.querySelector('input').focus();
            return;
        }

        const correctAnswers = allAtOnceQuestions.filter(question => {
            return question.querySelector('input:checked').value === question.dataset.correct;
        }).length;

        if (correctAnswers === allAtOnceQuestions.length) {
            window.location.href = 'Q2-Slider.html';
            return;
        }

        allAtOnceMessage.textContent = `You got ${correctAnswers} of ${allAtOnceQuestions.length} correct. Review your answers and try again.`;
    });
}

if (quizForm && quizForm.dataset.layout !== 'all-at-once') {
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

// #endregion Choice level // 

//#region Slider Level //
const sliderSurvey = document.getElementById('slider-survey-form');

if (sliderSurvey) {
    const surveySliders = [...sliderSurvey.querySelectorAll('input[type="range"]')];
    const surveyGroups = [...sliderSurvey.querySelectorAll('.slider-group')];
    const surveyMessage = document.getElementById('slider-survey-message');

    surveySliders.forEach((slider) => {
        const output = document.getElementById(`${slider.id}-output`);
        slider.addEventListener('input', () => {
            output.textContent = slider.value;
        });
    });

    sliderSurvey.addEventListener('submit', (event) => {
        event.preventDefault();

        const allAnswersCorrect = surveyGroups.every((group) => {
            const slider = group.querySelector('input[type="range"]');
            return slider && (slider.value === '1' || slider.value === '10') && slider.value === group.dataset.correct;
        });

        if (!allAnswersCorrect) {
            window.location.href = 'Message.html';
            return;
        }

        window.location.href = 'Q3-Wordle.html';
    });
}

const wordleGame = document.querySelector('wordle-for-good');

if (wordleGame) {
    const wordleSuccess = document.getElementById('success');
    const wordleFailure = document.getElementById('failure');
    const wordleContinue = document.getElementById('wordle-continue');
    wordleContinue.disabled = true;

    function isVisible(element) {
        return element
            && element.getAttribute('aria-hidden') !== 'true'
            && window.getComputedStyle(element).display !== 'none';
    }

    function updateWordleResult() {
        wordleGame.hidden = false;

        if (isVisible(wordleFailure)) {
            window.location.href = 'Message.html';
            return;
        }

        if (isVisible(wordleSuccess)) {
            wordleContinue.disabled = false;
        }
    }

    const wordleObserver = new MutationObserver(updateWordleResult);
    wordleObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['hidden', 'aria-hidden', 'style', 'class'],
        childList: true,
        subtree: true
    });

    wordleContinue.addEventListener('click', () => {
        window.location.href = 'Q4-Slots.html';
    });
}
// #endregion //

// #region Slot Machine Level //
const spinButton = document.getElementById('q4-slot-spin-button') || document.getElementById('spin-button');

if (spinButton) {
    const symbols = ['\uD83C\uDF52', '\u2B50', '\uD83D\uDC8E', '\uD83C\uDF40', '\uD83D\uDD14', '\uD83C\uDF4B'];
    const reels = [...document.querySelectorAll('.slot-reel')];
    const reelSymbols = reels.map((reel) => reel.querySelector('.slot-symbol') || reel);
    const slotMessage = document.getElementById('q4-slot-message') || document.getElementById('slot-message');
    const continueButton = document.getElementById('q4-slot-continue');
    let spinCount = 0;

    if (continueButton) {
        continueButton.hidden = false;
        continueButton.disabled = true;
    }

    function getSpinResult() {
        spinCount += 1;
        const guaranteedWinWindow = spinCount >= 20 && Math.random() < .9;

        if (guaranteedWinWindow) {
            return ['\u2B50', '\u2B50', '\u2B50'];
        }

        const result = reels.map(() => symbols[Math.floor(Math.random() * symbols.length)]);
        if (result.every((symbol) => symbol === '\u2B50')) {
            result[result.length - 1] = '\uD83C\uDF52';
        }
        return result;
    }

    spinButton.addEventListener('click', () => {
        spinButton.disabled = true;
        slotMessage.textContent = 'Spinning...';
        reelSymbols.forEach((symbol) => symbol.classList.add('is-spinning'));

        window.setTimeout(() => {
            const result = getSpinResult();
            result.forEach((symbol, index) => {
                reelSymbols[index].textContent = symbol;
                reelSymbols[index].classList.remove('is-spinning');
            });

            const isTripleStar = result.every((symbol) => symbol === '\u2B50');
            slotMessage.textContent = isTripleStar ? 'Triple star! Jackpot!' : 'Thanks for spinning!';
            if (isTripleStar && continueButton) {
                continueButton.hidden = false;
                continueButton.disabled = false;
            }
            spinButton.disabled = false;
        }, 900);
    });

    if (continueButton) {
        continueButton.addEventListener('click', () => {
            window.location.href = 'Q5-Minecraft.html';
        });
    }
}

// #endregion //

// #region Rhythm Level // 
        const rhythmKeys = ["d", "f", "j", "k"];
        const rhythmBoard = document.getElementById("rhythm-board");
        const rhythmLanes = [...document.querySelectorAll(".rhythm-lane")];
        const rhythmStart = document.getElementById("rhythm-start");
        const rhythmTime = document.getElementById("rhythm-time");
        const rhythmScore = document.getElementById("rhythm-score");
        const rhythmMessage = document.getElementById("rhythm-message");
        const rhythmHealthFill = document.getElementById("rhythm-health-fill");
        const rhythmHealthText = document.getElementById("rhythm-health-text");
        const rhythmContinue = document.getElementById("rhythm-continue");

        if (rhythmContinue) {
            rhythmContinue.hidden = false;
            rhythmContinue.disabled = true;
        }

        let rhythmPlaying = false;
        let rhythmHealth = 100;
        let rhythmPoints = 0;
        let rhythmSeconds = 30;
        let rhythmNotes = [];
        let rhythmStartTime = 0;
        let rhythmLastSpawn = 0;
        let rhythmAnimation;
        let rhythmTimer;

        const rhythmTravelTime = 1500;
        const rhythmHitWindow = 260;
        const rhythmSpawnInterval = 620;

        function updateRhythmHealth(amount) {
            rhythmHealth = Math.max(0, rhythmHealth - amount);
            rhythmHealthFill.style.width = `${rhythmHealth}%`;
            rhythmHealthText.textContent = `${rhythmHealth}%`;

            if (rhythmHealth <= 35) {
                rhythmHealthFill.style.backgroundColor = "#9b2727";
            } else if (rhythmHealth <= 65) {
                rhythmHealthFill.style.backgroundColor = "#c98527";
            }

            if (rhythmHealth === 0) {
                endRhythmGame(true);
            }
        }

        function spawnRhythmNote(now) {
            const laneIndex = Math.floor(Math.random() * rhythmKeys.length);
            const note = document.createElement("div");
            note.className = "rhythm-note";
            note.setAttribute("aria-hidden", "true");
            rhythmLanes[laneIndex].appendChild(note);
            rhythmNotes.push({ laneIndex, element: note, spawnTime: now, hit: false });
        }

        function removeRhythmNote(note) {
            note.element.remove();
            rhythmNotes = rhythmNotes.filter(activeNote => activeNote !== note);
        }

        function animateRhythmHit(laneIndex) {
            const target = rhythmLanes[laneIndex].querySelector(".rhythm-target");
            if (!target) return;

            target.classList.remove("is-hit");
            void target.offsetWidth;
            target.classList.add("is-hit");
            window.setTimeout(() => target.classList.remove("is-hit"), 300);
        }

        function endRhythmGame(lost) {
            if (!rhythmPlaying) return;
            rhythmPlaying = false;
            cancelAnimationFrame(rhythmAnimation);
            clearInterval(rhythmTimer);
            rhythmNotes.forEach(note => note.element.remove());
            rhythmNotes = [];
            rhythmStart.disabled = false;

            if (lost) {
                rhythmMessage.textContent = "Your health reached 0. Redirecting...";
                window.setTimeout(() => {
                    window.location.href = "Message.html";
                }, 500);
            } else {
                rhythmMessage.textContent = `Nice rhythm! Final score: ${rhythmPoints}.`;
                rhythmStart.textContent = "Play Again";
                if (rhythmContinue && rhythmHealth > 0) {
                    rhythmContinue.disabled = false;
                }
            }
        }

        function rhythmFrame(now) {
            if (!rhythmPlaying) return;

            if (now - rhythmLastSpawn >= rhythmSpawnInterval && now - rhythmStartTime < 30000) {
                spawnRhythmNote(now);
                rhythmLastSpawn = now;
            }

            const boardHeight = rhythmBoard.clientHeight;
            rhythmNotes.slice().forEach(note => {
                const age = now - note.spawnTime;
                const progress = age / rhythmTravelTime;
                const target = rhythmLanes[note.laneIndex].querySelector(".rhythm-target");
                const targetTop = target ? target.offsetTop : boardHeight - 70;
                note.element.style.top = `${progress * targetTop}px`;

                if (age > rhythmTravelTime + rhythmHitWindow) {
                    updateRhythmHealth(10);
                    rhythmMessage.textContent = "Missed note! Keep going.";
                    removeRhythmNote(note);
                }
            });

            rhythmAnimation = requestAnimationFrame(rhythmFrame);
        }

        function startRhythmGame() {
            rhythmPlaying = true;
            rhythmHealth = 100;
            rhythmPoints = 0;
            rhythmSeconds = 30;
            rhythmNotes = [];
            rhythmStartTime = performance.now();
            rhythmLastSpawn = rhythmStartTime;
            rhythmStart.disabled = true;
            rhythmStart.textContent = "Playing...";
            if (rhythmContinue) rhythmContinue.disabled = true;
            rhythmScore.textContent = "Score: 0";
            rhythmTime.textContent = "Time: 30s";
            rhythmMessage.textContent = "Follow the beat!";
            rhythmHealthFill.style.width = "100%";
            rhythmHealthFill.style.backgroundColor = "#20b2ab";
            rhythmHealthText.textContent = "100%";

            rhythmTimer = setInterval(() => {
                rhythmSeconds -= 1;
                rhythmTime.textContent = `Time: ${Math.max(0, rhythmSeconds)}s`;
                if (rhythmSeconds <= 0) endRhythmGame(false);
            }, 1000);

            rhythmAnimation = requestAnimationFrame(rhythmFrame);
        }

        document.addEventListener("keydown", event => {
            if (!rhythmPlaying || !rhythmKeys.includes(event.key.toLowerCase())) return;
            event.preventDefault();

            const key = event.key.toLowerCase();
            const laneIndex = rhythmKeys.indexOf(key);
            const now = performance.now();
            const matchingNotes = rhythmNotes.filter(note => note.laneIndex === laneIndex);
            const note = matchingNotes.sort((a, b) =>
                Math.abs((now - a.spawnTime) - rhythmTravelTime) - Math.abs((now - b.spawnTime) - rhythmTravelTime)
            )[0];

            if (note && Math.abs((now - note.spawnTime) - rhythmTravelTime) <= rhythmHitWindow) {
                rhythmPoints += 10;
                rhythmScore.textContent = `Score: ${rhythmPoints}`;
                rhythmMessage.textContent = "Great hit!";
                animateRhythmHit(laneIndex);
                removeRhythmNote(note);
            } else {
                updateRhythmHealth(15);
                rhythmMessage.textContent = "Wrong timing!";
            }
        });

        if (rhythmStart) {
            rhythmStart.addEventListener("click", startRhythmGame);
        }

        if (rhythmContinue) {
            rhythmContinue.addEventListener("click", () => {
                if (rhythmHealth > 0 && !rhythmPlaying && rhythmSeconds <= 0) {
                    window.location.href = "Q7-Signature.html";
                }
            });
        }
// #endregion //

// #region Signature Level //
        const signatureCanvas = document.getElementById("signature-canvas");
if (signatureCanvas) {
        const signatureCanvasWrap = document.querySelector(".signature-canvas-wrap");
        const signaturePenTrigger = document.getElementById("signature-pen-trigger");
        const signatureActivePen = document.getElementById("signature-pen-active");
        const signatureStatus = document.getElementById("signature-status");
        const signatureContinue = document.getElementById("signature-continue");
        const signatureContext = signatureCanvas.getContext("2d");
        let signaturePenEnabled = false;
        let signatureDrawing = false;
        let signatureHasDrawn = false;

        if (signatureContinue) {
            signatureContinue.hidden = false;
            signatureContinue.disabled = true;
        }

        function resizeSignatureCanvas() {
            const previousImage = signatureCanvas.width && signatureCanvas.height
                ? signatureContext.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height)
                : null;
            const scale = window.devicePixelRatio || 1;
            const bounds = signatureCanvas.getBoundingClientRect();
            signatureCanvas.width = Math.round(bounds.width * scale);
            signatureCanvas.height = Math.round(bounds.height * scale);
            signatureContext.setTransform(scale, 0, 0, scale, 0, 0);
            signatureContext.lineWidth = 4;
            signatureContext.lineCap = "round";
            signatureContext.lineJoin = "round";
            signatureContext.strokeStyle = "#2b5044";

            if (previousImage) {
                signatureContext.putImageData(previousImage, 0, 0);
            }
        }

        function canvasPoint(event) {
            const bounds = signatureCanvas.getBoundingClientRect();
            return {
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top
            };
        }

        function moveActivePen(event) {
            const canvasBounds = signatureCanvas.getBoundingClientRect();
            const wrapBounds = signatureCanvasWrap.getBoundingClientRect();
            signatureActivePen.style.left = `${event.clientX - canvasBounds.left}px`;
            signatureActivePen.style.top = `${event.clientY - canvasBounds.top}px`;
            signatureActivePen.style.maxWidth = `${wrapBounds.width * .75}px`;
        }

        signaturePenTrigger.addEventListener("click", () => {
            signaturePenEnabled = true;
            signaturePenTrigger.classList.add("is-hidden");
            signatureCanvas.classList.add("is-active");
            signatureActivePen.style.left = "50%";
            signatureActivePen.style.top = "50%";
            signatureActivePen.classList.add("is-visible");
            signatureStatus.textContent = "Pen ready. Click and drag to draw.";
        });

        signatureCanvas.addEventListener("pointerdown", event => {
            if (!signaturePenEnabled) return;
            signatureDrawing = true;
            signatureHasDrawn = true;
            if (signatureContinue) signatureContinue.disabled = false;
            signatureCanvas.setPointerCapture(event.pointerId);
            const point = canvasPoint(event);
            signatureContext.beginPath();
            signatureContext.moveTo(point.x, point.y);
            moveActivePen(event);
            signatureActivePen.classList.add("is-visible");
        });

        signatureCanvas.addEventListener("pointermove", event => {
            if (!signaturePenEnabled) return;
            moveActivePen(event);
            if (!signatureDrawing) return;
            const point = canvasPoint(event);
            signatureContext.lineTo(point.x, point.y);
            signatureContext.stroke();
        });

        function stopSignatureDrawing(event) {
            if (!signatureDrawing) return;
            signatureDrawing = false;
            if (event && signatureCanvas.hasPointerCapture(event.pointerId)) {
                signatureCanvas.releasePointerCapture(event.pointerId);
            }
            signatureContext.closePath();
        }

        signatureCanvas.addEventListener("pointerup", stopSignatureDrawing);
        signatureCanvas.addEventListener("pointercancel", stopSignatureDrawing);
        window.addEventListener("resize", resizeSignatureCanvas);
        resizeSignatureCanvas();

        if (signatureContinue) {
            signatureContinue.addEventListener("click", () => {
                if (signatureHasDrawn) {
                    window.location.href = "Q8-Movie.html";
                }
            });
        }
}
// #endregion //

// #region Movie Level //

        const movieTimer = document.getElementById("movie-timer");
if (movieTimer) {
        const movieStatus = document.getElementById("movie-status");
        const movieContinue = document.getElementById("movie-continue");
        const movieFastForward = document.getElementById("movie-fast-forward");
        const movieTotalSeconds = 1 * 60 * 60 + 33 * 60 + 40;
        let movieDurationSeconds = movieTotalSeconds;
        let movieRemainingSeconds = movieDurationSeconds;
        let moviePlayer = null;
        let movieTimestampSync = null;
        let movieFastForwardTimer = null;

        function formatMovieTime(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return [hours, minutes, seconds]
                .map(value => String(value).padStart(2, "0"))
                .join(":");
        }

        function renderMovieTimer() {
            movieTimer.textContent = formatMovieTime(movieRemainingSeconds);
        }

        function syncMovieTimerToVideo() {
            if (!moviePlayer || typeof moviePlayer.getCurrentTime !== "function") return;

            const videoDuration = moviePlayer.getDuration();
            if (videoDuration > 0) {
                movieDurationSeconds = Math.floor(videoDuration);
            }

            const videoTimestamp = Math.floor(moviePlayer.getCurrentTime());
            movieRemainingSeconds = Math.max(0, movieDurationSeconds - videoTimestamp);
            renderMovieTimer();

            if (movieRemainingSeconds === 0) {
                finishMovie();
            }
        }

        function finishMovie() {
            movieRemainingSeconds = 0;
            renderMovieTimer();
            movieStatus.textContent = "Movie complete. You may continue.";
            if (movieContinue) movieContinue.disabled = false;
            if (movieTimestampSync) clearInterval(movieTimestampSync);
            stopMovieFastForward();
            if (moviePlayer && typeof moviePlayer.pauseVideo === "function") {
                moviePlayer.pauseVideo();
            }
        }

        window.onYouTubeIframeAPIReady = function () {
            moviePlayer = new YT.Player("movie-video", {
                events: {
                    onReady() {
                        const videoDuration = moviePlayer.getDuration();
                        if (videoDuration > 0) {
                            movieDurationSeconds = Math.floor(videoDuration);
                            movieRemainingSeconds = movieDurationSeconds;
                            renderMovieTimer();
                        }
                        syncMovieTimerToVideo();
                        movieTimestampSync = setInterval(syncMovieTimerToVideo, 250);
                    },
                    onStateChange(event) {
                        if (event.data === YT.PlayerState.PLAYING) {
                            movieStatus.textContent = "Timer running with the video.";
                            syncMovieTimerToVideo();
                        } else if (event.data === YT.PlayerState.PAUSED) {
                            movieStatus.textContent = "Timer paused while the video is paused.";
                            syncMovieTimerToVideo();
                        } else if (event.data === YT.PlayerState.BUFFERING) {
                            movieStatus.textContent = "Buffering — timer paused.";
                            syncMovieTimerToVideo();
                        } else if (event.data === YT.PlayerState.ENDED) {
                            movieStatus.textContent = "Video ended.";
                            finishMovie();
                        }
                    }
                }
            });
        };

        function fastForwardMovie() {
            if (movieRemainingSeconds === 0) return;

            if (!moviePlayer || typeof moviePlayer.getCurrentTime !== "function") {
                movieRemainingSeconds = Math.max(0, movieRemainingSeconds - 10);
                renderMovieTimer();
                if (movieRemainingSeconds === 0) finishMovie();
                return;
            }

            const currentTime = moviePlayer.getCurrentTime();
            const nextTime = Math.min(movieDurationSeconds, currentTime + 10);

            if (typeof moviePlayer.seekTo === "function") {
                moviePlayer.seekTo(nextTime, true);
            }
            syncMovieTimerToVideo();
        }

        function stopMovieFastForward() {
            if (movieFastForwardTimer) {
                clearInterval(movieFastForwardTimer);
                movieFastForwardTimer = null;
            }
        }

        if (movieContinue) {
            movieContinue.hidden = false;
            movieContinue.disabled = true;
            movieContinue.addEventListener("click", () => {
                if (movieRemainingSeconds === 0) {
                    window.location.href = "Q9-Captcha.html";
                }
            });
        }

        if (movieFastForward) {
            movieFastForward.addEventListener("pointerdown", event => {
                event.preventDefault();
                fastForwardMovie();
                stopMovieFastForward();
                movieFastForwardTimer = setInterval(fastForwardMovie, 150);
            });
            window.addEventListener("pointerup", stopMovieFastForward);
            movieFastForward.addEventListener("pointerleave", stopMovieFastForward);
            movieFastForward.addEventListener("pointercancel", stopMovieFastForward);
        }

        renderMovieTimer();
}

// #endregion /

// #region Captcha Level //

        const captchaForm = document.getElementById("captcha-form");
if (captchaForm) {
        const captchaAnswer = document.getElementById("captcha-answer");
        const captchaMessage = document.getElementById("captcha-message");
        const captchaContinue = document.getElementById("captcha-continue");
        const captchaSolution = "Imascam";

        if (captchaContinue) {
            captchaContinue.hidden = false;
            captchaContinue.disabled = true;
        }

        captchaForm.addEventListener("submit", event => {
            event.preventDefault();
            const answer = captchaAnswer.value.trim();
            const isCorrect = answer === captchaSolution;

            captchaMessage.className = `captcha-message ${isCorrect ? "is-success" : "is-error"}`;
            captchaMessage.textContent = isCorrect
                ? "Correct! CAPTCHA verified."
                : "That answer is incorrect. Please try again.";

            if (isCorrect) {
                captchaAnswer.disabled = true;
                captchaForm.querySelector("button").disabled = true;
                if (captchaContinue) captchaContinue.disabled = false;
            } else {
                captchaAnswer.focus();
                captchaAnswer.select();
            }
        });

        if (captchaContinue) {
            captchaContinue.addEventListener("click", () => {
                if (captchaContinue.disabled) return;
                window.location.href = "Q10-.html";
            });
        }
}

// #endregion //

// #region Wordle Level //

// #endregion Wordle Level //
