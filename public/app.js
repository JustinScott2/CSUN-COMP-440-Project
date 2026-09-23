//errorText holds a string that diplayed when a failed screen transition happens 
let errorText = "Error: no matching state";

// #region functions-tools
//performs math operation on NNNpx format strings by unpacking the int, performing the operation, and repacking it.
function pxStringHandler(pxVal, operation) {
    const numVal = parseInt(pxVal, 10);
    let result = operation(numVal);
    return result + 'px';
}
//#endregion

//I left all the states from BG
const styles = {
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
    login: 1,
    validLogin: 2,
    invalidLogin: 3,
    createAccount: 4
}

//form is the funtion that index actually runs
function Form() {

    //creates the activeindex variable for controlling the states for the single page
    const [activeIndex, setActiveIndex] = React.useState(State.menu);

    //#region dropdown menu functions
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);
    //#endregion

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
        case State.login:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <LoginPanel></LoginPanel>
                </React.Fragment>
            );
        break;
        case State.validLogin:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <ValidLoginPanel></ValidLoginPanel>
                </React.Fragment>
            );
        break;
        case State.invalidLogin:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <InvalidLoginPanel></InvalidLoginPanel>
                </React.Fragment>
            );
        break;
        case State.createAccount:
            content = (
                <React.Fragment>
                <ControlPanel></ControlPanel>
                <CreateAccountPanel></CreateAccountPanel>
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
 
    //#region functions for the different states.

    //ControlPanel is the HTML for the control panel state, ie the options bar at the top.
        function ControlPanel() {
            return (
                <section style={styles.optionsPanel} className="control-panel">
                    
                    {activeIndex !== State.menu && (
                        <button style={styles.backButton} onClick={() => {setActiveIndex(State.menu)}}>Return</button>
                    )}

                    <div style={styles.settingsWrapper}>
                        <button style={styles.settingsButton} onClick={toggleDropdown}>Settings</button>

                        {/* TODO make this do the things when visual update is started*/}
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

    //MenuPanel is the HTML for the menu state
    function MenuPanel() {
        return (
            <section style={styles.menuPanel} className="menu-panel">

                <h2 style={styles.title}>Temp Menu Text</h2>

                <button style={styles.playButton} onClick={() => {setActiveIndex(State.login)}}>Login</button>

                <button style={styles.playButton} onClick={() => {setActiveIndex(State.createAccount)}}>create account</button>
            </section>
        );
    }

    function LoginPanel() {
        return (
            <section style={styles.menuPanel} className="login-panel">

                <h2 style={styles.title}>Temp Login Page</h2>

                <button style={styles.playButton} onClick={() => {setActiveIndex(State.validLogin)}}>correct login</button>

                <button style={styles.playButton} onClick={() => {setActiveIndex(State.invalidLogin)}}>incorrect login</button>
            </section>
        );
    }

    function ValidLoginPanel() {
        return (
            <section style={styles.menuPanel} className="ValidLogin-panel">

                <h2 style={styles.title}>Temp correct login Page</h2>

                <button style={styles.playButton} onClick={() => {}}>temp button</button>

            </section>
        );
    }

    function InvalidLoginPanel() {
        return (
            <section style={styles.menuPanel} className="InvalidLogin-panel">

                <h2 style={styles.title}>Temp incorrect login Page</h2>

                <button style={styles.playButton} onClick={() => {setActiveIndex(State.login)}}>login again</button>

            </section>
        );
    }

    function CreateAccountPanel() {
        return (
            <section style={styles.menuPanel} className="CreateAccount-panel">

                <h2 style={styles.title}>Temp create account Page</h2>

                <button style={styles.playButton} onClick={() => {}}>create account</button>

            </section>
        );
    }
}