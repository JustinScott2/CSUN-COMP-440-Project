class items {
    static addProduct(ProductName, ProductDescription, Seller, ProductPrice, listOfCategories) {
        const insertStmt = window.db.prepare(
            `INSERT INTO Products (itemID, title, description, seller, datePosted, price) VALUES (?, ?, ?, ?, ?, ?)`
        );
        const itemID = getNextItemID();
        const today = new Date();
        const datePosted = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        console.log("Adding product with ID:", itemID, ProductName, ProductDescription, Seller, datePosted, ProductPrice);
        insertStmt.run([itemID, ProductName, ProductDescription, Seller, datePosted, ProductPrice]);
        insertStmt.free();

        for (let category of listOfCategories) {
            items.addCategoryToProduct(itemID, category);
        }

        return itemID; // Return the generated itemID
    }

    static addCategoryToProduct(itemID, category) {
        const insertStmt = window.db.prepare(
            `INSERT INTO CategoryRelations (itemID, categoryName) VALUES (?, ?)`
        );
        insertStmt.run([itemID, category]);
        insertStmt.free();
    }    

    /*static AddLine(Username, Password, FirstName, LastName, Email, Phone) {
        const insertStmt = window.db.prepare(
            `INSERT INTO Users (username, password, firstName, lastName, email, phoneNum) VALUES (?, ?, ?, ?, ?, ?)`
        );
        insertStmt.run([Username, Password, FirstName, LastName, Email, Phone]);
        insertStmt.free();
    }

    static CheckLogin(Username, Password) { 
        const selectStmt = window.db.prepare(
            `SELECT 1 FROM Users WHERE username = ? AND password = ?`
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
            `SELECT 1 FROM Users WHERE ${Key} = ?`
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
        else if(this.CheckUniqueKey("phoneNum", Phone)){
            return "Phone number already exists";
        }
        else{
            this.AddLine(Username, Password, FirstName, LastName, Email, Phone);
            return "Account created successfully";
        }
    }*/
}
window.items = items;
globalThis.items = items;