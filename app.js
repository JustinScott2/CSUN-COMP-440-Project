class QnA{
    static #question;
    static #answers;
    static generateQuestion(){
        this.tempGenerateQuestion();
    }
    
    static tempGenerateQuestion(){
        let randomNum = Math.floor(Math.random()*4);
        switch (randomNum) {
        case 0:
            QnA.#question = "What is an apple?";
            QnA.#answers = ["red fruit", "green fruit", "blue fruit", "purple fruit"]
        break; 
        case 1:
            QnA.#question = "What is an oubliette?";
            QnA.#answers = ["An oubliette is a secret, underground dungeon in a castle or fortress designed so that the only entrance or exit is a trap door in the ceiling",
                            "An oubliette is a broad, scarf-like neckband worn by men, tucked into the collar of a shirt.",
                            "Oubliette refers to a genus of drought-tolerant shrubs, trees, and plants in the asparagus family native to the Americas.",
                            "The oubliette is a smooth, progressive ballroom dance characterized by long, continuous, flowing movements across the floor."];
        break;
        case 2:
            QnA.#question = "A horse is a ?";
            QnA.#answers = ["mammal",
                            "bird",
                            "fish",
                            "dinosaur"]
        break;
        case 3:
            QnA.#question = "What does Cantankerous mean?";
            QnA.#answers = ["Cantankerous describes someone who is bad-tempered, argumentative, uncooperative, and difficult to deal with.",
                            "Cantankerous describes something related to or affected by cancer",
                            "Cantankerous describes making a loud and confused noise",
                            "Cantankerous describes making a continuous loud banging or ringing sound"]
        break;
        }
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
      maxHeight: '99%',
      maxWidth: '99%',
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
      maxWidth: '99%',
      minHeight: '20%',
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
        marginTop: '10px'
    },

    backButton: {
        width: "80px",
        get height() { return this.width; },
        get minWidth() { return this.width; },
        get minHeight() { return this.width; },
        marginTop: '10px',
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

  //TODO why does panel functs have to be in form? 
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

    //TODO save the question text and answer text to a higher level, so that it can be used in the correct/wrong answer panels
    //TODO add a funtion that generates a new question 
    function QuestionPanel() {
        QnA.generateQuestion();
        let questionContainer = QnA.getQuestion();
        const buttonContainer = giveQuestionValues();
        return (
            <section style={styles.menuPanel} className="question-panel">
                <h2 style={styles.title}>{questionContainer}</h2>

                <section style={{ display: 'flex', alignItems: 'center' }}>
                    <button style={styles.gridButton} onClick={buttonContainer.onPressess[0]}>{buttonContainer.answers[0]}</button>
                    <div style = {{width: '10px'}}></div>
                    <button style={styles.gridButton} onClick={buttonContainer.onPressess[1]}>{buttonContainer.answers[1]}</button>
                </section>

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
}

 
