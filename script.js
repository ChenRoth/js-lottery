const HIGHEST_LOTTERY_NUMBER = 20;

// the # of numbers in a ticket
const NUMBERS_PER_TICKET = 4;

// the max # of tickets per game
const MAX_LOTTERY_TICKETS = 5;

// a constant map of all the static elements in the page
const ELEMENTS = {
    LOTTERY_FORM: document.querySelector('#lottery-form'),
    TICKETS: document.querySelector('.tickets'),
    LOTTERY_NUMBERS: document.querySelector('.lottery-numbers'),
    ADD_TICKET_BTN: document.querySelector('.add-ticket-btn'),
    PLAY_BTN: document.querySelector('.play-btn'),
    TOTAL_PRIZE: document.querySelector('.total-prize'),
    RESULTS: document.querySelector('.results'),
    RESTART_BTN: document.querySelector('.restart-btn'),
}

// this object maps the number of correct guesses (key) to the awarded prize (value)
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
    initLotteryForm();
    restart();
}

// restart the game
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

    [ELEMENTS.TICKETS, ELEMENTS.TOTAL_PRIZE, ELEMENTS.LOTTERY_NUMBERS, ELEMENTS.RESULTS].forEach(el => {
        el.innerHTML = '';
    });

    // re-enable the buttons after a game is over
    ELEMENTS.ADD_TICKET_BTN.disabled = false;
    ELEMENTS.PLAY_BTN.disabled = false;
}

function initLotteryForm() {
    ELEMENTS.ADD_TICKET_BTN.addEventListener('click', addLotteryTicket);
    ELEMENTS.LOTTERY_FORM.addEventListener('submit', onSubmitLotteryForm);
    ELEMENTS.RESTART_BTN.addEventListener('click', restart);
}

/* validate a ticket (check dupe numbers)
   returns a string error if there is one
   else returns null
*/
function validateTicket(ticket) {
    const numbers = [];
    let validationError = null;
    ticket.forEach(number => {
        if (numbers.includes(number)) {
            validationError = `duplicate number (${number})`;
            isTicketValid = false;
        } else {
            numbers.push(number);
        }
    });

    return validationError;
}

function onSubmitLotteryForm(e) {
    e.preventDefault();
    // note that querySelectorAll doesn't return a *true* array - the returned value doesn't have all of the array methods!
    const guesses = e.target.querySelectorAll('input');
    const tickets = [];
    guesses.forEach((guess, i) => {
        const ticketIndex = Math.floor(i / NUMBERS_PER_TICKET);
        if (!tickets[ticketIndex]) {
            tickets[ticketIndex] = [];
        }
        const number = Number(guess.value);
        tickets[ticketIndex].push(number);
    });

    const validationErrors = tickets.map(validateTicket);
    let isFormValid = true;
    validationErrors.forEach((error, i) => {
        if (!error) {
            return;
        }

        alert(`Ticket ${i + 1}: ${error}`);
        isFormValid = false;
    })

    if (!isFormValid) {
        return;
    }

    state.tickets = tickets;

    generateLotteryNumbers();
    renderLotteryResults();
    // disable add/play buttons when the game is over
    ELEMENTS.PLAY_BTN.disabled = true;
    ELEMENTS.ADD_TICKET_BTN.disabled = true;
}

function renderLotteryResults() {
    renderLotteryNumbers();
    renderCorrectGuesses();
    renderTotalPrize();
}

function renderTotalPrize() {
    const totalPrize = calculateTotalPrize();
    ELEMENTS.TOTAL_PRIZE.innerHTML = `You won ${totalPrize} ₪!`;
}

function renderLotteryNumbers() {
    const colors = [
        'bg-danger',
        'bg-primary',
        'bg-warning',
        'bg-success'
    ]
    ELEMENTS.LOTTERY_NUMBERS.innerHTML = `The Lottery Numbers are `;
    state.lotteryNumbers.forEach((n, i) => {
        const el = document.createElement('span');
        // if there are more lottery numbers than colors, re-cycle the color pick
        const color = colors[i % colors.length];
        el.classList.add('badge', 'rounded-pill', 'me-2', color);
        el.innerHTML = n;
        ELEMENTS.LOTTERY_NUMBERS.appendChild(el);
    });
}

function renderCorrectGuesses() {
    state.tickets.forEach((ticket, i) => {
        const correctGuesses = filterCorrectGuesses(ticket);
        if (!correctGuesses.length) {
            return;
        }

        const resultEl = document.createElement('div');
        resultEl.innerHTML = `Ticket ${i + 1} winning numbers: ${correctGuesses.join(', ')}`;
        ELEMENTS.RESULTS.appendChild(resultEl);
    })
}

function filterCorrectGuesses(ticket) {
    return ticket.filter(number => state.lotteryNumbers.includes(number));
}

function calculateTicketPrize(ticket) {
    const numOfCorrectGuesses = filterCorrectGuesses(ticket).length;
    return prizeByNumberOfGuesses[numOfCorrectGuesses];
}

function calculateTotalPrize() {
    return state.tickets.reduce((prize, ticket) => prize + calculateTicketPrize(ticket), 0);
}

function addLotteryTicket() {
    if (state.tickets.length === MAX_LOTTERY_TICKETS) {
        return;
    }
    state.tickets.push([]);
    if (state.tickets.length === MAX_LOTTERY_TICKETS) {
        ELEMENTS.ADD_TICKET_BTN.disabled = true;
    }

    ELEMENTS.TICKETS.appendChild(createLotteryTicketEl(state.tickets.length));
}

function createLotteryTicketEl(ticketNumber) {
    const ticketEl = document.createElement('div');
    ticketEl.classList.add('row', 'bg-warning', 'rounded', 'my-4', 'pt-1', 'pb-3');
    ticketEl.innerHTML = `<label class="form-label">Ticket ${ticketNumber}</label>`

    // create the required number of inputs dynamically
    // this is a way to do a for-loop using only array methods
    // but it's also ok to use a for-loop if you want to
    forLoop(NUMBERS_PER_TICKET).forEach((_, i) => {
        const inputEl = createLotteryTicketInput(i + 1);
        ticketEl.appendChild(inputEl);
    });

    return ticketEl;
}

function createLotteryTicketInput(guessNumber) {
    const inputEl = document.createElement('div');
    inputEl.classList.add('col');
    inputEl.innerHTML = `  
    <input placeholder="Guess #${guessNumber}" required class="form-control" type="number" min="1" max="${HIGHEST_LOTTERY_NUMBER}" />
    `
    return inputEl;
}


function generateLotteryNumbers() {
    state.lotteryNumbers = [];
    // generate lottery numbers until we have <NUMBERS_PER_TICKET> *unique* numbers
    while (state.lotteryNumbers.length < NUMBERS_PER_TICKET) {
        const number = generateRandomInteger(HIGHEST_LOTTERY_NUMBER);
        if (!state.lotteryNumbers.includes(number)) {
            state.lotteryNumbers.push(number);
        }
    }
}

/* create an array of n undefined values
   we can use this array's forEach as a substitute for a for-loop
*/
function forLoop(n) {
    return Array.from(Array(n));
}

function generateRandomInteger(max) {
    return Math.floor(Math.random() * max) + 1;
}