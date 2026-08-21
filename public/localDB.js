class localDB {

    //only run after checking for db
    //adds a line into db2, only use if line does not exist
    static AddLine(line, definition) {
        const insertStmt = window.db2.prepare(
            `INSERT INTO myWords (Word, Count, POS, Definition, NumWrong, NumRight) VALUES (?, ?, ?, ?, 1, 0)`
        );
        insertStmt.run([line[0], line[1], line[2], definition]);
        insertStmt.free();
    }
    
    //updates the vlaue of a line.  only use if line exists
    static UpdateLine(line, statement, definition) {
        const updateStmt = window.db2.prepare(
            `UPDATE myWords SET ${statement} WHERE Word = ? AND Count = ? AND POS = ? AND Definition = ?`
        );
        updateStmt.run([line[0], line[1], line[2], definition]);
        updateStmt.free();
    }

    //takes in vals and chooses to add or update
    static UpdateDB(line, statement, definition) {
        //makes sure the window exists.
        if (!window.db2) {
            errorText = "Error: db2 does not exist"
            return;
        }

        //checks if the selected line exists
        const selectStmt = window.db2.prepare(
            `SELECT 1 FROM myWords WHERE Word = ? AND Count = ? AND POS = ? AND Definition = ?`
        );
        selectStmt.bind([line[0], line[1], line[2], definition]);
        const exists = selectStmt.step();
        selectStmt.free();

        if(!exists){
            this.AddLine(line, definition);
        }
        else{
            this.UpdateLine(line, statement, definition);
        }
        window.db2.run("DELETE FROM myWords WHERE NumRight = 5");
    }

    //wrapper for if the line is correct
    static UpdateLineCorrect(line, definition){
        this.UpdateDB(line, "NumRight = COALESCE(NumRight, 0) + 1", definition);
    }

    //wrapper for if the line is incorrect
    static UpdateLineIncorrect(line, definition){
        this.UpdateDB(line, "NumWrong = COALESCE(NumWrong, 0) + 1", definition);
    }

    //Takes all incorrect words and turns them into a single string.  TODO change this in the graphics update
    static stringOfIncorrectWords(dataBase){
        if (!dataBase) {
            return "No incorrect wordsDB found";
        }

        let outputString = "Times Missed:    Word and Definition \n________________________________________\n";

        const tableOutput = dataBase.exec(`SELECT * FROM myWords ORDER BY NumWrong`);

        if (!tableOutput.length || !tableOutput[0].values.length) {
            return "No incorrect words";
        }

        const rows = tableOutput[0].values;
        rows.forEach(element => {
            outputString += `     ${element[4]}       ${element[0]}: ${element[3]}\n`;
        });

        return outputString;
    }

    //tells you if any words have been gotten wrong yet.
    static IsMyWordsEmpty(dataBase){
        if (!dataBase) {
            return true;
        }
        const tableOutput = dataBase.exec(`SELECT 1 FROM myWords`);
        return !tableOutput.length || !tableOutput[0].values.length;
    }
}
window.localDB = localDB;
globalThis.localDB = localDB;