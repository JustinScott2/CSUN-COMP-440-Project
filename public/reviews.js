class reviews {
    static getNumberOfReviewsBySellerDate(seller, datePosted) {
        const selectStmt = window.db.prepare(
            `SELECT COUNT(*) as reviewCount FROM Reviews WHERE poster = ? AND datePosted = ?`
        );
        selectStmt.bind([seller, datePosted]);
        const reviewCount = selectStmt.step() ? selectStmt.getAsObject().reviewCount : 0;
        selectStmt.free();
        return reviewCount;
    }

    static addReview(itemID, reviewer, reviewTitle, reviewText, rating) {
        //checks
        //checks if item exists
        const itemExists = items.CheckItemIDExistance(itemID);
        if (!itemExists) {
            console.log(`Item with itemID ${itemID} does not exist, cannot add review.`);
            return;
        }
        //assume reviewer exists
        //checks if rating is valid
        if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
            console.log(`Rating must be an integer between 1 and 10 inclusive. Given rating: ${rating}`);
            return;
        }
        //checks if this is the reviever's item
        const checkedItem = items.getProductByID(itemID);
        if (checkedItem.seller === reviewer) {
            console.log(`Reviewer cannot review their own item. ${checkedItem.seller} is the seller of itemID ${itemID}.`);
            return;
        }
        //checks if reviewer has already reviewed this item
        const selectStmt = window.db.prepare(
            `SELECT 1 FROM Reviews WHERE itemID = ? AND poster = ?`
        );
        selectStmt.bind([itemID, reviewer]);
        const alreadyReviewed = selectStmt.step();
        selectStmt.free();
        if (alreadyReviewed) {
            console.log(`Reviewer ${reviewer} has already reviewed itemID ${itemID}.`);
            return;
        }
        //checks if reviewer has already reviewed 2 items today
        const today = items.getDate();
        const reviewCountToday = reviews.getNumberOfReviewsBySellerDate(reviewer, today);
        if(reviewCountToday == 2) {
            console.log(`Reviewer ${reviewer} has already reviewed 2 items today (${today}). Cannot add more reviews today.  Item ID: ${itemID}`);
            return;
        }else if(reviewCountToday >= 3) {
            console.log(`Critical Error: Reviewer ${reviewer} has reviewed ${reviewCountToday} items today (${today}). error encountered.`);
            return;
        }

        const insertStmt = window.db.prepare(
            `INSERT INTO Reviews (itemID, poster, revTitle, revText, rating, datePosted) VALUES (?, ?, ?, ?, ?, ?)`
        );
        insertStmt.run([itemID, reviewer, reviewTitle, reviewText, rating, today]);
        insertStmt.free();
    }

    //delete functions, users DO NOT HAVE ACCESS
    static deleteReviewsByItemID(itemID) {
        const exists = items.CheckItemIDExistance(itemID);
        if (!exists) {
            console.log(`Item with itemID ${itemID} does not exist, cannot delete reviews.`);
            return;
        }
        const deleteStmt = window.db.prepare(
            `DELETE FROM Reviews WHERE itemID = ?`
        );
        deleteStmt.run([itemID]);
        deleteStmt.free();
    }

    static deleteReview(itemID, reviewer) {
        const exists = items.CheckItemIDExistance(itemID);
        if (!exists) {
            console.log(`Item with itemID ${itemID} and reviewer ${reviewer} does not exist, cannot delete review.`);
            return;
        }
        const deleteStmt = window.db.prepare(
            `DELETE FROM Reviews WHERE itemID = ? AND poster = ?`
        );
        deleteStmt.run([itemID, reviewer]);
        deleteStmt.free();
    }

    static getReview(itemID, reviewer) {
        const exists = items.CheckItemIDExistance(itemID);
        if (!exists) {
            console.log(`Item with itemID ${itemID} and reviewer ${reviewer} does not exist, cannot get review.`);
            return null;
        }
        // There should be at most one review per item per reviewer.
        const selectStmt = window.db.prepare(
            `SELECT * FROM Reviews WHERE itemID = ? AND poster = ?`
        );
        selectStmt.bind([itemID, reviewer]);
        const review = selectStmt.step() ? selectStmt.getAsObject() : null;
        selectStmt.free();
        return review;
    }

    static getReviewsByItemID(itemID) {
        const exists = items.CheckItemIDExistance(itemID);
        if (!exists) {
            console.log(`Item with itemID ${itemID} does not exist, cannot get reviews.`);
            return [];
        }
        const selectStmt = window.db.prepare(
            `SELECT * FROM Reviews WHERE itemID = ?`
        );
        selectStmt.bind([itemID]);
        const reviewsList = [];
        while (selectStmt.step()) {
            reviewsList.push(selectStmt.getAsObject());
        }
        selectStmt.free();
        return reviewsList;
    }

    static getReviewsByReviewer(reviewer) {
        const selectStmt = window.db.prepare(
            `SELECT * FROM Reviews WHERE poster = ?`
        );
        selectStmt.bind([reviewer]);
        const reviewsList = [];
        while (selectStmt.step()) {
            reviewsList.push(selectStmt.getAsObject());
        }
        selectStmt.free();
        console.log("Found Reviews by seller: ", reviewsList);
        return reviewsList;
    }
}
window.reviews = reviews;
globalThis.reviews = reviews;