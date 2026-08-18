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
                    
                    <button style={styles.questionTypeButtion} onClick={() => {QnA.setSearchParam("1=1"); setActiveIndex(State.question)}}>All Words</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButtion} onClick={() => {QnA.setSearchParam("POS = 'a.'"); setActiveIndex(State.question)}}>Adjectives Only</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButtion} onClick={() => {QnA.setSearchParam("POS = 'adv.'"); setActiveIndex(State.question)}}>Adverbs Only</button>
                    
                    <div style = {{width: '10px'}}></div>

                    <button style={styles.questionTypeButtion} onClick={() => {QnA.setSearchParam("POS = 'n.'"); setActiveIndex(State.question)}}>Nouns Only</button>
                   
                    <div style = {{width: '10px'}}></div>
                    
                    <button style={styles.questionTypeButtion} onClick={() => {QnA.setSearchParam("POS = 'v.'"); setActiveIndex(State.question)}}>Verbs Only</button>
                 
                    <div style = {{width: '10px'}}></div>
                    
                    <button style={styles.questionTypeButtion} onClick={() => {QnA.setSearchParam("(POS = 'v.' or POS = 'v. t.' or POS = 'v. i.' or POS = 'imp.')"); setActiveIndex(State.question)}}>All Verb Types</button>

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
        let tempButtonText = "Next Word?";
        let tempOnClick = () => {setActiveIndex(State.question)};
        if(runningMyWords === true){
            localDB.UpdateLineCorrect(QnA.getLine(0), QnA.getAnswers()[0]/*TODO this might not work*/);
            if(localDB.IsMyWordsEmpty(window.db2)){
                tempButtonText = "Return to Menu";
                tempOnClick = () => {runningMyWords = false; setActiveIndex(State.menu)};
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

                    <button style = {styles.playButton} onClick={tempOnClick}>{tempButtonText}</button>
                
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