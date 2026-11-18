      
      
      
      const textBoxes = document.querySelectorAll('input[type="text"], input[type="email"]');
        const contractCheckbox = document.getElementById('contract');
        const continueButton = document.getElementById('continue-button');

        function updateButtonState() {
            const everyTextBoxHasInformation = [...textBoxes].every((textBox) => textBox.value.trim() !== '');
            continueButton.disabled = !(contractCheckbox.checked && everyTextBoxHasInformation);
        }

        textBoxes.forEach((textBox) => textBox.addEventListener('input', updateButtonState));
        contractCheckbox.addEventListener('change', updateButtonState);