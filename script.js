const LOTTERY_RANGE = 20;
const REQUIRED_NUMBERS_COUNT = 4;
const MAX_LOTTERY_TICKETS = 5;
const ELEMENTS = {
    LOTTERY_FORM: document.querySelector('#lottery-form'),
    TICKETS: document.querySelector('.tickets'),
    ADD_TICKET_BTN: document.querySelector('.add-ticket-btn'),
}

const prizeByNumberOfGuesses = {
    0: 0,
    1: 10,
    2: 40,
    3: 100,
    4: 1000,
}

const state = {}

main();

function main() {
    restart();
    initLotteryForm();
    document.querySelector('.restart-btn').addEventListener('click', restart);
}

function restart() {
    resetState();
    resetView();
    addLotteryTicket();
}

function resetState() {
    state.tickets = [];
    state.lotteryNumbers = [];
}

function resetView() {
    ['.tickets', '.total-prize', '.results'].forEach(selector => {
        document.querySelector(selector).innerHTML = '';
    });

    ELEMENTS.ADD_TICKET_BTN.disabled = false;
}

function initLotteryForm() {
    ELEMENTS.ADD_TICKET_BTN.addEventListener('click', addLotteryTicket);
    ELEMENTS.LOTTERY_FORM.addEventListener('submit', onSubmitLotteryForm);
}

function onSubmitLotteryForm(e) {
    e.preventDefault();
    const { tickets } = state;
    const guesses = e.target.querySelectorAll('input');

    let isFormValid = true;
    guesses.forEach((guess, i) => {
        const ticketIndex = Math.floor(i / REQUIRED_NUMBERS_COUNT);
        if (!tickets[ticketIndex]) {
            tickets[ticketIndex] = [];
        }

        const ticket = tickets[ticketIndex];
        const number = Number(guess.value);

        if (ticket.includes(number)) {
            alert(`ticket ${ticketIndex + 1} has duplicate ${number}`);
            isFormValid = false;
            tickets[ticketIndex] = [];
            return;
        }
        ticket.push(number);
    });

    if (!isFormValid) {
        return;
    }
    play();

    postLotteryResults();
}

function postLotteryResults() {
    postLotteryNumbers();
    postCorrectGuesses();
    postTotalPrize();
}

function calculateTicketPrize(ticket) {
    const numOfCorrectGuesses = extractCorrectGuesses(ticket).length;
    return prizeByNumberOfGuesses[numOfCorrectGuesses];
}

function calculateTotalPrize() {
    return state.tickets.reduce((prize, ticket) => prize + calculateTicketPrize(ticket), 0);
}

function postTotalPrize() {
    const totalPrize = calculateTotalPrize();
    document.querySelector('.total-prize').innerHTML = `You won ${totalPrize} ₪!`;
}

function postLotteryNumbers() {
    document.querySelector('.lottery-numbers').innerHTML = `The Lottery Numbers are ${state.lotteryNumbers.join(', ')}`;
}

function extractCorrectGuesses(ticket) {
    return ticket.filter(number => state.lotteryNumbers.includes(number));
}

function postCorrectGuesses() {
    state.tickets.forEach((ticket, i) => {
        const correctGuesses = extractCorrectGuesses(ticket);
        if (!correctGuesses.length) {
            return;
        }

        const resultEl = document.createElement('div');
        resultEl.innerHTML = `Ticket ${i + 1} correct guesses: ${correctGuesses.join(', ')}`;
        document.querySelector('.results').appendChild(resultEl);
    })
}

function addLotteryTicket() {
    if (state.tickets.length === MAX_LOTTERY_TICKETS) {
        return;
    }
    state.tickets.push([]);
    if (state.tickets.length === MAX_LOTTERY_TICKETS) {
        ELEMENTS.ADD_TICKET_BTN.disabled = true;
    }

    ELEMENTS.TICKETS.appendChild(createLotteryTicket(state.tickets.length));
}

function createLotteryTicket(ticketNumber) {
    const ticketEl = document.createElement('div');
    ticketEl.classList.add('row', 'bg-warning', 'rounded', 'my-4', 'pt-1', 'pb-3');
    ticketEl.innerHTML = `<label class="form-label">Ticket ${ticketNumber}</label>`
    Array.from(Array(REQUIRED_NUMBERS_COUNT)).forEach((_, i) => {
        const inputEl = createLotteryTicketGuess(i + 1);
        ticketEl.appendChild(inputEl);
    });

    return ticketEl;
}

function createLotteryTicketGuess(guessNumber) {
    const inputEl = document.createElement('div');
    inputEl.classList.add('col');
    inputEl.innerHTML = `  
    <input placeholder="Guess #${guessNumber}" required class="form-control" type="number" min="1" max="${LOTTERY_RANGE}" />
    `
    return inputEl;
}


function play() {
    state.lotteryNumbers = [];
    while (state.lotteryNumbers.length < REQUIRED_NUMBERS_COUNT) {
        const number = drawRandomNumber();
        if (!state.lotteryNumbers.includes(number)) {
            state.lotteryNumbers.push(number);
        }
    }
}

function drawRandomNumber() {
    return Math.floor(Math.random() * LOTTERY_RANGE) + 1;
}