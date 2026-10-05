class account {
    static AddLine(Username, Password, FirstName, LastName, Email, Phone) {
        const salt = await bcrypt.genSalt(5);
        const secPass = bcrypt.hash(Password, salt);
        const insertStmt = window.db.prepare(
            `INSERT INTO users (username, password, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?, ?)`
        );
        insertStmt.run([Username, secPass, FirstName, LastName, Email, Phone]);
        insertStmt.free();
    }

    //queries database for hashed password related to username
    static getPasswordHash(Username) {
        const selectStmt = window.db.prepare(
            'SELECT 1 FROM users WHERE username = ?'
        );
        return selectStmt.run([Username]);
    }

    // if userInput.password hashes to the same stored password as the username,
    // then it must be a valid login.
    static CheckLogin(Username, Password) {
        const secPass = account.getPasswordHash(username);
        if(bcrypt.compare(Password,secPass){
            return true;
        } else {
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
