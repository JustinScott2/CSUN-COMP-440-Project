class account {
    static AddLine(Username, Password, FirstName, LastName, Email, Phone) {
        const insertStmt = window.db.prepare(
            `INSERT INTO users (username, password, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?, ?)`
        );
        insertStmt.run([Username, Password, FirstName, LastName, Email, Phone]);
        insertStmt.free();
    }

    static CheckLogin(Username, Password) { 
        const selectStmt = window.db.prepare(
            `SELECT 1 FROM users WHERE username = ? AND password = ?`
        );
        selectStmt.bind([Username, Password]);
        const exists = selectStmt.step();
        selectStmt.free();

        if(exists){
            return true;
        }
        else{
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