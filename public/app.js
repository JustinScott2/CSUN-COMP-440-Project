//errorText holds a string that diplayed when a failed screen transition happens 
let errorText = "Error: no matching state";

//streak holds the number of correct answers in a row
let streak = 0;
let bestStreak = 0;

//records the index of the chosen question so it can be shown in the incorrect screen.
let selectedIndex = -1;

let dailyScore = 0;

//#region daily words section.  If more Daily word funtions are added, they should be put in a separate file.
    async function getDailies() {
        await window.dbPromise3; // Ensure the database is loaded before generating a question
        return PullDailyWords(window.db3);
    }

    function PullDailyWords(database) {

        //if no db found, move to error state
        if (!database) {
            errorText = "Error: Daily Words not found"
            console.log(errorText);
            return;
        }

        //makes a list of tables in the doc that are not metadata, in this case it can only be the dictionary, but could cause issues if another table is added.
        const tables = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
        //if the table has no length or has no values, move to error state.  This will not happen in current version but is good practice.
        if (!tables.length || !tables[0].values.length) {
            errorText = "Error: No table found in DailyWords.db" + tables.length + " " + tables[0].values.length;
            //setActiveIndex(State.error);
            console.log(errorText);
            return;
        }


        const today = new Date();

        const yyyy = String(today.getFullYear());
        const mm = String(today.getMonth() + 1); 
        const dd = String(today.getDate()); 

        const formattedDate = `${dd}/${mm}/${yyyy}`;
        const debugDate = "10/10/2026"; //TODO DELETE before release 

        //extracts the name of the first table.  This my not work for multiple tables. 
        const tableName = tables[0].values[0][0];

        //question holder holds a random line selected from the previously discovered table.
        let qestionHolder;

        try {
            // escape any double-quotes inside the table name
            const safeTableName = tableName.replace(/"/g, '""');
            const query = `SELECT * FROM "${safeTableName}" WHERE DATE = '${debugDate}' ORDER BY wordOrder`;
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
            errorText = "Error: No data found in DailyWords.db";
            //setActiveIndex(State.error);
            console.log(errorText);
            return;
        }

        //returns the found values
        let returner = [];
        qestionHolder[0].values.forEach((row, x) => {
            returner[x] = [row[1], row[4]];
        });
        //TODO delete this
        /*let tempText = "";
        for (let i = 0; i < returner.length; i++) {
            if(i<9){
                tempText += "0"; 
            }
            tempText += (i + 1) + "| " + returner[i][0] + ": " + returner[i][1] + "\n";
        }*/  
        return returner; 
    }
//#endregion

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

let dailyWords = [];
getDailies().then(words => {
    dailyWords = words || [];
});
let DWOffset = 0;

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

    settingsWrapper: {
        position: 'relative',
        marginLeft: 'auto',
    },

    //TODO verify
    menuStyle: {
        position: 'absolute',  
        top: '100%',
        left: 0,
        zIndex: 10,           
        width: '80px',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },

    itemStyle: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '8px 8px',
        cursor: 'pointer',
        display: 'block',
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

    questionTypeButton: {
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
    dailyEnd: 6,
    error: 7
};

const gameModes = {
    classic: 0,
    daily: 1,
    myWords: 2
};
let currentGameMode = gameModes.classic;

//form is the funtion that index actually runs
function Form() {

    //creates the activeindex variable
    const [activeIndex, setActiveIndex] = React.useState(State.menu);

    //#region dropdown menu functions

    const [isOpen, setIsOpen] = React.useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);
    //#endregion

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

        case State.dailyEnd:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <DailyEndPanel></DailyEndPanel>
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
        async function loadDailies() {
            dailyWords = await getDailies();
        }
        loadDailies();
        return (
            <section style={styles.menuPanel} className="menu-panel">

                <h2 style={styles.title}>Biblioguesser</h2>

                <h3 style={styles.subtitle}>How big is your lexicon?</h3>

                <button style={styles.playButton} onClick={() => setActiveIndex(State.chooseQuestion)}>PLAY!</button>

                <section style={{ display: 'flex', alignItems: 'center' }}>

                    <button style={styles.rowButton} onClick={() => {currentGameMode = gameModes.myWords; setActiveIndex(State.myWords)}}>My Words</button>

                    <div style = {{width: '10px'}}></div>

                    <button style={styles.rowButton} onClick={() => {currentGameMode = gameModes.daily; setActiveIndex(State.question)}}>Daily Challenge</button>

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
                    <button style={styles.backButton} onClick={() => {if(streak > bestStreak){bestStreak = streak}; streak=0; if(currentGameMode === gameModes.daily){DWOffset = 0; dailyScore = 0}; currentGameMode = gameModes.classic; setActiveIndex(State.menu)}}>Return</button>
                )}

                <div style={styles.settingsWrapper}>
                    <button style={styles.settingsButton} onClick={toggleDropdown}>Settings</button>

                    {isOpen && (
                        <ul style={styles.menuStyle}>
                            <li style={styles.itemStyle} onClick={() => setIsOpen(false)}>Action 1</li>
                            <li style={styles.itemStyle} onClick={() => setIsOpen(false)}>Action 2</li>
                            <li style={styles.itemStyle} onClick={() => setIsOpen(false)}>Action 3</li>
                        </ul>
                    )}
                </div>
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
                    
                    <button style={styles.questionTypeButton} onClick={() => {QnA.setSearchParam("1=1"); setActiveIndex(State.question)}}>All Words</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButton} onClick={() => {QnA.setSearchParam("POS = 'a.'"); setActiveIndex(State.question)}}>Adjectives Only</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButton} onClick={() => {QnA.setSearchParam("POS = 'adv.'"); setActiveIndex(State.question)}}>Adverbs Only</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButton} onClick={() => {QnA.setSearchParam("POS = 'n.'"); setActiveIndex(State.question)}}>Nouns Only</button>
                   
                    <div style = {{width: '10px'}}></div>
                    
                    <button style={styles.questionTypeButton} onClick={() => {QnA.setSearchParam("POS = 'v.'"); setActiveIndex(State.question)}}>Verbs Only</button>
                 
                    <div style = {{width: '10px'}}></div>
                    
                    <button style={styles.questionTypeButton} onClick={() => {QnA.setSearchParam("(POS = 'v.' or POS = 'v. t.' or POS = 'v. i.' or POS = 'imp.')"); setActiveIndex(State.question)}}>All Verb Types</button>

                </section>

            </section>
        );
    }


    //TODO save the question text and answer text to a higher level, so that it can be used in the correct/wrong answer panels
    //TODO add a funtion that generates a new question

    //QuestionPanel is the HTML for the QestionPanel state
    function QuestionPanel() {
        const [questionContainer, setQuestionContainer] = React.useState('');
        const [buttonContainer, setButtonContainer] = React.useState({
            answers: ['', '', '', ''],
            onPressess: [() => {}, () => {}, () => {}, () => {}]
        });
        
        React.useEffect(() => {
            let mounted = true;

            async function loadQuestion() {
                if (currentGameMode === gameModes.daily) {
                    if (!mounted || !dailyWords) return;
                    QnA.setQuestion(dailyWords[DWOffset][0]);
                    QnA.setAnswers([
                        dailyWords[DWOffset][1],
                        dailyWords[DWOffset + 1][1],
                        dailyWords[DWOffset + 2][1],
                        dailyWords[DWOffset + 3][1]
                    ]);
                    QnA.setRows([
                        [dailyWords[DWOffset][0], "X", "X", dailyWords[DWOffset][1]],
                        [dailyWords[DWOffset + 1][0], "X", "X", dailyWords[DWOffset + 1][1]],
                        [dailyWords[DWOffset + 2][0], "X", "X", dailyWords[DWOffset + 2][1]],
                        [dailyWords[DWOffset + 3][0], "X", "X", dailyWords[DWOffset + 3][1]]
                    ]);
                    setQuestionContainer(QnA.getQuestion());
                    setButtonContainer(giveQuestionValues());
                    return;
                }

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
        let tempButtonText = "Next Word?";
        let tempOnClick = () => {setActiveIndex(State.question)};
        if(currentGameMode === gameModes.myWords){
            localDB.UpdateLineCorrect(QnA.getLine(0), QnA.getAnswers()[0]/*TODO this might not work*/);
            if(localDB.IsMyWordsEmpty(window.db2)){
                tempButtonText = "Return to Menu";
                tempOnClick = () => {currentGameMode = gameModes.classic; setActiveIndex(State.menu)};
            }
        }
        return (
            <section className="correct-answer-panel" style={styles.menuPanel}>

                <h1 style = {styles.title}>Correct!</h1>

                <section style={styles.menuPanel}>       

                    <h1> {QnA.getCorrectResponse() +":"} </h1>

                    <h1>{QnA.getAnswers()[0]}</h1>

                </section>

                <section style={styles.menuPanel}>

                    <button style = {styles.playButton} onClick={() => {tempOnClick(); if(currentGameMode === gameModes.daily){DWOffset += 4}}}>{tempButtonText}</button>
                
                </section>
            
            </section>
        );
    }

    //TODO show the correct answer in the correct/wrong answer panels
    //TODO add a mechanism to save the user's score for next time, and show it in the correct/wrong answer panels

    //WrongAnswerPanel is the html for the wrong answer state
    function WrongAnswerPanel() {
        localDB.UpdateLineIncorrect(QnA.getLine(0), QnA.getAnswers()[0]);
        localDB.UpdateLineIncorrect(QnA.getLine(selectedIndex), QnA.getAnswers()[selectedIndex]);
        return (
            <section className="wrong-answer-panel" style={styles.menuPanel}>
                            
                <h1 style = {styles.title}>Incorrect!</h1>
        
                <section style={styles.menuPanel}>   

                    <h1> {"You chose: " + QnA.getAnswers()[selectedIndex].slice(0, -1) + ", which is associated with the word: " +  QnA.getWords()[selectedIndex] } </h1>

                    <h1> {"The correct answer for " + QnA.getWords()[0]+" is: " + QnA.getAnswers()[0]} </h1>
        
                </section>
        
                <section style={{ display: 'flex', alignItems: 'center' }}>
        
                    <button style = {styles.playButton} onClick={() => {setActiveIndex(State.question); if(currentGameMode === gameModes.daily){DWOffset += 4}}}>Next Word?</button>  
        
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

        //TODO show the correct answer in the correct/wrong answer panels
    //TODO add a mechanism to save the user's score for next time, and show it in the correct/wrong answer panels

    //DailyEndPanel is the html for the state shown when you finish the daily challenge
    function DailyEndPanel() {
        return (
            <section className="daily-end-panel" style={styles.menuPanel}>

                <h1 style = {styles.title}>Daily Challenge Complete!</h1>

                <section style={styles.menuPanel}>       

                    <h1> You scored: {dailyScore}/10 </h1>

                </section>

                <section style={styles.menuPanel}>

                    <button style = {styles.playButton} onClick={() => {setActiveIndex(State.menu);}}>Return to Menu</button>
                
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
                container.onPressess[wrapAround(i, randomNum, 4)] = (() => {  if(currentGameMode === gameModes.daily && DWOffset > 35/*10 * 9 - 1 */){setActiveIndex(State.dailyEnd);}
                                                                              else setActiveIndex(State.correctAnswer); 
                                                                              selectedIndex = i; 
                                                                              streak++
                                                                              dailyScore++;
                                                                            }
                                                                    );
            }

            else{
                container.onPressess[wrapAround(i, randomNum, 4)] = (() => {  setActiveIndex(State.wrongAnswer); 
                                                                              selectedIndex = i; 
                                                                              if(streak > bestStreak){
                                                                                  bestStreak = streak;
                                                                              }
                                                                              streak = 0;
                                                                            }
                                                                    );
            }
        }
        
        return container;
    }
    //#endregion
}