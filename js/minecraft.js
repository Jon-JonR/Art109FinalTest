        const MATERIALS = [
            { id: "plank", name: "Plank" },
            { id: "stick", name: "Stick" },
            { id: "cobble", name: "Cobble" },
            { id: "iron", name: "Iron" },
            { id: "diamond", name: "Diamond" },
            { id: "coal", name: "Coal" },
            { id: "string", name: "String" }
        ];

        const RECIPES = [
            { name: "Crafting Table", image: "images/Crafting_Table.png", pattern: [null, null, null, null, "plank", "plank", null, "plank", "plank"] },
            { name: "Chest", image: "images/Chest.png", pattern: ["plank", "plank", "plank", "plank", null, "plank", "plank", "plank", "plank"] },
            { name: "Torch", image: "images/Torch.webp", pattern: [null, null, null, null, null, "coal", null, null, "stick"] },
            { name: "Iron Pickaxe", image: "images/Iron_Pickaxe.webp", pattern: ["iron", "iron", "iron", null, "stick", null, null, "stick", null] },
            { name: "Diamond Sword", image: "images/Diamond_Sword.webp", pattern: [null, "diamond", null, null, "diamond", null, null, "stick", null] },
            { name: "Furnace", image: "images/Furnace.png", pattern: ["cobble", "cobble", "cobble", "cobble", null, "cobble", "cobble", "cobble", "cobble"] },
            { name: "Bow", image: "images/Bow.png", pattern: [null, "stick", "string", "stick", null, "string", null, "stick", "string"] },
            { name: "Bucket", image: "images/Bucket.webp", pattern: ["iron", null, "iron", "iron", null, "iron", "iron", "iron", "iron"] }
        ];

        const IMAGE_BY_NAME = {
            Plank: "images/plank.webp",
            Stick: "images/stick.webp",
            Cobble: "images/Cobble.png",
            Iron: "images/Iron.png",
            Diamond: "images/Diamond.webp",
            Coal: "images/Coal.png",
            String: "images/String.webp"
        };

        let selectedMat = "plank";
        let gridState = Array(9).fill(null);
        let currentRecipe = null;
        let score = 0;
        let timeLeft = 60;
        let active = true;
        let hasWon = false;
        let timer = null;

        const gridEl = document.getElementById("grid");
        const paletteEl = document.getElementById("palette");
        const outputEl = document.getElementById("output");
        const targetNameEl = document.getElementById("target-name");
        const timerEl = document.getElementById("timer");
        const feedbackEl = document.getElementById("feedback");
        const minecraftContinueButton = document.getElementById("minecraft-continue");

        if (minecraftContinueButton) {
            minecraftContinueButton.hidden = false;
            minecraftContinueButton.disabled = true;
        }

        function getMat(id) {
            return MATERIALS.find(material => material.id === id);
        }

        function imageTag(item) {
            const image = item.image || IMAGE_BY_NAME[item.name];
            return image
                ? `<img class="item-image" src="${image}" alt="${item.name}">`
                : "";
        }

        function renderPalette() {
            paletteEl.innerHTML = "";
            MATERIALS.forEach(mat => {
                const button = document.createElement("button");
                button.className = "mat-btn" + (selectedMat === mat.id ? " active" : "");
                button.type = "button";
                button.innerHTML = `${imageTag(mat)}<span>${mat.name}</span>`;
                button.onclick = () => {
                    selectedMat = mat.id;
                    renderPalette();
                };
                paletteEl.appendChild(button);
            });
        }

        function renderGrid() {
            gridEl.innerHTML = "";
            gridState.forEach((matId, index) => {
                const slot = document.createElement("div");
                slot.className = "slot";
                if (matId) {
                    const material = getMat(matId);
                    slot.innerHTML = `${imageTag(material)}<span class="label">${material.name}</span>`;
                }
                slot.onclick = () => {
                    if (!active) return;
                    gridState[index] = gridState[index] === selectedMat ? null : selectedMat;
                    renderGrid();
                    checkRecipe();
                };
                slot.oncontextmenu = event => {
                    event.preventDefault();
                    if (!active) return;
                    gridState[index] = null;
                    renderGrid();
                    checkRecipe();
                };
                gridEl.appendChild(slot);
            });
        }

        function checkRecipe() {
            const matched = RECIPES.find(recipe => recipe.pattern.every((value, index) => value === gridState[index]));
            if (matched) {
                outputEl.innerHTML = `${imageTag(matched)}<span class="label">${matched.name}</span>`;
                outputEl.classList.add("ready");
                outputEl.onclick = () => claimItem(matched);
            } else {
                outputEl.innerHTML = "";
                outputEl.classList.remove("ready");
                outputEl.onclick = null;
            }
        }

        function claimItem(matched) {
            if (!active || hasWon) return;
            if (matched.name === currentRecipe.name) {
                score += 1;
                hasWon = true;
                active = false;
                clearInterval(timer);
                feedbackEl.textContent = `Crafted ${matched.name}! (+1)`;
                if (minecraftContinueButton) minecraftContinueButton.disabled = false;
                clearGrid();
            } else {
                feedbackEl.textContent = `You crafted ${matched.name}, but need ${currentRecipe.name}!`;
                clearGrid();
            }
        }

        function clearGrid() {
            gridState = Array(9).fill(null);
            renderGrid();
            checkRecipe();
        }

        function nextRecipe() {
            const pool = RECIPES.filter(recipe => recipe !== currentRecipe);
            currentRecipe = pool[Math.floor(Math.random() * pool.length)];
            targetNameEl.innerHTML = `${imageTag(currentRecipe)}<span>${currentRecipe.name}</span>`;
        }

        function endGame() {
            if (hasWon) return;
            active = false;
            clearInterval(timer);
            timeLeft = 0;
            timerEl.textContent = "Time: 0s";
            feedbackEl.textContent = `Time's up! You crafted ${score} item${score === 1 ? "" : "s"}.`;
            outputEl.onclick = null;
            outputEl.classList.remove("ready");
            window.location.href = "Message.html";
        }

        renderPalette();
        renderGrid();
        nextRecipe();
        checkRecipe();

        timer = setInterval(() => {
            if (!active) {
                clearInterval(timer);
                return;
            }
            timeLeft -= 1;
            timerEl.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                endGame();
                clearInterval(timer);
            }
        }, 1000);

        if (minecraftContinueButton) {
            minecraftContinueButton.addEventListener("click", () => {
                if (!hasWon) return;
                window.location.href = "Q6-Rhythm.html";
            });
        }
