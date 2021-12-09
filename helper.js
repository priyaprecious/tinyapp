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

module.exports = {
    emailLookUp,
    authenticateUserInfo,
    getUserByEmail
}