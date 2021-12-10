const emailLookUp = (email, users) => {
    for (let user in users) {
        if (users[user]["email"] === email) {
            return {error: "Email Exists"};
        }
    }
    return {error: null};
};

const authenticateUserInfo = (email, password, users) => {
    if(email.trim() == "" || !email) {
        return {error: "Invalid Email"};
    } 

    if(password.trim() == "" || !password) {
        return {error: "Invalid Password"};
    }

    const {error} = emailLookUp(email, users)

    if (error) {
        return {error: error};
    }

    return {error: null};
}

const getUserByEmail = (email, users) => {
    for (let id in users) {
        if (users[id].email === email) {
            return users[id];
        }
    }
}

const urlsForUser = (userID, urlDatabase) => {
    const accessUrls = {};
    for (const url in urlDatabase) {
        if (urlDatabase[url].userID === userID.id) {
            accessUrls[url] = {
                longURL: urlDatabase[url].longURL,
                userID: userID
            };
        }
    } 
    return accessUrls;
}

function generateRandomString() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

module.exports = {
    emailLookUp,
    authenticateUserInfo,
    getUserByEmail,
    urlsForUser,
    generateRandomString
}