class localDB {
    //only run after checking for db
    static AddLine(line, definition) {
        const insertStmt = window.db2.prepare(
            `INSERT INTO myWords (Word, Count, POS, Definition, NumWrong, NumRight) VALUES (?, ?, ?, ?, 1, 0)`
        );
        insertStmt.run([line[0], line[1], line[2], definition]);
        insertStmt.free();
    }
    
    static UpdateLine(line, statement, definition) {
        const updateStmt = window.db2.prepare(
            `UPDATE myWords SET ${statement} WHERE Word = ? AND Count = ? AND POS = ? AND Definition = ?`
        );
        updateStmt.run([line[0], line[1], line[2], definition]);
        updateStmt.free();
    }

    static UpdateDB(line, statement, definition) {
        if (!window.db2) {
            errorText = "Error: db2 does not exist"
            return;
        }

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

    static UpdateLineCorrect(line, definition){
        this.UpdateDB(line, "NumRight = COALESCE(NumRight, 0) + 1", definition);
    }

    static UpdateLineIncorrect(line, definition){
        this.UpdateDB(line, "NumWrong = COALESCE(NumWrong, 0) + 1", definition);
    }

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