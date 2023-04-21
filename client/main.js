import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container');
const tx = document.getElementsByTagName("textarea");

let loadInterval;

// loading animation
function loaderAnswer(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300)
}

// response typing animation
function typeText(element, text) {
  let index = 0;

  let typeInterval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 20)
}

// genatate unique id for ai response message
function genUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// boilerplate for chat stripe for user and ai
function chatStripe(isAI, value, uniqueID) {
  return (
    `
      <div class="wrapper ${isAI && "ai"}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAI ? bot : user}"
              alt="${isAI ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueID}>${value}</div>
        </div>
      </div>
    `
  )
}

// handle submit
const handleSubmit = async (e) => {
  e.preventDefault();

  // create user chat stripe
  const data = new FormData(form);
  //console.log(data.get('prompt'));
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  
  // reset form and textarea
  form.reset();
  for (let i = 0; i < tx.length; i++) {
    tx[i].style.height = 0;
    tx[i].style.height = (tx[i].scrollHeight) + "px";
  }

  // create empty AI chat stripe
  const uniqueID = genUniqueID();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueID);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // loading animation
  const messageDiv = document.getElementById(uniqueID);
  loaderAnswer(messageDiv);

  // fetch data from server
  const response = await fetch('https://selfchatgpt.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if(response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();
    
    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }

}

// add form event listener
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    handleSubmit(e);
  }
})

// auto resize textarea
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
  tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}