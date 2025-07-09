const socket = io("ws://localhost:8080");

const sendMessage = (e) => {
  e.preventDefault();
  const input = document.getElementById("message");

  if (input.value) {
    socket.emit("message", input.value);
    input.value = "";
  }
  input.focus();
};

document.querySelector("form").addEventListener("submit", sendMessage);

//listen for messages coming from the server
socket.on("message", (data) => {
  const li = document.createElement("li");
  li.textContent = data;
  document.querySelector("ul").appendChild(li);
});
