function Form() {
  const State = {
    menu: 0,
    question: 1,
    correctAnswer: 2,
    wrongAnswer: 3,
    error: 4

  };

  const [activeIndex, setActiveIndex] = React.useState(State.menu);

  //TODO add mechanism to save the question text and answer text to a higher level, so that it can be used in the correct/wrong answer panels
  //TODO add a mechanism to save the user's score for next time

  switch (activeIndex) {
  case State.menu:
        return (
        <>
        <ControlPanel></ControlPanel>
        <MenuPanel></MenuPanel>
        </>
    );
    break;
  case State.question:
        return (
        <>
        <ControlPanel></ControlPanel>
        <QuestionPanel></QuestionPanel>
        </>)
    break;
    case State.correctAnswer:
        return (        
        <>
        <ControlPanel></ControlPanel>
        <CorrectAnswerPanel></CorrectAnswerPanel>
        </>);
    break;
    case State.wrongAnswer:
        return (
        <>
        <ControlPanel></ControlPanel>
        <WrongAnswerPanel></WrongAnswerPanel>
        </>
        );
    break;
  default:
        return (
        <>
        <ControlPanel></ControlPanel>
        <h2>Error: no matching state</h2>
        </>)
    break;
}

    /*function Panel({ title, children, isActive, onShow }) {
        return (
            <section className="panel">
            <h3>{title}</h3>
            {isActive ? (
                <p>{children}</p>
            ) : (
                <button onClick={onShow}>Show</button>
            )}
            </section>
        );
    }*/

    function ControlPanel() {
        return (
            <section className="control-panel">
                {activeIndex !== State.menu && (
                    <button onClick={() => setActiveIndex(State.menu)}>Return</button>
                )}
                <button onClick={() => setActiveIndex(State.error)}>Settings</button>
            </section>
        );
    }

    function MenuPanel() {
        return (
            <section className="menu-panel">
                <h2>Menu</h2>
                <button onClick={() => setActiveIndex(State.question)}>PLAY!</button>
                <button onClick={() => setActiveIndex(State.error)}>My Words</button>
                <button onClick={() => setActiveIndex(State.error)}>Daily Challenge</button>
            </section>
        );
    }

    //TODO save the question text and answer text to a higher level, so that it can be used in the correct/wrong answer panels
    //TODO add a funtion that generates a new question 
    function QuestionPanel() {
        return (
            <section className="question-panel">

                <h2>Question Text</h2>
                <button onClick={() => setActiveIndex(State.correctAnswer)}>correct</button>
                <button onClick={() => setActiveIndex(State.wrongAnswer)}>wrong</button>
                <button onClick={() => setActiveIndex(State.wrongAnswer)}>wrong</button>
                <button onClick={() => setActiveIndex(State.wrongAnswer)}>wrong</button>
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
}