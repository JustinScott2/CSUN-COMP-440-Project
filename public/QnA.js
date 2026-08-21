class QnA {
    //ex. What is an apple?
    static question = "";

    //the raw output from the file. Formatted Word,Count,POS,Definition and four long, where 0 is the correct set. used for the raw data and to pull the words
    static rows = [];
    
    //formatted defintions for the words.
    static answers = [];

    //var that holds the text for correct responses.
    static correctResponse = "";

    //var that holds what is being searched for.  This is the main way the different classic ways are separated
    static questionSearchParams = "";

    //var that tells the search to ignore word-def combos that appear in less than this amount of dictionaries.
    static minOccurences = 8;

    //wrapper for generating questions
    static async generateQuestion() {
        await window.dbPromise; // Ensure the database is loaded before generating a question
        await this.GenerateSQLQuestion(window.db, this.questionSearchParams, this.minOccurences);
    }

    //Takes an input selection and finds a row that matches.
    static GenerateQuestionWInput(database, SQLSelection, minOccurences) {

        //if no db found, move to error state
        if (!database) {
            errorText = "Error: Dictionary not found"
            console.log(errorText);
            return;
        }

        //makes a list of tables in the doc that are not metadata, in this case it can only be the dictionary, but could cause issues if another table is added.
        const tables = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
        //if the table has no length or has no values, move to error state.  This will not happen in current version but is good practice.
        if (!tables.length || !tables[0].values.length) {
            errorText = "Error: No table found in dictionary.db" + tables.length + " " + tables[0].values.length;
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
                SQLSelection = '1';
            }
            if (SQLSelection.includes(';')) {
                throw new Error('SQLSelection contains disallowed characters');
            }

            // escape any double-quotes inside the table name
            const safeTableName = tableName.replace(/"/g, '""');
            // Sanitizes the query 
            const selection = SQLSelection.replace(/POS\s*=\s*'([^']+)'/i, (match, val) => `REPLACE(POS, '"', '') = '${val}'`);
            //sanitizes minOccurences
            const safeMinCount = Number.isFinite(Number(minOccurences)) ? Number(minOccurences) : 0;
            const query = `SELECT * FROM "${safeTableName}" WHERE ${selection} AND Count >= ${safeMinCount} ORDER BY random() LIMIT 1`;
            qestionHolder = database.exec(query);
        } catch (e) {
            console.error('QnA: SQL execution error', e);
            errorText = 'Error: SQL execution failed';
            console.log(errorText);
            return;
        }

        //if no row is found, set error
        if (!qestionHolder || !qestionHolder.length || !qestionHolder[0].values.length) {
            errorText = "Error: No data found in dictionary.db";
            console.log(errorText);
            return;
        }

        //returns the found values
        return qestionHolder[0].values[0];
    }

    //finds four good lines
    static GenerateSQLQuestion(database, wordChoice, minOccurences){
        //zero out rows and answers
        this.setRows([]);
        this.setAnswers([]);

        //runs until four answers that are not invalid are found
        for (let i = 0; i < 4; i++) {

            //temporary vars to hold outputs
            let searchOutput = "";
            let searchOutputText = "";

            //if we are doing a review game
            if(currentGameMode === gameModes.myWords && i == 0){
                searchOutput = this.GenerateQuestionWInput(window.db2, "1=1", 0);
            }

            //if we are doing any other kinds of games.
            else{
                searchOutput = this.GenerateQuestionWInput(database, wordChoice, minOccurences);
            }

            //if no db response is found, set error
            if (!searchOutput) {
                errorText = "Error: No word found @ GenerateSQLQuestion";
                console.log(errorText);
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
                console.log(errorText);
                this.question = errorText;
                return;
            }

            else{
                this.setLine(searchOutput, i);
                this.setAnswer(searchOutputText, i);
            }
        }
        this.setQuestion(this.rows[0][0]);
    }

    //finds the first good definition of a word.  if no good definition is found, returns false.  This is to avoid bad definitions like "a type of" or "see also"
    static CheckAnswerValidity(searchOutput){

        //checks for invalid input type.
        if (!Array.isArray(searchOutput) || searchOutput.length < 4) {
            console.warn("Invalid search output passed to CheckAnswerValidity:", searchOutput);
            return false;
        }

        const word = String(searchOutput[0] || '').toLowerCase();
        const definition = typeof searchOutput[3] === 'string' ? searchOutput[3] : '';

        //error check for no definition
        if (!definition.trim()) {
            console.warn("No definition found for word:", searchOutput[0]);
            return false;
        }

        //removes period from common abbreviations
        let replaceword = definition.toLowerCase()
                                    .replaceAll("\\b" + word + "\\b", "~~")
                                    .replaceAll("alt.","alt")
                                    .replaceAll("eg.", "eg")
                                    .replaceAll("ie.", "ie")
                                    .replaceAll("esp.", "esp")
                                    .replaceAll(" n."," n")
                                    .replaceAll("(n.","(n")
                                    .trim();

        //removes first char if it is a ".                            
        if (replaceword.charAt(0) === '"') {
            replaceword = replaceword.slice(1);
        }
        
        //removes last char if it is a ;.  
        if (replaceword.charAt(replaceword.length - 1) === ';') {
            replaceword = replaceword.slice(0, -1).trim();
        }

        //splits the defitions into single definitions
        const splitAnswer = replaceword
            .split(/[;.]+/)
            .map(part => part.trim())
            .filter(part => part.length > 0);

        //filters out bad answers
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
    
    //takes an input string and returns true if it matches any of theb filters.  There is probably a better way but I could not find it.
    static TextFilter(inputString) {
        const tempSplit = inputString.split(/\s+/).filter(word => word.length > 0);
        const filters = [ (tempSplit.length == 1), 
                          (tempSplit.length == 2), 
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

    static getQuestion(){
        return this.question;
    }

    static setQuestion(newQuestion){
        if (typeof newQuestion === 'string') {
            this.question = "What is " + newQuestion + "?";
            this.correctResponse = "the definition of " + this.aOrAn(newQuestion) + " " + newQuestion + " is";
        }
    }
    
    static aOrAn(word) {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        return vowels.includes(word[0].toLowerCase()) ? 'an' : 'a';
    }

    static getWords(){
        return this.rows ? this.rows.map(row => row[0]) : [];
    }

    static getAnswers(){
        return this.answers ? [...this.answers] : [];
    }

    static setAnswers(answers){
        if (Array.isArray(answers) && answers.length === 4) {
            this.answers = [...answers];
        }
    }

    static setAnswer(answer, index){
        if (index >= 0 && index < 4) {
            this.answers[index] = answer;
        } else {
            console.warn("setAnswer: index out of bounds: ", index);
        }
    }
    
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
        if (index >= 0 && index < 4) {
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