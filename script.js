/*RECORDS PAGE*/
let entryType = "income";
const incomeCats = ["Salary", "Business"];
const expenseCats = ["Food", "Rent", "Bills", "Medical", "Shopping","Internet","Transport","Others"];

document.addEventListener("DOMContentLoaded", () => {
    setMode('income'); // Set default mode
    renderTable();
    
    document.getElementById("entryForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const transactions = JSON.parse(localStorage.getItem("moneyControl_data")) || [];
        
        const newEntry = {
            date: document.getElementById("date").value,
            type: entryType,
            category: document.getElementById("category").value,
            desc: document.getElementById("desc").value || "-",
            amount: parseFloat(document.getElementById("amount").value)
        };

        transactions.push(newEntry);
        localStorage.setItem("moneyControl_data", JSON.stringify(transactions)); // Save to bridge
        e.target.reset();
        renderTable();
    });
});

function setMode(mode) {
    entryType = mode;
    const catSelect = document.getElementById("category");
    const list = mode === 'income' ? incomeCats : expenseCats;
    catSelect.innerHTML = list.map(c => `<option value="${c}">${c}</option>`).join('');
    document.getElementById("incomeBtn").className = mode === 'income' ? 'active' : '';
    document.getElementById("expenseBtn").className = mode === 'expense' ? 'active' : '';
}

function renderTable() {
    const data = JSON.parse(localStorage.getItem("moneyControl_data")) || [];
    const tbody = document.getElementById("entries");
    tbody.innerHTML = data.reverse().map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.type.toUpperCase()}</td>
            <td>${item.category}</td>
            <td>${item.desc}</td>
            <td style="color: ${item.type === 'income' ? 'green' : 'red'}">₹${item.amount.toLocaleString()}</td>
        </tr>
    `).join('');
}

function clearAllData() {
    if(confirm("Clear all records?")) {
        localStorage.removeItem("moneyControl_data");
        transactions=[];
        renderTable();
    }
}
/* REPORTS PAGE*/
document.addEventListener("DOMContentLoaded", () => {
    const data = JSON.parse(localStorage.getItem("moneyControl_data")) || [];
    let inc = 0, exp = 0, catMap = {};

    data.forEach(item => {
        if (item.type === "income") inc += item.amount;
        else {
            exp += item.amount;
            catMap[item.category] = (catMap[item.category] || 0) + item.amount;
        }
    });

    const savings = inc - exp;
    const rate = inc > 0 ? ((savings / inc) * 100).toFixed(1) : 0;
    document.getElementById("totalIncome").textContent = `₹${inc.toLocaleString()}`;
    document.getElementById("totalExpense").textContent = `₹${exp.toLocaleString()}`;
    document.getElementById("totalSavings").textContent = `₹${savings.toLocaleString()}`;
    document.getElementById("savingsRate").textContent = `${rate}%`;

const now = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dateString = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;


document.getElementById("currentDateDisplay").textContent = dateString;
    
    const ctx = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(catMap),
            datasets: [{ data: Object.values(catMap), backgroundColor: ['#4A148C', '#311B92', '#5E35B1', '#1E88E5', 
                '#7E57C2', '#42A5F5', '#B39DDB', '#81D4FA'] }]
        }
    });

    // Right Side Legend
    document.getElementById("categoryList").innerHTML = Object.entries(catMap)
        .map(([cat, val]) => `<li><span>${cat}</span>: <strong>₹${val}</strong></li>`).join('');

    // Smart Suggestions
    // --- Smart Suggestions Logic ---
const sBox = document.getElementById("suggestionBox");
let suggestions = [];

// 1. Savings Rate Suggestion
if (rate < 20) {
    suggestions.push(`Low Savings Rate (${rate}%): Try the 50/30/20 rule—aim to save at least 20% of your income.`);
} else {
    suggestions.push(`Great Savings Rate (${rate}%): You are hitting your targets! Consider moving surplus to a high-yield investment.`);
}

// 2. Overspending Suggestion
if (exp > inc) {
    suggestions.push("Critical Overspending: Your expenses exceed your income. Review your 'Bills' and 'Shopping' immediately.");
}

// 3. Category Specific (Food/Shopping)
if (catMap["Food"] > (inc * 0.15)) {
    suggestions.push(`High Food Expense: You're spending over 15% of income on food. Meal prepping could save you ₹${(catMap["Food"] * 0.2).toFixed(0)} next month.`);
}

// 4. General Savings Tip
if (savings > 0 && inc > 0) {
    suggestions.push("Emergency Fund: You have a surplus! Ensure you have 3-6 months of expenses saved in an emergency fund.");
}

// Render Suggestions with Bulb Icon
sBox.innerHTML = suggestions.map(text => `
    <div class="suggestion-item">
        <span class="bulb-icon">💡</span>
        <p>${text}</p>
    </div>
`).join('');
});