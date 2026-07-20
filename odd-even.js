const userSpan = document.getElementById('userCoins');
const compSpan = document.getElementById('compCoins');
const pickedSpan = document.getElementById('pickedNumber');
const msg = document.getElementById('message');
const oddBtn = document.getElementById('oddBtn');
const evenBtn = document.getElementById('evenBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');

let userCoins = 10;
let compCoins = 10;
let totalCoins = userCoins + compCoins;
let currentPick = null;
// 'computer' or 'user'
let currentPicker = 'computer';

const pickerSpan = document.getElementById('picker');
const guessControls = document.getElementById('guessControls');
const userPickControls = document.getElementById('userPickControls');
const pickInput = document.getElementById('pickInput');
const pickBtn = document.getElementById('pickBtn');

function setCoinsDisplay() {
	userSpan.textContent = userCoins;
	compSpan.textContent = compCoins;
}

function disableGuesses(v=true) {
	oddBtn.disabled = v;
	evenBtn.disabled = v;
}

function showUserPickControls(show) {
	userPickControls.style.display = show ? 'block' : 'none';
	guessControls.style.display = show ? 'none' : 'block';
}

function updatePickerDisplay() {
	pickerSpan.textContent = currentPicker === 'computer' ? 'Computer' : 'You';
}

function endIfOver() {
	// win if a player holds all coins (totalCoins), lose if a player reaches 0
	totalCoins = userCoins + compCoins;
	if (userCoins === totalCoins) {
		msg.textContent = `You win! You collected all ${totalCoins} coins.`;
		disableGuesses(true);
		nextBtn.disabled = true;
		if (typeof pickBtn !== 'undefined') pickBtn.disabled = true;
		return true;
	}
	if (compCoins === totalCoins) {
		msg.textContent = `Computer wins! It collected all ${totalCoins} coins.`;
		disableGuesses(true);
		nextBtn.disabled = true;
		if (typeof pickBtn !== 'undefined') pickBtn.disabled = true;
		return true;
	}
	if (userCoins <= 0) {
		msg.textContent = 'Game over: you have 0 coins.';
		disableGuesses(true);
		nextBtn.disabled = true;
		if (typeof pickBtn !== 'undefined') pickBtn.disabled = true;
		return true;
	}
	if (compCoins <= 0) {
		msg.textContent = 'Game over: computer has 0 coins.';
		disableGuesses(true);
		nextBtn.disabled = true;
		if (typeof pickBtn !== 'undefined') pickBtn.disabled = true;
		return true;
	}
	return false;
}

function computerPick() {
	if (compCoins <= 0) {
		msg.textContent = 'Computer has no coins to pick.';
		return;
	}
	currentPicker = 'computer';
	updatePickerDisplay();
	showUserPickControls(false);
	// pick between 1 and compCoins (can't pick more than available)
	const maxPick = compCoins;
	currentPick = Math.floor(Math.random()*maxPick) + 1;
	msg.textContent = 'Computer picked a number. Make your guess: odd or even.';
	disableGuesses(false);
	nextBtn.disabled = true;
}

function transferCoins(from, to, amount) {
	const actual = Math.min(amount, from.value);
	from.value -= actual;
	to.value += actual;
	return actual;
}

function handleGuess(isOdd) {
	if (currentPick === null) return;
	const actualIsOdd = (currentPick % 2) === 1;
	if (isOdd === actualIsOdd) {
		// user guessed correctly: transfer from computer to user
		const transfer = Math.min(currentPick, compCoins);
		compCoins -= transfer;
		userCoins += transfer;
		msg.textContent = `Correct! ${transfer} coins transferred to you. Number was ${currentPick}.`;
		// switch turn: user becomes picker
		currentPicker = 'user';
		updatePickerDisplay();
		showUserPickControls(true);
		// prepare pick input: max is the number of coins the user currently has
		pickInput.max = userCoins;
		pickInput.min = 1;
		pickInput.value = Math.max(1, Math.min(parseInt(pickInput.value || '1', 10), pickInput.max || 1));
		pickBtn.disabled = (userCoins <= 0);
	} else {
		// wrong: transfer from user to computer
		const transfer = Math.min(currentPick, userCoins);
		userCoins -= transfer;
		compCoins += transfer;
		msg.textContent = `Wrong! ${transfer} coins deducted from you. Number was ${currentPick}.`;
	}
	pickedSpan.textContent = currentPick;
	currentPick = null;
	setCoinsDisplay();
	disableGuesses(true);
	nextBtn.disabled = endIfOver();
}

// user picks a number when it's their turn; computer will guess randomly
pickBtn.addEventListener('click', () => {
	if (currentPicker !== 'user') return;
	const maxPick = userCoins;
	let pick = parseInt(pickInput.value, 10);
	if (!pick || pick < 1) pick = 1;
	if (pick > maxPick) pick = maxPick;
	currentPick = pick;
	msg.textContent = 'You picked a number. Computer is guessing...';
	showUserPickControls(false);
	// computer guesses randomly
	const compGuessesOdd = Math.random() < 0.5;
	const actualIsOdd = (currentPick % 2) === 1;
	setTimeout(() => {
		if (compGuessesOdd === actualIsOdd) {
			// computer guessed correctly: transfer from user to computer
			const transfer = Math.min(currentPick, userCoins);
			userCoins -= transfer;
			compCoins += transfer;
			msg.textContent = `Computer guessed ${compGuessesOdd ? 'Odd' : 'Even'} and was correct. ${transfer} coins transferred to computer. Number was ${currentPick}.`;
			pickedSpan.textContent = currentPick;
			currentPick = null;
			// computer guessed correctly, so computer becomes picker
			currentPicker = 'computer';
			updatePickerDisplay();
			setCoinsDisplay();
			nextBtn.disabled = endIfOver();
		} else {
			// computer guessed wrong: transfer from computer to user
			const transfer = Math.min(currentPick, compCoins);
			compCoins -= transfer;
			userCoins += transfer;
			msg.textContent = `Computer guessed ${compGuessesOdd ? 'Odd' : 'Even'} and was wrong. ${transfer} coins transferred to you. Pick another number!`;
			pickedSpan.textContent = currentPick;
			currentPick = null;
			// user stays as picker and picks again
			setCoinsDisplay();
			showUserPickControls(true);
			pickInput.max = userCoins;
			pickInput.min = 1;
			pickInput.value = Math.max(1, Math.min(parseInt(pickInput.value || '1', 10), pickInput.max || 1));
			pickBtn.disabled = (userCoins <= 0);
			endIfOver();
		}
	}, 600);
});

// keep pick input max in sync when balances change
const origSetCoinsDisplay = setCoinsDisplay;
setCoinsDisplay = function() {
	origSetCoinsDisplay();
	if (currentPicker === 'user') {
		pickInput.max = userCoins;
		pickBtn.disabled = (userCoins <= 0);
		if (pickInput.value > pickInput.max) pickInput.value = pickInput.max;
	}
};

oddBtn.addEventListener('click', () => handleGuess(true));
evenBtn.addEventListener('click', () => handleGuess(false));
nextBtn.addEventListener('click', () => computerPick());
resetBtn.addEventListener('click', () => {
	// prompt user for total coins to distribute equally after reset
	let total = null;
	while (true) {
		const ans = prompt('Enter total coins to distribute equally between players (even positive integer), or Cancel to use 20:', '20');
		if (ans === null) {
			total = 20; // default 10/10
			break;
		}
		const n = parseInt(ans, 10);
		if (!Number.isFinite(n) || n <= 0) {
			alert('Please enter a positive integer.');
			continue;
		}
		if (n % 2 !== 0) {
			alert('Please enter an even number so it can be split equally.');
			continue;
		}
		total = n;
		break;
	}
	userCoins = total/2;
	compCoins = total/2;
	currentPick = null;
	setCoinsDisplay();
	msg.textContent = `Reset: both players have ${userCoins} coins.`;
	nextBtn.disabled = false;
	disableGuesses(true);
});

// initialize
setCoinsDisplay();
disableGuesses(true);
msg.textContent = 'Click "Next Round" for the computer to pick a number.';
nextBtn.disabled = false;
