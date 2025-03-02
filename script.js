
const initialBalanceInput = document.getElementById("initialBalanceInput");
const setInitialBalanceBtn = document.getElementById("setInitialBalanceBtn");
const transactionForm = document.getElementById("transactionsForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const transactionsBody = document.getElementById("transactionsBody");
const balanceDisplay = document.getElementById("totalBalance");
const currencySelect = document.getElementById("currency");
const convertCurrencyBtn = document.getElementById("convertCurrency");
const convertedBalanceDisplay = document.getElementById("convertedBalance");

let transactions = JSON.parse(localStorage.getItem("transactions")) || []; //localstorage only stored in string thus converting it to array, if nun in local storage then empty array
let initialBalance = parseFloat(localStorage.getItem("initialBalance")) || 0; //converts to number if no initial balance then 0


setInitialBalanceBtn.addEventListener("click", function () {
    let balance = parseFloat(initialBalanceInput.value); //input to number
    if (isNaN(balance)) {
        alert("Please enter a valid initial balance!");
        return; 
    }
    initialBalance = balance;
    localStorage.setItem("initialBalance", balance); // stores it to localstorage and updates ui
    updateUI();
});


transactionForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let description = descriptionInput.value.trim();
    let amount = parseFloat(amountInput.value);
    let category = categoryInput.value;
    let transactionType = document.getElementById("transactionType").value;

    if (!description || isNaN(amount)) {
        alert("Enter valid transaction details!");
        return;
    }
if (transactionType === "expense"){
    amount =- amount; //if expense it cuts it out from the balance by making it negative
} else {
    amount =+ amount; // just positive , added to balance
}
    
    

    let transaction = {
        id: Date.now(), //unique identifier for each transaction  
        description,
        amount,
        category
    };

    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions)); // add to transactions array

    transactionForm.reset();
    updateUI(); 
});


function updateUI() {
    transactionsBody.innerHTML = "";
    let total = initialBalance;

    transactions.forEach((txn) => {
        total += txn.amount; //looping through transactions and adding them total

        let row = document.createElement("tr");
        row.innerHTML = `
            <td class="border p-2 text-gray-900">${txn.description}</td>
            <td class="border p-2 text-gray-900">${txn.amount.toFixed(2)}</td>
            <td class="border p-2 text-gray-900">${txn.category}</td>
            <td class="border p-2">
                <button onClick="deleteTransaction(${txn.id})" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </td>
        `;
        transactionsBody.appendChild(row);
    });

    balanceDisplay.textContent = `Kshs ${total.toFixed(2)}`;
    updateChart();
}


function deleteTransaction(id) {
    transactions = transactions.filter(txn => txn.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateUI();
}


async function convertCurrency() {
    const apiKey = "3187c8d0d1b99d4eda49cc2a";
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/KES`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        let exchangeRate = data.conversion_rates[currencySelect.value];
        let convertedAmount = initialBalance * exchangeRate;
        convertedBalanceDisplay.textContent = `${currencySelect.value} ${convertedAmount.toFixed(2)}`;
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        convertedBalanceDisplay.textContent = "Error fetching rate!";
    }
}

convertCurrencyBtn.addEventListener("click", convertCurrency);


let expenseChart;
function updateChart() {
    let categories = {};
    transactions.forEach(txn => {
        categories[txn.category] = (categories[txn.category] || 0) + txn.amount;
    });

    let ctx = document.getElementById("expenseChart").getContext("2d");
    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"]
            }]
        }, 
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


document.addEventListener("DOMContentLoaded", updateUI);
