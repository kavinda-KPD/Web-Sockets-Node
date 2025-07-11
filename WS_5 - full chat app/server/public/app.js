const socket = io("ws://localhost:8080");

const activity = document.querySelector(".activity");
const msgInput = document.querySelector("input");
const sendMessage = (e) => {
  e.preventDefault();

  if (msgInput.value) {
    socket.emit("message", msgInput.value);
    msgInput.value = "";
  }
  msgInput.focus();
};

document.querySelector("form").addEventListener("submit", sendMessage);

//listen for messages coming from the server
socket.on("message", (data) => {
  activity.textContent = "";
  const li = document.createElement("li");
  li.textContent = data;
  document.querySelector("ul").appendChild(li);
});

//send typing activity to the server
msgInput.addEventListener("keypress", () => {
  socket.emit("activity", `${socket.id} is typing...`);
});

let activityTimer;

//listen for typing activity coming from the server
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;

  //clear the timer after 2 seconds
  clearTimeout(activityTimer);

  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 2000);
});
