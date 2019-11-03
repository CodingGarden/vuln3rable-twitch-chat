XMLHttpRequest = function() {
  return {};
};

function getMessageWithEmotes(userstate, message) {
  let messageWithEmotes = '';
  if (userstate.emotes) {
    const emoteIds = Object.keys(userstate.emotes);
    const emoteStart = emoteIds.reduce((starts, id) => {
      userstate.emotes[id].forEach((startEnd) => {
        const [start, end] = startEnd.split('-');
        starts[start] = {
          emoteUrl: `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/2.0" />`,
          end,
        };
      });
      return starts;
    }, {});
    for (let i = 0; i < message.length; i++) {
      const char = message[i];
      const emoteInfo = emoteStart[i];
      if (emoteInfo) {
        messageWithEmotes += emoteInfo.emoteUrl;
        i = emoteInfo.end;
      } else {
        messageWithEmotes += char;
      }
    }
  }
  return messageWithEmotes || message;
}

const authorColors = {};
let color = 0;

function getColor(username) {
  if (authorColors[username]) return authorColors[username];
  authorColors[username] = `hsl(${color % 360}, 100%, 50%)`;
  color += 20;
  sendAuthors(Object.keys(authorColors));
  return authorColors[username];
}

function sanitize(text) {
  return DOMPurify.sanitize(text, { FORBID_ATTR: [ 'onerror', 'onload' ], FORBID_TAGS: [ 'script', 'iframe' ] });
}

function addEvent(event) {
  const element = document.createElement('div');
  element.classList.add('message');
  let authorColor = getColor(event.username);
  element.innerHTML = `
    <span class="time">${event.time}</span>
    <span class="username" style="color: ${authorColor}">${event.username}</span>
    <span class="message">${sanitize(event.message)}</span>
  `;
  messages.appendChild(element);
  setTimeout(() => {
    messages.scrollTop = messages.scrollHeight;
  });
}

const options = {
  connection: {
    reconnect: true,
    secure: true
  },
  channels: [ '#codinggarden' ]
};

let client = new tmi.client(options);
client.connect();
client.on('connected', () => {
  loading.style.display = 'none';
});
client.on('message', async (channel, userstate, message) => {  
  const event = {
    id: userstate.id,
    username: userstate['display-name'],
    message: getMessageWithEmotes(userstate, message),
    time: new Date(+userstate['tmi-sent-ts']).toUTCString().split('2019 ')[1],
  };
  addEvent(event);
});
