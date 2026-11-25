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
// #region Slot Machine Level //
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
                note.element.style.top = `${progress * (boardHeight - 70)}px`;

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
                removeRhythmNote(note);
            } else {
                updateRhythmHealth(15);
                rhythmMessage.textContent = "Wrong timing!";
            }
        });

        rhythmStart.addEventListener("click", startRhythmGame);
// #endregion //

// #region Signature Level //
        const signatureCanvas = document.getElementById("signature-canvas");
        const signatureCanvasWrap = document.querySelector(".signature-canvas-wrap");
        const signaturePenTrigger = document.getElementById("signature-pen-trigger");
        const signatureActivePen = document.getElementById("signature-pen-active");
        const signatureStatus = document.getElementById("signature-status");
        const signatureContext = signatureCanvas.getContext("2d");
        let signaturePenEnabled = false;
        let signatureDrawing = false;

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
// #endregion //

// #region Movie Level //

        const movieTimer = document.getElementById("movie-timer");
        const movieStatus = document.getElementById("movie-status");
        const movieTotalSeconds = 1 * 60 * 60 + 33 * 60 + 40;
        let movieRemainingSeconds = movieTotalSeconds;
        let moviePlayer = null;
        let movieTimestampSync = null;

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

            const videoTimestamp = Math.floor(moviePlayer.getCurrentTime());
            movieRemainingSeconds = Math.max(0, movieTotalSeconds - videoTimestamp);
            renderMovieTimer();

            if (movieRemainingSeconds === 0) {
                movieStatus.textContent = "Time is up.";
                moviePlayer.pauseVideo();
            }
        }

        function onYouTubeIframeAPIReady() {
            moviePlayer = new YT.Player("movie-video", {
                events: {
                    onReady() {
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
                            syncMovieTimerToVideo();
                        }
                    }
                }
            });
        }

        renderMovieTimer();

// #endregion /

// #region Captcha Level //

        const captchaForm = document.getElementById("captcha-form");
        const captchaAnswer = document.getElementById("captcha-answer");
        const captchaMessage = document.getElementById("captcha-message");
        const captchaSolution = "Imascam";

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
            } else {
                captchaAnswer.focus();
                captchaAnswer.select();
            }
        });

// #endregion //