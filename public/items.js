class items {
    //returns the current date in the format DD/MM/YYYY
    static getDate() {
        const today = new Date();
        const datePosted = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        return datePosted;
    }

    //adds a product to the database and returns the generated itemID, or null if the seller has already posted 2 products today
    static addProduct(ProductName, ProductDescription, Seller, ProductPrice, listOfCategories) {
        //checks if seller is allowed to sell another product
        const datePosted = items.getDate();
        const currSellersItems = items.getProductsByDateAndSeller("25/11/2026", "Test Seller").length;
        if (currSellersItems == 2) {
            console.log("Seller has already posted 2 products today, cannot add product: ", ProductName);
            return null;
        }
        else if (currSellersItems > 2) {
            console.log("Critical error: Seller has posted more than 2 products today.  Something broke");
            return null;
        }
        
        //adds the product to the database
        const insertStmt = window.db.prepare(
            `INSERT INTO Products (itemID, title, description, seller, datePosted, price) VALUES (?, ?, ?, ?, ?, ?)`
        );
        const itemID = getNextItemID();
        insertStmt.run([itemID, ProductName, ProductDescription, Seller, datePosted, ProductPrice]);
        insertStmt.free();

        //adds the categories to the product
        for (let category of listOfCategories) {
            if (!items.CheckCatExistance(category)) {
                console.log(`Category ${category} does not exist, cannot assign to product ${ProductName}.`);
                continue;
            }
            items.assignSingleCategoryToProduct(itemID, category);
        }

        // Return the generated itemID
        return itemID; 
    }   

    static CheckItemIDExistance(id) { 
        const selectStmt = window.db.prepare(
            `SELECT 1 FROM Products WHERE itemID = ?`
        );
        selectStmt.bind([id]);
        const exists = selectStmt.step();
        selectStmt.free();

        if(exists){
            return true;
        }
        else{
            return false;
        }
    }

    static updateProdPrice(itemID, newPrice) {
        const exists = items.CheckItemIDExistance(itemID);
        if (exists) {
            const updateStmt = window.db.prepare(
                `UPDATE Products SET price = ? WHERE itemID = ?`
            );
            updateStmt.run([newPrice, itemID]);
            updateStmt.free();
        } else {
            console.log(`Item with itemID ${itemID} does not exist, cannot update price.`);
        }
    }

    static getProductByID(itemID) {
        const exists = items.CheckItemIDExistance(itemID);
        if (!exists) {
            console.log(`Item with itemID ${itemID} does not exist.`);
            return null;
        }
        const selectStmt = window.db.prepare(
            `SELECT * FROM Products WHERE itemID = ?`
        );
        selectStmt.bind([itemID]);
        const product = selectStmt.step() ? selectStmt.getAsObject() : null;
        selectStmt.free();
        return product;
    }

    static getProductsByDateAndSeller(datePosted, seller) {
        const selectStmt = window.db.prepare(
            `SELECT * FROM Products WHERE datePosted = ? AND seller = ?`
        );
        selectStmt.bind([datePosted, seller]);
        const product = selectStmt.step() ? selectStmt.getAsObject() : null;
        const products = [];
        while (product) {
            products.push(product);
            if (!selectStmt.step()) break;
        }
        selectStmt.free();
        return products;
    }

    //deletes a product from the database, WARNING: this does not contain the check to see if the deleter was the seller of the product, this should be done before calling this function
    static deleteProduct(itemID) {
        const exists = items.CheckItemIDExistance(itemID);
        if (!exists) {
            console.log(`Item with itemID ${itemID} does not exist, cannot delete.`);
            return;
        }
        //deletes the product from the database
        const deleteStmt = window.db.prepare(
            `DELETE FROM Products WHERE itemID = ?`
        );
        deleteStmt.run([itemID]);
        deleteStmt.free();

        //deletes the product from the category relations table
        const deleteStmt2 = window.db.prepare(
            `DELETE FROM CategoryRelations WHERE itemID = ?`
        );
        deleteStmt2.run([itemID]);
        deleteStmt2.free();

        //deletes the product from the reviews table
        reviews.deleteReviewsByItemID(itemID);
    }
    
    //#region Category functions
    static CheckCatExistance(category) { 
        const selectStmt = window.db.prepare(
            `SELECT 1 FROM CategoryList WHERE categoryName = ?`
        );
        selectStmt.bind([category]);
        const exists = selectStmt.step();
        selectStmt.free();

        if(exists){
            return true;
        }
        else{
            return false;
        }
    }

    static assignSingleCategoryToProduct(itemID, category) {
        const exists = items.CheckCatExistance(category);
        if (!exists) {
            console.log(`Category ${category} does not exist, cannot assign to product.`);
            return;
        }else if (!Number.isInteger(itemID)){
            console.log("Error: item not added. Cannot add category.");
            return;
        }
        const insertStmt = window.db.prepare(
            `INSERT INTO CategoryRelations (itemID, categoryName) VALUES (?, ?)`
        );
        insertStmt.run([itemID, category]);
        insertStmt.free();
    }

    static assignMultipleCategoriesToProduct(itemID, listOfCategories) {
        for (let category of listOfCategories) {
            items.assignSingleCategoryToProduct(itemID, category);
        }
    }

    static removeCatProdRelation(itemID, category) {
        const selectStmt = window.db.prepare(
            `SELECT 1 FROM CategoryRelations WHERE categoryName = ? AND itemID = ?`
        );
        selectStmt.bind([category, itemID]);
        const exists = selectStmt.step();
        selectStmt.free();

        if (!exists) {
            console.log(`${category}+${itemID} pair does not exist, cannot remove.`);
            return;
        }

        const deleteStmt = window.db.prepare(
            `DELETE FROM CategoryRelations WHERE itemID = ? AND categoryName = ?`
        );
        deleteStmt.run([itemID, category]);
        deleteStmt.free();
    }

    static findProductsByCategory(category) {
        const selectStmt = window.db.prepare(
            `SELECT * FROM Products WHERE itemID IN (SELECT itemID FROM CategoryRelations WHERE categoryName = ?)`
        );
        selectStmt.bind([category]);
        const products = [];
        while (selectStmt.step()) {
            products.push(selectStmt.getAsObject());
        }
        selectStmt.free();
        return products;
    }

    static findCategoriesByProduct(itemID) {
        const selectStmt = window.db.prepare(
            `SELECT categoryName FROM CategoryRelations WHERE itemID = ?`
        );
        selectStmt.bind([itemID]);
        const categories = [];
        while (selectStmt.step()) {
            categories.push(selectStmt.getAsObject().categoryName);
        }
        selectStmt.free();
        return categories;
    }

    //#endregion 
}
window.items = items;
globalThis.items = items;