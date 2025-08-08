// Calculator functionality
document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('calculatorForm');
    
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                token: getToken(),
                num1: document.getElementById('num1').value,
                num2: document.getElementById('num2').value,
                operation: document.getElementById('operation').value
            };
            
            try {
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Store result for result page
                    localStorage.setItem('lastCalculation', JSON.stringify({
                        num1: formData.num1,
                        num2: formData.num2,
                        operation: formData.operation,
                        result: data.result
                    }));
                    
                    window.location.href = '/result';
                } else {
                    showMessage(data.message);
                }
            } catch (error) {
                showMessage('Calculation failed. Please try again.');
            }
        });
    }
    
    // Display result on result page
    const resultContainer = document.getElementById('resultContainer');
    if (resultContainer) {
        const lastCalc = JSON.parse(localStorage.getItem('lastCalculation') || '{}');
        
        if (lastCalc.result !== undefined) {
            const operationSymbol = {
                'add': '+',
                'subtract': '-',
                'multiply': '×',
                'divide': '÷'
            };
            
            resultContainer.innerHTML = `
                <h3>Calculation Result</h3>
                <div class="calculation">${lastCalc.num1} ${operationSymbol[lastCalc.operation]} ${lastCalc.num2}</div>
                <div class="answer">${lastCalc.result}</div>
            `;
        } else {
            resultContainer.innerHTML = '<p>No calculation found. Please perform a calculation first.</p>';
        }
    }
});