class QnA{
    static #question;
    static #answers;
    static generateQuestion(){
        QnA.#question = "temp question text";
        QnA.#answers = ["temp correct answer", "temp wrong answer 1", "temp wrong answer 2", "temp wrong answer 3"]; 
    }
    static getQuestion(){
        return QnA.#question;
    }
    static getAnswers(){
        return QnA.#answers?[...QnA.#answers] : [];
    }
    static isCorrectAnswer(answer){
        return answer === QnA.#answers?.[0];
    }
}

function wrapAround(num, start, max){
    if(num + start >= max){
        return num + start - max;
    }
    return num + start;
}

  function pxStringHandler(pxVal, operation) {
    const numVal = parseInt(pxVal, 10);
    let result = operation(numVal);
    return result + 'px';
  }

  const State = {
    menu: 0,
    question: 1,
    correctAnswer: 2,
    wrongAnswer: 3,
    error: 4
  };

  const styles = {
    //TODO what is this? 
    appShell: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      width: '100%',
    },

    //styles for control panel elements
    optionsPanel: {
      width: '100%',
      minHeight: '50%',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
      marginBottom: '24px',
    },

    settingsButton: {
        width: "80px",
        get height() { return this.width; },
        get minWidth() { return this.width; },
        get minHeight() { return this.width; },
        padding: '10px',
        fontSize: '1rem',
        marginLeft: 'auto',
    },

    backButton: {
        width: "80px",
        get height() { return this.width; },
        get minWidth() { return this.width; },
        get minHeight() { return this.width; },
        padding: '10px',
        fontSize: '1rem',
    },

    //styles for menu panel elements

    //The following are also used elsewhere:
    //menu panel is also used in question panel
    //title is used for the text of the question being asked
    //rowbutton is used for the buttions that represent the possible answers
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

    title: {
        alignSelf: 'center',
        fontSize: '7rem',
        marginTop: '0px',
        marginBottom: '0px',
    },
    subtitle: {
        alignSelf: 'center',
        fontSize: '2rem',
        marginTop: '0px',
        marginBottom: '0px',
    },
    playButton: {
        width: "400px",
        get height() { return pxStringHandler(this.width, (val) => val / 4); },
        get minWidth() { return this.width; },
        get minHeight() { return this.height; },
        padding: '10px',
        fontSize: '3.5rem',
    },
    rowButton: {
        width: "195px",
        get height() { return pxStringHandler(this.width, (val) => val/2 + 2); },
        get minWidth() { return this.width; },
        get minHeight() { return this.height; },
        padding: '10px',
        fontSize: '1.5rem',
    },

    //styles for question panel elements
        gridButton: {
        width: "345px",
        get height() { return pxStringHandler(this.width, (val) => val / 2 + 2); },
        get minWidth() { return this.width; },
        get minHeight() { return this.height; },
        padding: '10px',
        fontSize: '1.5rem',
    },
  };

function Form() {

  const [activeIndex, setActiveIndex] = React.useState(State.menu);

  //TODO add mechanism to save the question text and answer text to a higher level, so that it can be used in the correct/wrong answer panels
  //TODO add a mechanism to save the user's score for next time

  let content;

  switch (activeIndex) {
  case State.menu:
        content = (
        <>
        <ControlPanel></ControlPanel>
        <MenuPanel></MenuPanel>
        </>
    );
    break;
  case State.question:
        content = (
        <>
        <ControlPanel></ControlPanel>
        <QuestionPanel></QuestionPanel>
        </>)
    break;
    case State.correctAnswer:
        content = (        
        <>
        <ControlPanel></ControlPanel>
        <CorrectAnswerPanel></CorrectAnswerPanel>
        </>);
    break;
    case State.wrongAnswer:
        content = (
        <>
        <ControlPanel></ControlPanel>
        <WrongAnswerPanel></WrongAnswerPanel>
        </>
        );
    break;
  default:
      content = (
        <>
          <ControlPanel />
          <h2>Error: no matching state</h2>
        </>
      );
  }

  return <div style={styles.appShell}>{content}</div>;

  //TODO why does menupanel and control panel have to be in form? 
    function MenuPanel() {
        return (
            <section style={styles.menuPanel} className="menu-panel">
                <h2 style={styles.title}>Biblioguesser</h2>
                <h3 style={styles.subtitle}>How big is your lexicon?</h3>
                <button style={styles.playButton} onClick={() => setActiveIndex(State.question)}>
                    PLAY!
                </button>
                <section style={{ display: 'flex', alignItems: 'center' }}>
                    <button style={styles.rowButton} onClick={() => setActiveIndex(State.error)}>My Words</button>
                    <div style = {{width: '10px'}}></div>
                    <button style={styles.rowButton} onClick={() => setActiveIndex(State.error)}>Daily Challenge</button>
                </section>

            </section>
        );
    }

    function ControlPanel() {
        return (
            <section style={styles.optionsPanel} className="control-panel">
                {activeIndex !== State.menu && (
                    <button style={styles.backButton} onClick={() => setActiveIndex(State.menu)}>Return</button>
                )}
                <button style={styles.settingsButton} onClick={() => setActiveIndex(State.error)}>Settings</button>
            </section>
        );
    }
}

    function giveQuestionValues(){
        const container = {answers, onPressess};
        localAnswers = QnA.getAnswers();
        let randomNum = Math.floor(Math.random()*4);
        for(let i = 0; i < 4; i++){
            answers[wrapAround(i, randomNum, 3)] = localAnswers[i];
            if(i === 0){
                onPressess[wrapAround(i, randomNum, 3)] = (() => setActiveIndex(State.correctAnswer));
            }
            else{
                onPressess[wrapAround(i, randomNum, 3)] = (() => setActiveIndex(State.wrongAnswer));
            }
        }
        return container;
    }

    //TODO save the question text and answer text to a higher level, so that it can be used in the correct/wrong answer panels
    //TODO add a funtion that generates a new question 
    function QuestionPanel() {
        container = giveQuestionValues();
        return (
            <section style={styles.menuPanel} className="question-panel">
                <h2 style={styles.title}>Question Text</h2>

                <section style={{ display: 'flex', alignItems: 'center' }}>
                    <button style={styles.gridButton} onClick={container.onPressess[0]}>container</button>
                    <div style = {{width: '10px'}}></div>
                    <button style={styles.gridButton} onClick={container.onPressess[1]}>wrong</button>
                </section>

                <section style={{ display: 'flex', alignItems: 'center' }}>
                    <button style={styles.gridButton} onClick={container.onPressess[2]}>wrong</button>
                    <div style = {{width: '10px'}}></div>
                    <button style={styles.gridButton} onClick={container.onPressess[3]}>wrong</button>
                </section>
            </section>
        );
    }
    //TODO show the correct answer in the correct/wrong answer panels
    //TODO add a mechanism to save the user's score for next time, and show it in the correct/wrong answer panels
    function CorrectAnswerPanel() {
        return (
            <section className="correct-answer-panel">
                <h1>Question Text</h1>
                <h2>Correct Answer!</h2>
                <h3>Correct Answer Text</h3>
                <button onClick={() => setActiveIndex(State.question)}>Next Word?</button>
            </section>
        );
    }

    //TODO show the correct answer in the correct/wrong answer panels
    //TODO add a mechanism to save the user's score for next time, and show it in the correct/wrong answer panels
    function WrongAnswerPanel() {
        return (
            <section className="wrong-answer-panel">
                <h1>Question Text</h1>
                <h2>Wrong Answer!</h2>
                <h3>Correct Answer Text</h3>
                <button onClick={() => setActiveIndex(State.question)}>Next Word?</button>
            </section>
        );
    }