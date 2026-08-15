class QnA {
    //TODO replace all with rows
    //ex. What is an apple?
    static question = "";

    static rows = [];
    //ex. red fruit, orange fruit, green fruit, yellow fruit
    static answers = [];

    static correctResponse = "";

    static questionSearchParams = "";
    static minOccurences = 8;

    //curent call to generate a question, will be reworked in the game modes update
    static async generateQuestion() {
        await window.dbPromise; // Ensure the database is loaded before generating a question
        await this.GenerateSQLQuestion(window.db, this.questionSearchParams, this.minOccurences);
    }

    //pulls a random line from the db and adds the word to question field.
    static GenerateQuestionWInput(database, SQLSelection, minOccurences) {

        //if no db found, move to error state
        if (!database) {
            errorText = "Error: Dictionary not found"
            //setActiveIndex(State.error);
            console.log(errorText);
            return;
        }

        //makes a list of tables in the doc that are not metadata, in this case it can only be the dictionary, but could cause issues if another table is added.
        const tables = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
        //if the table has no length or has no values, move to error state.  This will not happen in current version but is good practice.
        if (!tables.length || !tables[0].values.length) {
            errorText = "Error: No table found in dictionary.db" + tables.length + " " + tables[0].values.length;
            //setActiveIndex(State.error);
            console.log(errorText);
            return;
        }

        //extracts the name of the first table.  This my not work for multiple tables. 
        const tableName = tables[0].values[0][0];

        //question holder holds a random line selected from the previously discovered table.
        let qestionHolder;

        try {
            // basic validation/sanitization for the incoming SQLSelection
            if (typeof SQLSelection !== 'string' || !SQLSelection.trim()) {
                SQLSelection = '1'; // always-true predicate if nothing provided
            }
            if (SQLSelection.includes(';')) {
                throw new Error('SQLSelection contains disallowed characters');
            }

            // escape any double-quotes inside the table name
            const safeTableName = tableName.replace(/"/g, '""');
            const selection = SQLSelection.replace(/POS\s*=\s*'([^']+)'/i, (match, val) => `REPLACE(POS, '"', '') = '${val}'`);
            const query = `SELECT * FROM "${safeTableName}" WHERE ${selection} and Count > ${minOccurences} and POS != """""" ORDER BY random() LIMIT 1`;
            qestionHolder = database.exec(query);
        } catch (e) {
            console.error('QnA: SQL execution error', e);
            errorText = 'Error: SQL execution failed';
            //setActiveIndex(State.error);
            console.log(errorText);
            return;
        }

        //if no row is found, set error
        if (!qestionHolder || !qestionHolder.length || !qestionHolder[0].values.length) {
            errorText = "Error: No data found in dictionary.db";
            //setActiveIndex(State.error);
            console.log(errorText);
            return;
        }

        //returns the found values
        return qestionHolder[0].values[0];
    }

    static GenerateSQLQuestion(database, wordChoice, minOccurences){
        //zero out rows
        this.rows = [];
        this.answers = [];

        //runs until four valid answers that are not invalid are found
        for (let i = 0; i < 4; i++) {

            //temporary vars to hold outputs
            let searchOutput = "";
            let searchOutputText = "";

            //if we are doing a review game
            if(runningMyWords && i == 0){
                searchOutput = this.GenerateQuestionWInput(window.db2, "1=1", 0);
            }

            //if we are doing any other kinds of games.
            else{
                searchOutput = this.GenerateQuestionWInput(database, wordChoice, minOccurences);
            }

            //if no db response is found, set error
            if (!searchOutput) {
                errorText = "Error: No word found @ GenerateSQLQuestion";
                //setActiveIndex(State.error);
                console.log(errorText);
                this.question = errorText;
                return;
            }
            
            //check the validity of the answer
            searchOutputText = this.CheckAnswerValidity(searchOutput);

            //if the answer is invalid, decrement i to try again
            if(searchOutputText == false){
                i--;
            }

            //if answer is valid but empty, set error
            else if(searchOutputText.length == 0){
                errorText = "Error: No text found for word@ GenerateSQLQuestion";
                //setActiveIndex(State.error);
                console.log(errorText);
                this.question = errorText;
                return;
            }

            else{
                this.rows[i] = searchOutput;
                this.answers[i] = searchOutputText;
                //this.answers[i] = this.DeTildeify(searchOutputText, this.rows[0][0]);
            }
        }

        let aOrAn = "";
        if(this.rows[0][0].charAt(0).toLowerCase() === 'a' || this.rows[0][0].charAt(0).toLowerCase() === 'e' || this.rows[0][0].charAt(0).toLowerCase() === 'i' || this.rows[0][0].charAt(0).toLowerCase() === 'o' || this.rows[0][0].charAt(0).toLowerCase() === 'u') {
            aOrAn = "an";
        } else {
            aOrAn = "a";
        }
        this.question = "What is " + this.rows[0][0] + "?";
        this.correctResponse = "the definition of " + aOrAn + " " + this.rows[0][0] + " is";
    }

    //finds the first good definition of a word.  if no good definition is found, returns false.  This is to avoid bad definitions like "a type of" or "see also"
    static CheckAnswerValidity(searchOutput){
        if (!Array.isArray(searchOutput) || searchOutput.length < 4) {
            console.warn("Invalid search output passed to CheckAnswerValidity:", searchOutput);
            return false;
        }

        const word = String(searchOutput[0] || '').toLowerCase();
        const definition = typeof searchOutput[3] === 'string' ? searchOutput[3] : '';

        if (!definition.trim()) {
            console.warn("No definition found for word:", searchOutput[0]);
            return false;
        }

        let replaceword = definition.toLowerCase()
            .replaceAll("\\b" + word + "\\b", "~~").replaceAll("alt.","alt").replaceAll("eg.", "eg").replaceAll("ie.", "ie").replaceAll("esp.", "esp").trim();
        if (replaceword.charAt(0) === '"') {
            replaceword = replaceword.slice(1);
        }
        if (replaceword.charAt(replaceword.length - 1) === ';') {
            replaceword = replaceword.slice(0, -1).trim();
        }

        const splitAnswer = replaceword
            .split(/[;.]+/)
            .map(part => part.trim())
            .filter(part => part.length > 0);

        //filters bad answers
        //TODO build a better filter
        
        for (let i = 0; i < splitAnswer.length; i++) {
            if(this.TextFilter(splitAnswer[i]))
            {
            }
            else{
                const cleanedAnswer = splitAnswer[i].replace(/\s+/g, ' ').trim();
                const formattedAnswer = cleanedAnswer.charAt(0).toUpperCase() + cleanedAnswer.slice(1);
                return formattedAnswer + (formattedAnswer.endsWith('.') ? '' : '.');
            }
        }
        return false;
    }
    
    //takes an input string and returns true if it matches any of theb filters
    static TextFilter(inputString) {
        const tempSplit = inputString.split(/\s+/).filter(word => word.length > 0);
        const filters = [ (tempSplit.length == 1), 
                          (tempSplit.length == 2 && (tempSplit[0] === "a" || tempSplit[0] === "an" || tempSplit[0] === "of" || tempSplit[0] === "see" || tempSplit[0] === "the" || tempSplit[0] === "to" || tempSplit[0] === "in" || tempSplit[0] === "for" || tempSplit[0] === "with" || tempSplit[0] === "as" || tempSplit[0] === "by" || tempSplit[0] === "from" || tempSplit[0] === "on" || tempSplit[0] === "at" || tempSplit[0] === "of")), 
                          (tempSplit.length == 3 && (tempSplit[0] === "pertaining" || tempSplit[0] === "alt" || tempSplit[0] === "characterized" || 
                                                    (tempSplit[0] === "one" && tempSplit[1] === "who") || 
                                                    (tempSplit[0] === "diminutive" && tempSplit[1] === "for")||
                                                    (tempSplit[0] === "see")||
                                                    (tempSplit[0] === "same" && tempSplit[1] === "as"))), 
                          (tempSplit.length == 4 && (tempSplit[0] === "the" && tempSplit[1] === "state" && tempSplit[2] === "of" && tempSplit[3] === "being")), 
                          (tempSplit.length == 4 && ((tempSplit[0] === "in" && tempSplit[3] === "manner")||
                                                    (tempSplit[0] === "the" && tempSplit[1] === "diminutive" && tempSplit[2] === "for")||
                                                    (tempSplit[0] === "a" && tempSplit[1] === "type" && tempSplit[2] === "of"))), 
                          (tempSplit.length == 5 && ((tempSplit[0] === "in" && (tempSplit[2] === "form" || tempSplit[2] === "type" || tempSplit[2] === "manner") && tempSplit[3] === "of")||
                                                    (tempSplit[0] === "the" && tempSplit[1] === "state" && tempSplit[2] === "of" && tempSplit[3] === "being")||
                                                    (tempSplit[0] === "of" && tempSplit[1] === "or" && tempSplit[2] === "pertaining" && tempSplit[3] === "to"))),
                          (inputString.length > 150) ];
        return filters.some(filter => filter);
        return true;
    }
    // #region QnA tools
    //takes a string with ~~ in it and replaces the ~~ with the word, then capitalizes the first letter of the string and returns it (incase the ~~ was at the beginning).
    static DeTildeify(inputString, word){
        if (typeof inputString !== 'string') {
            console.log("DeTildeify received a non-string input:", inputString);
            return '';
        }
        inputString = inputString.replace(/~~/g, word).trim();
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    }

    //getter for the question field.  TODO is this safe?
    static getQuestion(){
        return this.question;
    }

    //getter for the answers field.  Unpacks it into an array for safety.  TODO is this safe
    static getWords(){
        return this.rows ? this.rows.map(row => row[0]) : [];
    }

    //getter for the answers field.  Unpacks it into an array for safety.  TODO is this safe
    static getAnswers(){
        return this.answers ? [...this.answers] : [];
    }

    //getter/seter for the questionSearchParams field.
    static setSearchParam(param){
        this.questionSearchParams = param;
    }

    static getSearchParam(){
        return this.questionSearchParams;
    }

    static setRows(Rows){
        this.rows = Rows;
    }

    static getRows(){
        return this.rows;
    }

    static setLine(line, index){
        if (index >= 0 && index < this.rows.length) {
            this.rows[index] = line;
        } else {
            console.warn("setLine: index out of bounds", index);
        }
    }

    static getLine(index){
        if (index >= 0 && index < this.rows.length) {
            return this.rows[index];
        } else {
            console.warn("getLine: index out of bounds", index);
            return null;
        }
    }

    static getCorrectResponse(){
        return this.correctResponse;
    }

    // #endRegion
}

window.QnA = QnA;
globalThis.QnA = QnA;
/*
    //function to chack if a string is equal to the answer.
    export static isCorrectAnswer(answer){
        try {
            return answer === QnA.answers[0]; 
        } catch (e) {
            errorText = "Error: error, unable to check if answer is correct."
            setActiveIndex(State.error);
            return;
        }
    }




*/