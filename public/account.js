class account {
    static async AddLine(Username, Password, FirstName, LastName, Email, Phone) {
        const passwordHash = await bcrypt.hash(Password, 10);
        const insertStmt = window.db.prepare(
            `INSERT INTO users (username, password, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?, ?)`
        );
        try {
            insertStmt.run([Username, passwordHash, FirstName, LastName, Email, Phone]);
        } finally {
            insertStmt.free();
        }
    }

    static getPasswordHash(username) {
        const selectStmt = window.db.prepare(
            'SELECT password FROM users WHERE username = ? LIMIT 1'
        );
        try {
            if (!selectStmt.step()) {
                return null;
            }
            return selectStmt.getAsObject().password;
        } finally {
            selectStmt.free();
        }
    }

    static async CheckLogin(Username, Password) {
        const passwordHash = account.getPasswordHash(Username);
        if (passwordHash === null) {
            return false;
        }
        return await bcrypt.compare(Password, passwordHash);
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

    static async CreateAccount(Username, Password, Password2, FirstName, LastName, Email, Phone) {
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
            await this.AddLine(Username, Password, FirstName, LastName, Email, Phone);
            return "Account created successfully";
        }
    }
}
window.account = account;
globalThis.account = account;
