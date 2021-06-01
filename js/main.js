const modal = {
    open() {
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

// const transaction = [ {    
//         description: 'Luz',
//         amount: -50000,
//         date: '17/05/2021',
//      },
//     {
//         description: 'Internet',
//         amount: -20000,
//         date: '17/05/2021',

//     },
//     {
//         description: 'Criação WebSite',
//         amount: 500000,
//         date: '17/05/2021',

//     }]

const storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transaction){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction))
    }
}

const Transaction = { 
    all: storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)
        APP.reload()
    },
    remove(index){
        Transaction.all.splice(index, 1)
        APP.reload()
    }, 
    incomes() { // somar entradas
        let income = 0
        Transaction.all.forEach(trans => {
            if(trans.amount > 0){
                income += trans.amount
            }
        })
        return income
    },
    expenses() { // somar as saídas
        let expense = 0
        Transaction.all.forEach(trans => {
            if(trans.amount < 0){
                expense += trans.amount
            }
        })
        return expense;

    },
    total() { // Entradas(incomes) - saídas(expenses)
        return Transaction.incomes() + Transaction.expenses()
        

    },


}

const utils = {
    formatDate(date) {
        const fDate = date.split("-")
        return `${fDate[2]}/${fDate[1]}/${fDate[0]}`
    },
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100
        return value
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        })
        return signal + value
   }
}

const DOM = {
    transContent: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const table = document.querySelector('#data-table')
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transContent.appendChild(tr)

    },
    innerHTMLTransaction(transaction, index) {
        const amount = utils.formatCurrency(transaction.amount)
        const CSSClass = transaction.amount > 0 ? "income" : "expense"
        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSClass}">R$${amount}</td>
        <td class="date">${transaction.date}</td>
        <td><img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="remove transactions"></td>
        `
        return html
    },
    updateBalance() {
        document.querySelector('#incomeDisplay')
        .innerHTML = utils.formatCurrency(Transaction.incomes())
        document.querySelector('#expenseDisplay')
        .innerHTML = utils.formatCurrency(Transaction.expenses())
        document.querySelector('#totalDisplay')
        .innerHTML = utils.formatCurrency(Transaction.total())
    },
    clearTransaction() {
        DOM.transContent.innerHTML = ''
    }
}


const form = {
    description: document.querySelector('input#description'), // LINKANDO O JS COM O HTML
    date: document.querySelector('input#date'),
    amount: document.querySelector('input#amount'),

    getValues() {
        return {
            description: form.description.value,
            amount: form.amount.value,
            date: form.date.value
        }
    },
    validateFiels(){
        const {description, amount, date} = form.getValues()

        if(description.trim() === "" ||
        amount.trim() === "" ||
        date.trim() === "") {
            throw new Error('Por favor, preencha todos os campos!')
        }
    },    
    
    formatValues(){
        let {description, amount, date} = form.getValues()
        amount = utils.formatAmount(amount)
        date = utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },
    clearFields() {
        form.description.value = ""
        form.amount.value = ""
        form.date.value = ""
    },
    submit(event) {
        event.preventDefault()
        try {
            form.validateFiels()
            const transaction = form.formatValues()
            Transaction.add(transaction)
            form.clearFields()
            modal.close()

        }
        catch (error) {
            alert(error.message)
        }

        // verificar se todas as info foram digitadas
        //formatar os dados para salvar
        
        //apagar os dados do formulário
        //atualizar a aplicação
        // modal feche
        //salvar
    }
}


const APP = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        storage.set(Transaction.all)

    },
    reload(){
        DOM.clearTransaction()
        APP.init()
    }

}

APP.init()
