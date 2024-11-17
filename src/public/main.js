const API_URL = 'http://localhost:3005';
const socket = io();

/** Utility Functions */
const getAuthHeaders = () => ({
    Authorization: localStorage.getItem('token'),
    'Content-Type': 'application/json',
});

const showError = (message) => alert(message || 'An error occurred.');

/** Screens */
const showLoginScreen = () => {
    document.querySelector('.container').innerHTML = `
        <h2>Login</h2>
        <div id="loginForm">
            <input type="text" id="userName" placeholder="User name" required />
            <input type="password" id="password" placeholder="Password" required />
            <button type="submit" id="loginAction">Login</button>
        </div>
        <p>Don't have an account? <button id="showSignupButton" class="link-button">Sign Up</button></p>
    `;

    document.getElementById('loginAction').addEventListener('click', handleLogin);
    document.getElementById('showSignupButton').addEventListener('click', showSignupScreen);
};

const showSignupScreen = () => {
    document.querySelector('.container').innerHTML = `
        <h2>Sign Up</h2>
        <div id="signupForm">
            <input type="text" id="userName" placeholder="User name" required />
            <input type="password" id="password" placeholder="Password" required />
            <button id="signupAction">Sign Up</button>
        </div>
        <p>Already have an account? <button id="showLoginButton" class="link-button">Login</button></p>
    `;

    document.getElementById('signupAction').addEventListener('click', handleSignup);
    document.getElementById('showLoginButton').addEventListener('click', showLoginScreen);
};

const showChatScreen = async () => {
    document.querySelector('.container').innerHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <h2>Chat List</h2>
                <button id="createGroupButton">Create Group</button>
            </div>
            <div id="chatList" class="chat-list"></div>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/chat/getChats`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            const { payload: { chat } } = await response.json();
            renderChatList(chat);
        } else {
            showError('Failed to fetch chats.');
        }
    } catch (error) {
        console.error('Error fetching chats:', error);
    }

    document.getElementById('createGroupButton').addEventListener('click', showGroupCreationScreen);
};

const showGroupCreationScreen = async () => {
    document.querySelector('.container').innerHTML = `
        <h2>Create Group</h2>
        <input type="text" id="groupName" placeholder="Group Name" required />
        <div id="userList"></div>
        <button id="createGroupAction">Create Group</button>
        <button id="backToChatButton">Back to Chat</button>
    `;

    try {
        const users = await fetchUsers();
        renderUserList(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }

    document.getElementById('createGroupAction').addEventListener('click', handleGroupCreation);
    document.getElementById('backToChatButton').addEventListener('click', showChatScreen);
};

/** Render Functions */
const renderChatList = (chats) => {
    const chatList = document.getElementById('chatList');
    chats.forEach(({ _id, name }) => {
        const chatDiv = document.createElement('div');
        chatDiv.classList.add('chat-item');
        chatDiv.textContent = name;
        chatDiv.addEventListener('click', () => openChat(_id, name));
        chatList.appendChild(chatDiv);
    });
};

const renderUserList = (users) => {
    const userList = document.getElementById('userList');
    users.forEach(({ userName }) => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = userName;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(userName));
        userList.appendChild(label);
    });
};

/** Handlers */
const handleLogin = async () => {
    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;

    if (!userName || !password) {
        return showError('Please fill in all fields.');
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, password }),
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.payload.token);
            localStorage.setItem('id', result.payload.id);
            showChatScreen();
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        showError();
    }
};

const handleSignup = async () => {
    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;

    if (!userName || !password) {
        return showError('Please fill in all fields.');
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, password }),
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.payload.token);
            localStorage.setItem('id', result.payload.id);
            showChatScreen();
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Error signing up:', error);
        showError();
    }
};

const handleGroupCreation = async () => {
    const groupName = document.getElementById('groupName').value;
    const selectedUsers = Array.from(
        document.querySelectorAll('#userList input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    if (!groupName || !selectedUsers.length) {
        return showError('Please enter a group name and select members.');
    }

    try {
        const response = await fetch(`${API_URL}/chat/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name: groupName, members: selectedUsers }),
        });

        if (response.ok) {
            showChatScreen();
        } else {
            showError('Failed to create group.');
        }
    } catch (error) {
        console.error('Error creating group:', error);
        showError();
    }
};

const fetchUsers = async () => {
    const response = await fetch(`${API_URL}/auth/all`, {
        headers: getAuthHeaders(),
    });

    if (response.ok) {
        const { payload: { users } } = await response.json();
        return users;
    }

    return [];
};

/** Chat Functionality */
const openChat = async (chatId, chatName) => {
    document.querySelector('.container').innerHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <h2>${chatName}</h2>
                <button id="backToChatListButton">Back to Chats</button>
            </div>
            <div id="chatBox" class="chat-box"></div>
            <form id="messageForm">
                <input type="text" id="messageInput" placeholder="Type a message..." required />
                <button type="submit">Send</button>
            </form>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/chat/getMessages?chatId=${chatId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            const { payload: { messages } } = await response.json();
            renderChatMessages(messages);
        } else {
            showError('Failed to fetch messages.');
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }

    socket.emit('joinChat', chatId);

    document.getElementById('messageForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('sendMessage', {
                senderId: localStorage.getItem('id'),
                chatId,
                content: message,
            });
            messageInput.value = '';
        }
    });

    socket.on('newMessage', (message) => {
        if (message.chatId === chatId) {
            renderChatMessages([message]);
        }
    });

    document.getElementById('backToChatListButton').addEventListener('click', showChatScreen);
};

const renderChatMessages = (messages) => {
    const chatBox = document.getElementById('chatBox');

    messages.forEach(({ sender: { userName }, content }) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        const userNameP = document.createElement('p');
        userNameP.textContent = userName;
        messageDiv.appendChild(userNameP);
        const contentP = document.createElement('p');
        contentP.textContent = content;
        messageDiv.appendChild(contentP);
        chatBox.appendChild(messageDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
};


/** Initialize Event Listeners */
document.getElementById('loginButton')?.addEventListener('click', showLoginScreen);
document.getElementById('signupButton')?.addEventListener('click', showSignupScreen);
