//errorText holds a string that diplayed when a failed screen transition happens 
let errorText = "Error: no matching state";

//streak holds the number of correct answers in a row
let streak = 0;
let bestStreak = 0;

//records the index of the chosen question so it can be shown in the incorrect screen.
let selectedIndex = -1;

let runningMyWords = false;

//TODO add privacy  TODO check if error catchers work
//OnA is a class that holds the question, the possible answers, words associated with incorect answers and the getting/setting functions for those fields.
// index |   words           |  answers
//     0 | word for question | def of question
//     1 | word for 1        | def of w1
//     2 | word for 2        | def of w2
//     3 | word for 3        | def of w3

class QnA{
    //TODO replace all with rows
    //ex. What is an apple?
    static question ="";

    static rows = [];
    //ex. red fruit, orange fruit, green fruit, yellow fruit
    static answers = [];

    static correctResponse = "";
    static wrongResponse = "";

    static questionSearchParams = "";
    static minOccurences = 8;

  
    //curent call to generate a question, will be reworked in the game modes update
    static async generateQuestion(){
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
        this.rows = [];
        for (let i = 0; i < 4; i++) {
            let searchOutput = "";
            let searchOutputText = "";
            if(runningMyWords && i == 0){
                searchOutput = this.GenerateQuestionWInput(window.db2, "1=1", 0);

                searchOutputText = this.CheckAnswerValidity(searchOutput);
            }
            else{
                searchOutput = this.GenerateQuestionWInput(database, wordChoice, minOccurences);

                searchOutputText = this.CheckAnswerValidity(searchOutput);
            }


            if (!searchOutput) {
                errorText = "Error: No word found @ GenerateSQLQuestion";
                //setActiveIndex(State.error);
                console.log(errorText);
                this.question = errorText;
                return;
            }

            
            else if(searchOutputText == false){
                i--;
            }

            else if(searchOutputText.length == 0){
                errorText = "Error: No text found for word@ GenerateSQLQuestion";
                //setActiveIndex(State.error);
                console.log(errorText);
                this.question = errorText;
                return;
            }

            else{
                this.rows[i] = searchOutput;
                this.answers[i] = this.DeTildeify(searchOutputText, this.rows[0][0]);
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

        const replaceword = definition.toLowerCase()
            .replaceAll("\\b" + word + "\\b", "~~")
            .slice(1, -1);

        const splitAnswer = replaceword
            .split(/[;.]+/)
            .map(part => part.trim())
            .filter(part => part.length > 0);

        //filters bad answers
        //TODO build a better filter
        for (let i = 0; i < splitAnswer.length; i++) {
            const tempSplit = splitAnswer[i].split(/\s+/).filter(word => word.length > 0);
            if(tempSplit.length == 1  || // finds single word answers 
              (tempSplit.length == 2 && (tempSplit[0] === "a" || tempSplit[0] === "an" || tempSplit[0] === "of" || tempSplit[0] === "see" || tempSplit[0] === "see")) || //checks for bad answers in two size strings
              (tempSplit.length == 3 && (tempSplit[0] === "pertaining" || tempSplit[0] === "alt." || tempSplit[0] === "characterized" || (tempSplit[0] === "one" && tempSplit[1] === "who")))||
              (tempSplit.length == 4 && (tempSplit[0] === "the" && tempSplit[1] === "state" && tempSplit[2] === "of" && tempSplit[3] === "being"))||
              (tempSplit.length == 4 && (tempSplit[0] === "in" && tempSplit[3] === "manner"))||
              (tempSplit.length == 5 && (tempSplit[0] === "in" && tempSplit[1] === "the" && (tempSplit[2] === "form" || tempSplit[2] === "type" || tempSplit[2] === "manner") && tempSplit[3] === "of"))||
              (splitAnswer[i].length > 150))
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
        return QnA.question;
    }

    //getter for the answers field.  Unpacks it into an array for safety.  TODO is this safe
    static getWords(){
        return QnA.rows ? QnA.rows.map(row => row[0]) : [];
    }

    //getter for the answers field.  Unpacks it into an array for safety.  TODO is this safe
    static getAnswers(){
        return QnA.answers ? [...QnA.answers] : [];
    }

    //function to chack if a string is equal to the answer.
    static isCorrectAnswer(answer){
        try {
            return answer === QnA.answers[0]; 
        } catch (e) {
            errorText = "Error: error, unable to check if answer is correct."
            setActiveIndex(State.error);
            return;
        }
    }
    // #endRegion
}

class localDB {

    static addLine(line) {
        if (!window.db2) {
            errorText = "Error: db2 does not exist"
            return;
        }

        const selectStmt = window.db2.prepare(
            `SELECT 1 FROM myWords WHERE Word = ? AND Count = ? AND POS = ? AND Definition = ?`
        );
        selectStmt.bind([line[0], line[1], line[2], line[3]]);
        const exists = selectStmt.step();
        selectStmt.free();

        if (!exists) {
            const insertStmt = window.db2.prepare(
                `INSERT INTO myWords (Word, Count, POS, Definition, NumWrong) VALUES (?, ?, ?, ?, 1)`
            );
            insertStmt.run([line[0], line[1], line[2], line[3]]);
            insertStmt.free();
        } 
        
        else {
            const updateStmt = window.db2.prepare(
                `UPDATE myWords SET NumWrong = COALESCE(NumWrong, 0) + 1 WHERE Word = ? AND Count = ? AND POS = ? AND Definition = ?`
            );
            updateStmt.run([line[0], line[1], line[2], line[3]]);
            updateStmt.free();
        }
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
}

// #region functions-tools
//Loops the number from start to max
//No longer needs to be a function but I don't want to replace all uses
function wrapAround(num, start, max) {
    return ((num + start) % max);
}

//performs math operation on NNNpx format strings by unpacking the int, performing the operation, and repacking it.
function pxStringHandler(pxVal, operation) {
    const numVal = parseInt(pxVal, 10);
    let result = operation(numVal);
    return result + 'px';
}
//#endregion

const styles = {
    //TODO not sure quite what this does. 
    appShell: {
        minHeight: '100vh',
        maxHeight: '99%',
        maxWidth: '99%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxSizing: 'border-box',
        width: '100%',
    },

    // #region items first used in the control panel
    //style for control panel element, which holds and spaces other items
    optionsPanel: {
        width: '100%',
        maxWidth: '99%',
        minHeight: '20%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        marginBottom: '5px',
    },

    //style for the settings buttion
    settingsButton: {
        width: "80px",
        get height() { return this.width; },
        get minWidth() { return this.width; },
        get minHeight() { return this.width; },
        padding: '10px',
        fontSize: '1rem',
        marginLeft: 'auto',
        marginTop: '10px'
    },

    //style for the back button
    backButton: {
        width: "80px",
        get height() { return this.width; },
        get minWidth() { return this.width; },
        get minHeight() { return this.width; },
        marginTop: '10px',
        padding: '10px',
        fontSize: '1rem',
    },
    // #endregion
    
    //#region styles for menu panel elements
    
    //The following are also used elsewhere:
    //menu panel is also used in question panel
    //title is used for the text of the question being asked
    //rowbutton is used for the buttions that represent the possible answers

    //style for the element that holds the menu options.
    menuPanel: {
        width: '100%',
        maxWidth: '99%',
        height: '50%',
        maxHeight: '49%',
        marginTop: '0%',
        paddingTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 'auto',
    },

    //style for the big text of the title
    title: {
        alignSelf: 'center',
        fontSize: '7rem',
        marginTop: '0px',
        marginBottom: '0px',
    },

    //style for the tagline
    subtitle: {
        alignSelf: 'center',
        fontSize: '2rem',
        marginTop: '0px',
        marginBottom: '0px',
    },

    //style for the button that plays the game
    playButton: {
        width: "400px",
        get height() { return pxStringHandler(this.width, (val) => val / 4); },
        get minWidth() { return this.width; },
        get minHeight() { return this.height; },
        padding: '10px',
        fontSize: '3.5rem',
    },

    //style for the two buttons underneath the play button
    rowButton: {
        width: "195px",
        get height() { return pxStringHandler(this.width, (val) => val/2 + 2); },
        get minWidth() { return this.width; },
        get minHeight() { return this.height; },
        padding: '10px',
        fontSize: '1.5rem',
    },
    // #endregion

    //#region styles for the asking question screen
    //styles for question panel elements
        gridButton: {
        width: "345px",
        get height() { return pxStringHandler(this.width, (val) => val / 2 + 2); },
        get minWidth() { return this.width; },
        get minHeight() { return this.height; },
        padding: '10px',
        fontSize: '1.5rem',
    },

    //styles for streak panel elements, ie the streak text at the bottom of the screen
    StreakPanel: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        gap: '12px',
        width: '75%',
        margin: '0 auto 5px',
        flexDirection: 'row',
    },
    //#endregion

    questionTypeButtion: {
        width: "600px",
        get height() { return pxStringHandler(this.width, (val) => val / 4); },
        get minWidth() { return this.width; },
        get minHeight() { return this.height; },
        padding: '10px',
        fontSize: '3.5rem',
    },
};

//This object represents an enum for the different program states.
const State = {
    menu: 0,
    question: 1,
    correctAnswer: 2,
    wrongAnswer: 3,
    chooseQuestion: 4,
    myWords: 5,
    error: 6
};

//form is the funtion that index actually runs
function Form() {

    //creates the activeindex variable
    const [activeIndex, setActiveIndex] = React.useState(State.menu);

    //TODO add mechanism to save the question text and answer text to a higher level, so that it can be used in the correct/wrong answer panels
    //TODO add a mechanism to save the user's score for next time

    //content is a variable that holds the content to be returned so it can be passed into appshell once
    let content;

    //Uses custom panels and a state index to make a single page application.  States are obviously named.
    switch (activeIndex) {
        case State.menu:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <MenuPanel></MenuPanel>
                </React.Fragment>
            );
        break;
        
        case State.question:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <QuestionPanel></QuestionPanel>
                <StreakPanel></StreakPanel>
                </React.Fragment>
            );
        break;

        case State.correctAnswer:
            content = (        
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <CorrectAnswerPanel></CorrectAnswerPanel>
                <StreakPanel></StreakPanel>
                </React.Fragment>
            );
        break;

        case State.wrongAnswer:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <WrongAnswerPanel></WrongAnswerPanel>
                <StreakPanel></StreakPanel>
                </React.Fragment>
            );
        break;

        case State.chooseQuestion:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <ChooseQuestionTypePanel></ChooseQuestionTypePanel>
                </React.Fragment>
            );
        break;

        case State.myWords:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <MyWordsPanel></MyWordsPanel>
                </React.Fragment>
            );
        break;

        default:
            content = (
                <React.Fragment>
                <ControlPanel />
                <h2>{errorText}</h2>
                </React.Fragment>
            );
            errorText = "Error: no matching state"
    }

    return <div style={styles.appShell}>{content}</div>;

    //TODO why does panel functs have to be in form? 
    //#region functions for the different states.
    //MenuPanel is the HTML for the menu state
    function MenuPanel() {
        return (
            <section style={styles.menuPanel} className="menu-panel">

                <h2 style={styles.title}>Biblioguesser</h2>

                <h3 style={styles.subtitle}>How big is your lexicon?</h3>

                <button style={styles.playButton} onClick={() => setActiveIndex(State.chooseQuestion)}>PLAY!</button>

                <section style={{ display: 'flex', alignItems: 'center' }}>

                    <button style={styles.rowButton} onClick={() => {runningMyWords = true; setActiveIndex(State.myWords)}}>My Words</button>

                    <div style = {{width: '10px'}}></div>

                    <button style={styles.rowButton} onClick={() => setActiveIndex(State.error)}>Daily Challenge</button>

                </section>

            </section>
        );
    }

    //ControlPanel is the HTML for the control panel state, ie the options bar at the top.
    function ControlPanel() {
        return (
            <section style={styles.optionsPanel} className="control-panel">
                
                {/* this is an if statement that only shows the button if the first condition is true */}
                {activeIndex !== State.menu && (
                    <button style={styles.backButton} onClick={() => {if(streak > bestStreak){bestStreak = streak}; streak=0; if (runningMyWords === true) { runningMyWords = false;} setActiveIndex(State.menu)}}>Return</button>
                )}

                <button style={styles.settingsButton} onClick={() => setActiveIndex(State.error)}>Settings</button>

            </section>
        );
    }

    //StreakPanel is the HTML for the streak panel state, ie the streak text at the bottom.
    function StreakPanel() {
        return (
            <section style={styles.StreakPanel} className="streak-panel">

                <p>Streak: {streak}</p>
                
                {activeIndex == State.wrongAnswer && (
                    <p>Best Streak: {bestStreak}</p>
                )}

            </section>
        );
    }

    //chooseQuestionPanel is the HTML for the choose question panel
    function ChooseQuestionTypePanel() {
        return (
            <section style={styles.menuPanel} className="Choose-Question-type-panel">
                
                <h2> Choose Mode: </h2>
                
                <section style={ {display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'flex-start'}}>
                    
                    <button style={styles.questionTypeButtion} onClick={() => {QnA.questionSearchParams = "1=1"; setActiveIndex(State.question)}}>All Words</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButtion} onClick={() => {QnA.questionSearchParams = "POS = 'a.'"; setActiveIndex(State.question)}}>Adjectives Only</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButtion} onClick={() => {QnA.questionSearchParams = "POS = 'adv.'"; setActiveIndex(State.question)}}>Adverbs Only</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButtion} onClick={() => {QnA.questionSearchParams = "POS = 'n.'"; setActiveIndex(State.question)}}>Nouns Only</button>
                   
                    <div style = {{width: '10px'}}></div>
                    
                    <button style={styles.questionTypeButtion} onClick={() => {QnA.questionSearchParams = "POS = 'v.'"; setActiveIndex(State.question)}}>Verbs Only</button>
                 
                    <div style = {{width: '10px'}}></div>
                    
                    <button style={styles.questionTypeButtion} onClick={() => {QnA.questionSearchParams ="POS = 'v.' or POS = 'v. t.' or POS = 'v. i.' or POS = 'imp.'"; setActiveIndex(State.question)}}>All Verb Types</button>

                </section>

            </section>
        );
    }


    //TODO save the question text and answer text to a higher level, so that it can be used in the correct/wrong answer panels
    //TODO add a funtion that generates a new question

    //QuestionPanel is the HTML for the QestionPanel state
    function QuestionPanel() {
        const [questionContainer, setQuestionContainer] = React.useState(QnA.getQuestion());
        const [buttonContainer, setButtonContainer] = React.useState({
            answers: ['', '', '', ''],
            onPressess: [() => {}, () => {}, () => {}, () => {}]
        });

        React.useEffect(() => {
            let mounted = true;
            async function loadQuestion() {
                await QnA.generateQuestion();
                if (!mounted) return;
                setQuestionContainer(QnA.getQuestion());
                setButtonContainer(giveQuestionValues());
            }
            loadQuestion();
            return () => { mounted = false; };
        }, []);
        return (
            <section style={styles.menuPanel} className="question-panel">

                <h2 style={styles.title}>{questionContainer}</h2>

                {/* first row of buttons */}
                <section style={{ display: 'flex', alignItems: 'center' }}>

                    <button style={styles.gridButton} onClick={buttonContainer.onPressess[0]}>{buttonContainer.answers[0]}</button>
                    
                    <div style = {{width: '10px'}}></div>
                    
                    <button style={styles.gridButton} onClick={buttonContainer.onPressess[1]}>{buttonContainer.answers[1]}</button>
                
                </section>

                {/* second row of buttons */}
                <section style={{ display: 'flex', alignItems: 'center' }}>

                    <button style={styles.gridButton} onClick={buttonContainer.onPressess[2]}>{buttonContainer.answers[2]}</button>
                
                    <div style = {{width: '10px'}}></div>
                
                    <button style={styles.gridButton} onClick={buttonContainer.onPressess[3]}>{buttonContainer.answers[3]}</button>

                    
            
                </section>
        
            </section>
        );
    }

    //TODO show the correct answer in the correct/wrong answer panels
    //TODO add a mechanism to save the user's score for next time, and show it in the correct/wrong answer panels

    //CorrectAnswerPanel is the html for the correct answer state
    function CorrectAnswerPanel() {
        streak++;
        return (
            <section className="correct-answer-panel" style={styles.menuPanel}>

                <h1 style = {styles.title}>Correct!</h1>

                <section style={styles.menuPanel}>       

                    <h1> {QnA.correctResponse +":"} </h1>

                    <h1>{QnA.getAnswers()[0]}</h1>

                </section>

                <section style={styles.menuPanel}>

                    <button style = {styles.playButton} onClick={() => setActiveIndex(State.question)}>Next Word?</button>
                
                </section>
            
            </section>
        );
    }

    //TODO show the correct answer in the correct/wrong answer panels
    //TODO add a mechanism to save the user's score for next time, and show it in the correct/wrong answer panels

    //WrongAnswerPanel is the html for the wrong answer state
    function WrongAnswerPanel() {
        if(streak > bestStreak){
            bestStreak = streak;
        }
        streak = 0;
        localDB.addLine(QnA.rows[0]);
        localDB.addLine(QnA.rows[selectedIndex]);
        return (
            <section className="wrong-answer-panel" style={styles.menuPanel}>
                            
                <h1 style = {styles.title}>Incorrect!</h1>
        
                <section style={styles.menuPanel}>   

                    <h1> {"You chose: " + QnA.getAnswers()[selectedIndex].slice(0, -1) + ", which is associated with the word: " +  QnA.getWords()[selectedIndex] } </h1>

                    <h1> {"The correct answer for " + QnA.getWords()[0]+" is: " + QnA.getAnswers()[0]} </h1>
        
                </section>
        
                <section style={{ display: 'flex', alignItems: 'center' }}>
        
                    <button style = {styles.playButton} onClick={() => setActiveIndex(State.question)}>Next Word?</button>  
        
                </section>
            
            </section>
        );
    }


    //myWordsPanel is a screen that shows you the words you got incorrect
    function MyWordsPanel() {
        const textStr = localDB.stringOfIncorrectWords(window.db2);
        if(textStr === "No incorrect words"){
            return(
                <section className="wrong-words-panel" style={styles.menuPanel}>
                    <h1 style = {styles.title}>This is where I'd keep my incorrect words.{"\n"}IF I HAD ANY!</h1>
                </section>
                );
        }
        //TODO change the <pre></pre>
        else{
            return (
                <section className="wrong-words-panel" style={styles.menuPanel}>
                                
                <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', width: '100%', maxWidth: '99%' }}>
                    {textStr}
                </pre>
            
                    <section style={{ display: 'flex', alignItems: 'center' }}>
            
                        <button style = {styles.playButton} onClick={() => setActiveIndex(State.question)}>Test Your Words?</button>  
            
                    </section>
                
                </section>
            );
        }
    }

    //this funtion makes an object that holds 2 arrays of 4, the answers and their associated buttions, where answers[0] is associated with onPresses[0]

    function giveQuestionValues(){
        const container = {answers: [], onPressess: []};

        const localAnswers = QnA.getAnswers();

        let randomNum = Math.floor(Math.random()*4);

        for(let i = 0; i < 4; i++){
            container.answers[wrapAround(i, randomNum, 4)] = localAnswers[i];
            if(i === 0){
                container.onPressess[wrapAround(i, randomNum, 4)] = (() => {setActiveIndex(State.correctAnswer); selectedIndex = i});
            }

            else{
                container.onPressess[wrapAround(i, randomNum, 4)] = (() => {setActiveIndex(State.wrongAnswer); selectedIndex = i});
            }
        }
        
        return container;
    }
    //#endregion
}