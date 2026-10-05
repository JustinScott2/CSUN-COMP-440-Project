class account {
    static async AddLine(Username, Password, FirstName, LastName, Email, Phone) {
        console.log("running AddLine");
        const salt = await bcrypt.genSalt(5);
        const secPass = await bcrypt.hash(Password, salt);
        console.log(secPass);
        console.log("Adding user: ", Username, secPass, FirstName, LastName, Email, Phone);
        const insertStmt = window.db.prepare(
            `INSERT INTO users (username, password, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?, ?)`
        );
        insertStmt.run([Username, secPass, FirstName, LastName, Email, Phone]);
        insertStmt.free();
    }

    //queries database for hashed password related to username
    static getPasswordHash(Username) {
        const output = window.db.exec(`SELECT * FROM users WHERE username = '${Username}' limit 1`);
        console.log(output);
        console.log("Returning: ", output[0].values[0][1]);
        return output[0].values[0][1];
    }

    // if userInput.password hashes to the same stored password as the username,
    // then it must be a valid login.
    static async CheckLogin(Username, Password) {
        const secPass = await account.getPasswordHash(Username);
        let isValid;
        try {
            isValid = await bcrypt.compare(Password, secPass);
            console.log(isValid);
        } catch (error) {
            isValid = false; 
            console.log(isValid);
        }
        
        if(isValid){
            console.log("Valid login " + isValid);
            return true;
        } else {
            console.log("invalid login " + isValid);
            return false;
        }
    }

    static CheckUniqueKey(Key, Value) { 
        const selectStmt = window.db.prepare(
            `SELECT 1 FROM users WHERE ${Key} = ?`
        );
        selectStmt.bind([Value]);
        const exists = selectStmt.step();
        selectStmt.free();

        if(exists){
            return true;
        }
        else{
            return false;
        }
    }

    static CreateAccount(Username, Password, Password2, FirstName, LastName, Email, Phone) {
        if (Password !== Password2) {
            return "Passwords do not match";
        }

        if(this.CheckUniqueKey("username", Username)){
            return "Username already exists";
        }
        else if(this.CheckUniqueKey("email", Email)){
            return "Email already exists";
        }
        else if(this.CheckUniqueKey("phone", Phone)){
            return "Phone number already exists";
        }
        else{
            this.AddLine(Username, Password, FirstName, LastName, Email, Phone);
            return "Account created successfully";
        }
    }
}
window.account = account;
globalThis.account = account;
