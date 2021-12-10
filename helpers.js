//--------------function to verify if email exists
const emailLookUp = (email, users) => {
    for (let user in users) {
        if (users[user]["email"] === email) {
            return {error: "Email Exists"};
        }
    }
    return {error: null};
};

//------------------function to see if email and password values provided by the users are not empty
//-----------------and to verify if email exists----------------
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

//---------------function to get the user details------------
const getUserByEmail = (email, users) => {
    for (let id in users) {
        if (users[id].email === email) {
            return users[id];
        }
    }
}

//-----------function to provide list of urls owned by the user-----------
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

//----------------function to generate random string of length 6 digits--------------
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