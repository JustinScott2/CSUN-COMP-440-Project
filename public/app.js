//errorText holds a string that diplayed when a failed screen transition happens 
let errorText = "Error: no matching state";

//TODO add privacy  TODO check if error catchers work
//OnA is a class that holds the question, the possible answers, words associated with incorect answers and the getting/setting functions for those fields.
// index |   words           |  answers
//     0 | word for question | def of question
//     1 | word for 1        | def of w1
//     2 | word for 2        | def of w2
//     3 | word for 3        | def of w3

class QnA{
    //ex. What is an apple?
    static question ="";
    //ex. apple, orange, lime, lemon
    static words = [];
    //ex. red fruit, orange fruit, green fruit, yellow fruit
    static answers = [];
  
    //curent call to generate a question, will be reworked in the game modes update
    static async generateQuestion(){
        await window.dbPromise; // Ensure the database is loaded before generating a question
        await this.GenerateNounQuestion();
    }

    //pulls a random line from the db and adds the word to question field.
    static tempGenerateSqlQuestion(){
        //if no db found, move to error state
        if (!window.db) {
            errorText = "Error: Dictionary not found"
            setActiveIndex(State.error);
            return;
        }

        //makes a list of tables in the doc that are not metadata, in this case it can only be the dictionary, but could cause issues if another table is added.
        const tables = window.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
        //if the table has no length or has no values, move to error state.  This will not happen in current version but is good practice.
        if (!tables.length || !tables[0].values.length) {
            errorText = "Error: No table found in dictionary.db";
            setActiveIndex(State.error);
            return;
        }

        //extracts the name of the first table.  This my not work for multiple tables. 
        const tableName = tables[0].values[0][0];

        //question holder holds a random line selected from the previously discovered table.  This will not be random if records are deleted from the table.
        const qestionHolder = window.db.exec('SELECT * FROM "' + tableName + '" WHERE rowid = abs(random()) % (SELECT count(*) FROM "' + tableName + '") + 1');
        
        //if no row is found, set error
        if (!qestionHolder.length || !qestionHolder[0].values.length) {
            errorText = "Error: No data found in dictionary.db";
            setActiveIndex(State.error);
            return;
        }

        //sets row equal to an array of the values of question holder. 
        const row = qestionHolder[0].values[0];
        
        //sets question equal to the word and the correct answer equal to its definition.  
        QnA.question = `What is ${row[0]}?`;
        QnA.answers = [row[3], "Wrong", "Wrong", "Wrong"];
    }

    static GenerateQuestionWInput(SQLSelection){

        //if no db found, move to error state
        if (!window.db) {
            errorText = "Error: Dictionary not found"
            //setActiveIndex(State.error);
            console.log(errorText);
            return;
        }

        //makes a list of tables in the doc that are not metadata, in this case it can only be the dictionary, but could cause issues if another table is added.
        const tables = window.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
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
            const query = `SELECT * FROM "${safeTableName}" WHERE ${selection} ORDER BY random() LIMIT 1`;
            console.log('QnA: executing query ->', query);
            qestionHolder = window.db.exec(query);
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

    static GenerateNounQuestion(){
        this.words = [];
        this.answers = [];
        for (let i = 0; i < 4; i++) {
            const searchOutput = this.GenerateQuestionWInput("POS = 'n.'");
            const searchOutputText = this.CheckAnswerValidity(searchOutput[3]);
            
            if (!searchOutput) {
                errorText = "Error: No word found @ GenerateNounQuestion";
                //setActiveIndex(State.error);
                console.log(errorText);
                this.question = errorText;
                return;
            }

            else if(searchOutputText == false){
                i--;
            }

            else if(searchOutputText.length == 0){
                errorText = "Error: No text found for word@ GenerateNounQuestion";
                //setActiveIndex(State.error);
                console.log(errorText);
                this.question = errorText;
                return;
            }

            else{
                this.words[i] = searchOutput[0];
                this.answers[i] = searchOutputText;
            }
        }
        this.question = "What is " + this.words[0] + "?";
    }

    //finds the first good definition of a word.  if no good definition is found, returns false.  This is to avoid bad definitions like "a type of" or "see also"
    static CheckAnswerValidity(searchOutput){
        //replaces the word in the def with the word we are testing
        const replaceword = searchOutput.replaceAll("\\b" + searchOutput[0] + "\\b", "~~");

        //splits the answer to account for multiple defs
        const splitAnswer = replaceword.split("; ");

        //filters bad answers
        for (let i = 0; i < splitAnswer.length; i++) {
            const tempSplit = splitAnswer[i].toLowerCase().split(" ").filter(word => word.length > 0);
            if(tempSplit.length == 1 /* finds single word answers */ || 
              (tempSplit.length == 2 && (tempSplit[0] === "a" || tempSplit[0] === "an" || tempSplit[0] === "of" || tempSplit[0] === "see")) /*checks for bad answers in two size strings*/||
              (tempSplit.length == 3 && (tempSplit[0] === "pertaining" || tempSplit[0] === "alt." || tempSplit[0] === "characterized"))||
              (tempSplit.length == 4 && (tempSplit[0] === "the" && tempSplit[1] === "state" && tempSplit[2] === "of" && tempSplit[3] === "being"))||
              (tempSplit.length == 5 && (tempSplit[0] === "in" && tempSplit[1] === "the" && (tempSplit[2] === "form" || tempSplit[2] === "type" || tempSplit[2] === "manner") && tempSplit[3] === "of")))
            {

            }
            else{
                return replaceword;
            }
        }
        return false;
    }

    //a question generating funtion that sets the questions and answers to pre-written answers for testing purposes
    static tempGenerateQuestion(){
        let randomNum = Math.floor(Math.random()*4);
        switch (randomNum) {
        case 0:
            QnA.question = "What is an apple?";
            QnA.answers = ["red fruit", "green fruit", "blue fruit", "purple fruit"]
        break; 
        case 1:
            QnA.question = "What is an oubliette?";
            QnA.answers = ["An oubliette is a secret, underground dungeon in a castle or fortress designed so that the only entrance or exit is a trap door in the ceiling",
                            "An oubliette is a broad, scarf-like neckband worn by men, tucked into the collar of a shirt.",
                            "Oubliette refers to a genus of drought-tolerant shrubs, trees, and plants in the asparagus family native to the Americas.",
                            "The oubliette is a smooth, progressive ballroom dance characterized by long, continuous, flowing movements across the floor."];
        break;
        case 2:
            QnA.question = "A horse is a ?";
            QnA.answers = ["mammal",
                            "bird",
                            "fish",
                            "dinosaur"]
        break;
        case 3:
            QnA.question = "What does Cantankerous mean?";
            QnA.answers = ["Cantankerous describes someone who is bad-tempered, argumentative, uncooperative, and difficult to deal with.",
                            "Cantankerous describes something related to or affected by cancer",
                            "Cantankerous describes making a loud and confused noise",
                            "Cantankerous describes making a continuous loud banging or ringing sound"]
        break;
        }
    }
    
    //getter for the question field.  TODO is this safe?
    static getQuestion(){
        return QnA.question;
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

//This object represents an enum for the different program states.
const State = {
    menu: 0,
    question: 1,
    correctAnswer: 2,
    wrongAnswer: 3,
    error: 4
};

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
        marginBottom: '24px',
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
    //#endregion
};

//form is the funtion that inex actually runs
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
                </React.Fragment>
            );
        break;

        case State.correctAnswer:
            content = (        
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <CorrectAnswerPanel></CorrectAnswerPanel>
                </React.Fragment>
            );
        break;

        case State.wrongAnswer:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <WrongAnswerPanel></WrongAnswerPanel>
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

                <button style={styles.playButton} onClick={() => setActiveIndex(State.question)}>PLAY!</button>

                <section style={{ display: 'flex', alignItems: 'center' }}>

                    <button style={styles.rowButton} onClick={() => setActiveIndex(State.error)}>My Words</button>

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
                    <button style={styles.backButton} onClick={() => setActiveIndex(State.menu)}>Return</button>
                )}

                <button style={styles.settingsButton} onClick={() => setActiveIndex(State.error)}>Settings</button>

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
        return (
            <section className="correct-answer-panel">

                <h1 style = {styles.title}>{QnA.getQuestion()}</h1>

                <section style={{ display: 'flex', alignItems: 'center' }}>

                    <h2>Correct Answer!</h2>

                    <div style = {{width: '30px'}}></div>

                    <h3>{QnA.getAnswers()[0]}</h3>

                </section>

                <section style={{ display: 'flex', alignItems: 'center' }}>

                    <button style = {styles.playButton} onClick={() => setActiveIndex(State.question)}>Next Word?</button>
                
                </section>
            
            </section>
        );
    }

    //TODO show the correct answer in the correct/wrong answer panels
    //TODO add a mechanism to save the user's score for next time, and show it in the correct/wrong answer panels

    //WrongAnswerPanel is the html for the wrong answer state
    function WrongAnswerPanel() {
        return (
            <section className="wrong-answer-panel">
            
                <h1 style = {styles.title}>{QnA.getQuestion()}</h1>
        
                <section style={{ display: 'flex', alignItems: 'center' }}>
        
                    <h2>Wrong Answer!</h2>
        
                    <div style = {{width: '30px'}}></div>
        
                    <h3>{QnA.getAnswers()[0]}</h3>
        
                </section>
        
                <section style={{ display: 'flex', alignItems: 'center' }}>
        
                    <button onClick={() => setActiveIndex(State.question)}>Next Word?</button>  
        
                </section>
        
            </section>
        );
    }

    //this funtion makes an object that holds 2 arrays of 4, the answers and their associated buttions, where answers[0] is associated with onPresses[0]

    function giveQuestionValues(){
        const container = {answers: [], onPressess: []};

        const localAnswers = QnA.getAnswers();

        let randomNum = Math.floor(Math.random()*4);

        for(let i = 0; i < 4; i++){
            container.answers[wrapAround(i, randomNum, 4)] = localAnswers[i];

            if(i === 0){
                container.onPressess[wrapAround(i, randomNum, 4)] = (() => setActiveIndex(State.correctAnswer));
            }

            else{
                container.onPressess[wrapAround(i, randomNum, 4)] = (() => setActiveIndex(State.wrongAnswer));
            }
        }
        
        return container;
    }
    //#endregion
}