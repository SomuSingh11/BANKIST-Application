"use strict";

/////////////// Hard Coded Data for Bankis Application ///////////////
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-01-18T21:31:17.178Z',
    '2024-02-23T07:42:02.383Z',
    '2024-03-28T09:15:04.904Z',
    '2024-04-01T10:17:24.185Z',
    '2024-05-08T14:11:59.604Z',
    '2024-05-12T17:01:17.194Z',
    '2024-05-15T19:36:17.929Z',
    '2024-05-19T10:51:36.790Z'
  ],
  currency: 'EUR',
  locale: 'pt-PT', 
};

const account2 = {
  owner: 'Somu Singh',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2024-02-01T13:15:33.035Z',
    '2024-03-30T09:48:16.867Z',
    '2024-03-25T06:04:23.907Z',
    '2024-04-01T14:18:46.235Z',
    '2024-04-05T16:33:06.386Z',
    '2024-05-11T14:43:26.374Z',
    '2024-05-18T18:49:59.371Z',
    '2024-05-19T12:01:20.894Z'
  ],
  currency: 'INR',
  locale: 'en-IN',
};

const accounts = [account1, account2];


/////////////// Selecting Elements for DOM Manipulation ///////////////
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");



/////////////// Helper Functions for Internationalising Numbers and Dates ///////////////


// formatMovementsDate function : responsible for internationalizing the Dates of transaction
const formatMovementsDate = function(date, locale){
    const calcDaysPassed = (day1, day2)=>Math.round(Math.abs(day2-day1)/(1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return "Today";
    if (daysPassed === 1) return "Yesterday";
    if (daysPassed <= 7) return `${daysPassed} days ago` ;
    else {
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      const formattedDate = new Intl.DateTimeFormat(locale, options).format(date);
      return `${formattedDate}`;
    }
}


// formattedCurrency function : responsible for internationalizing the currency :
const formattedCurrency = function(acc, number){
    const options = {
      style : "currency",
      currency : acc.currency,
    }
    return new Intl.NumberFormat(acc.locale,options).format(number);
}





/////////////// Helper Functions for setting up Timer and safety feature  ///////////////

const startLogoutTimer = function() {

    let time = 300; // Initialising the intitial time

    const tick = function(){
        const min = `${Math.floor(time/60)}`.padStart(2,0);
        const sec = `${time % 60}`.padStart(2,0);

        // Printing timer to UI
        labelTimer.textContent = `${min}:${sec}`;

        //Condition for timer to stop
        if(time === 0){
          clearInterval(timer);
          labelWelcome.textContent = `Login to set Started`;
          containerApp.style.opacity = 0;
        }

        //updating value of time
        time--;
    }

    tick();
    const timer = setInterval(tick,1000);
    return timer;
}



/////////////// Helper Functions for setting up the BANKIST UI  ///////////////


// createUsernames function : responsible for creating Usernames for the given Account
const createUsernames = function (ArrayOfObjects) {
  ArrayOfObjects.forEach(function (IndividualObject) {
    IndividualObject.username = IndividualObject.owner
      .toLowerCase()
      .split(" ")
      .map(word => word[0])
      .join("");
  });
};
createUsernames(accounts);  // Username for all the accounts are created .


// Helper function to update the complete UI for BANKIST
const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplaySummary(acc);
};


// displayMovements function : responsible for displaying movements of amount inside the ".containerMovements"
const displayMovements = function (acc, sort = false) {

  containerMovements.innerHTML = "";

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const now = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(now, acc.locale);

    const displayValue = formattedCurrency(acc, mov); 

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${displayValue}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};


// calcDisplaySummary : evaluates income, out and interest based on movements array of each account and displays it on website.
const calcDisplaySummary = function (acc) {

    //IN
      const income = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, curr) => acc + curr, 0);

      const displayIncome = formattedCurrency(acc,income);
      labelSumIn.textContent = `${displayIncome}`;

    //OUT
      const out = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, curr) => acc + curr, 0);

      const displayOut = formattedCurrency(acc,Math.abs(out));
      labelSumOut.textContent = `${displayOut}`;

    //INTEREST
      const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate) / 100)
        .filter((int, i, arr) => {
          return int >= 1;
        })
        .reduce((acc, curr) => acc + curr, 0);

      const displayInterest = formattedCurrency(acc,interest);
      labelSumInterest.textContent = `${displayInterest}`;

    // Display Net Balance
     const netBalance = acc.movements 
      .reduce((accu,mov) => accu + mov , 0);
      acc.balance = netBalance;

    const displayNetBalance = formattedCurrency(acc,netBalance);
    labelBalance.textContent = `${displayNetBalance}`;
};








/////////////// Event Handlers for BANKIST Application ///////////////


let CurrentAccount,timer; //global variables


// event handler for implementing login
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  CurrentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (CurrentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI nad Message
    labelWelcome.textContent = `Welcome back, ${
      CurrentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;
    inputLoginUsername.value = "";
    inputLoginPin.value = "";
    inputLoginPin.blur();

    //Displaying the time on Dashboard
    const now = new Date();
    const options = {
      hour : "numeric",
      minute : "numeric",
      day : "numeric",
      month : "long",
      year : "numeric",
    };
    const formatedDate = new Intl.DateTimeFormat(CurrentAccount.locale,options).format(now);
    labelDate.textContent = formatedDate;

    //starting the timer and check if another timer exists
    if(timer) clearInterval(timer);
    timer = startLogoutTimer();

    //Update the UI
    updateUI(CurrentAccount);
  }
});


// Event handler for transferring funds to other User accounts.
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);

  const recieverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferTo.value = "";
  inputTransferAmount.value = "";

  if (amount > 0 && recieverAcc && CurrentAccount.balance >= amount && recieverAcc.username !== CurrentAccount.username) {
    //Doint the transfer
    CurrentAccount.movements.push(-amount);
    recieverAcc.movements.push(amount);

    //Add transer date
    CurrentAccount.movementsDates.push(new Date().toISOString());
    recieverAcc.movementsDates.push(new Date().toISOString());

    //Updating the UI
    updateUI(CurrentAccount);

    //Reset the timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});


// event handler implementing Loan Transfer
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(Number(inputLoanAmount.value));

  if (amount > 0 && CurrentAccount.movements.some(mov => mov >= amount * 0.1)) {

    setTimeout(function(){
      // Do the loan Transfer
    CurrentAccount.movements.push(amount);

    //Add loan date
    CurrentAccount.movementsDates.push(new Date().toISOString());

    //Update the UI
    updateUI(CurrentAccount);

    //Reset the timer
    clearInterval(timer);
    timer = startLogoutTimer();
    },2500);
  }

  inputLoanAmount.value = "";
});


//event handler implementing Account Deletion
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    CurrentAccount.username === inputCloseUsername.value &&
    CurrentAccount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.username === CurrentAccount.username
    );

    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = "";
  inputClosePin.value = "";
});


// event handler implementing sorting of transfers in movement dashboard 
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(CurrentAccount, !sorted);
  sorted = !sorted;
});


alert(`Instructions to use BANKIST Application =>
For Login :
      Account-1 -> Username = js  &&  Password = 1111
      Account-2 -> Username = ss  &&  Password = 2222`);
