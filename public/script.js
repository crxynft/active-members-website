const socket = io();

socket.on("updateMembers", (members) => {
  const membersList = document.getElementById("members-list");
  membersList.innerHTML = "";

  members.forEach((member) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${member.avatarURL}" alt="${member.username}'s avatar" class="avatar">
      <div class="member-info">
        <span class="username">${member.username}</span>
        <span class="message-count">${member.count} messages</span>
      </div>
    `;
    membersList.appendChild(li);
  });
});
