//errorText holds a string that diplayed when a failed screen transition happens 
let errorText = "Error: no matching state";

//userInput is an object that holds the user input for later use
let userInput = {
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
};

const bcrypt = require('bcrypt');
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
    const [loginForm, setLoginForm] = React.useState({
        usernameInput: '',
        passwordInput: '',
        confirmPasswordInput: '',
        firstNameInput: '',
        lastNameInput: '',
        emailInput: '',
        phoneInput: ''
    });

    //#region dropdown menu functions
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const updateLoginForm = (event) => {
        const { name, value } = event.target;

        setLoginForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };
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
                {LoginPanel()}
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
                {CreateAccountPanel()}
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

                <h2 style={styles.title}>Menu</h2>

                <button style={styles.playButton} onClick={() => {setActiveIndex(State.login)}}>Login</button>

                <button style={styles.playButton} onClick={() => {setActiveIndex(State.createAccount)}}>create account</button>
            </section>
        );
    }

    function LoginPanel() {
        return (
            <form onSubmit={handleSubmitLogin}>
                <section style={styles.menuPanel} className="login-panel">

                    <h2 style={styles.title}>Temp Login Page</h2>

                    <label>
                        Username: <input
                            name="usernameInput"
                            value={loginForm.usernameInput}
                            onChange={updateLoginForm}
                        />
                    </label>

                    <label>
                        Password: <input
                            name="passwordInput"
                            type="password"
                            value={loginForm.passwordInput}
                            onChange={updateLoginForm}
                        />
                    </label>

                    <button type="submit" style={styles.playButton}onClick={() => {
                    }}>Login</button>
                </section>
            </form>
        );
    }

    function ValidLoginPanel() {
        return (
            //TODO make a better way of remembering the current user than using userinput.username, which is cleared on every form submission.
            <section style={styles.menuPanel} className="ValidLogin-panel">

                <h2 style={styles.title}>Logged in as {userInput.username}</h2>

                <button style={styles.playButton} onClick={() => {setActiveIndex(State.menu)}}>Return to Menu</button>

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
            <form onSubmit={handleSubmitCreateAccount}>
                <section style={styles.menuPanel} className="CreateAccount-panel">
                    <h2 style={styles.title}>Create Account</h2>
                        <section style={{alignItems: 'flex-end', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <label>
                                Username: <input
                                    name="usernameInput"
                                    value={loginForm.usernameInput}
                                    onChange={updateLoginForm}
                                />
                            </label>
                                <section>   </section>
                            <label>
                                Password: <input
                                    name="passwordInput"
                                    type="password"
                                    value={loginForm.passwordInput}
                                    onChange={updateLoginForm}
                                />
                            </label>

                                <section>   </section>

                            <label>
                                Confirm Password: <input
                                    name="confirmPasswordInput"
                                    type="password"
                                    value={loginForm.confirmPasswordInput}
                                    onChange={updateLoginForm}
                                />
                            </label>

                                <section>   </section>
                                

                            <label>
                                First Name: <input
                                    name="firstNameInput"
                                    value={loginForm.firstNameInput}
                                    onChange={updateLoginForm}
                                />
                            </label>

                                <section>   </section>
                                

                            <label>
                                Last Name: <input
                                    name="lastNameInput"
                                    value={loginForm.lastNameInput}
                                    onChange={updateLoginForm}
                                />
                            </label>

                                <section>   </section>
                                

                            <label>
                                Email: <input
                                    name="emailInput"
                                    type="email"
                                    value={loginForm.emailInput}
                                    onChange={updateLoginForm}
                                />
                            </label>

                                <section>   </section>
                                

                            <label>
                                Phone Number: <input
                                    name="phoneInput"
                                    type="tel"
                                    value={loginForm.phoneInput}
                                    onChange={updateLoginForm}
                                />
                            </label>

                                <section>   </section>
                                
                        </section>
                    <button type="submit" style={styles.playButton}>Create Account</button>
                </section>
            </form> 

        );
    }

    function sanitizeInput(input) {
        const format = /[!@#$%^&*()_+-=[]{};':"\|,.<>/?]+/;
        return input.replace(format, '');
    }

    function ClearForm() {
        setLoginForm({
            usernameInput: '',
            passwordInput: '',
            confirmPasswordInput: '',
            firstNameInput: '',
            lastNameInput: '',
            emailInput: '',
            phoneInput: ''
        });
    }

    function handleSubmitLogin(e) {
        e.preventDefault();

        userInput.username = sanitizeInput(loginForm.usernameInput);
        userInput.password = sanitizeInput(loginForm.passwordInput);

        console.log('Submitted login values:', userInput);
        handleLogin();
        ClearForm();
    }

    function handleSubmitCreateAccount(e) {
        e.preventDefault();

        userInput.username = sanitizeInput(loginForm.usernameInput);
        userInput.password = sanitizeInput(loginForm.passwordInput);
        userInput.confirmPassword = sanitizeInput(loginForm.confirmPasswordInput);
        userInput.firstName = sanitizeInput(loginForm.firstNameInput);
        userInput.lastName = sanitizeInput(loginForm.lastNameInput);
        userInput.email = sanitizeInput(loginForm.emailInput);
        userInput.phone = sanitizeInput(loginForm.phoneInput);

        console.log('Submitted create account values:', userInput);
        let result = handleCreateAccount();
        ClearForm();
        if (result === "Account created successfully") {
            setActiveIndex(State.validLogin);
        } else {
            setActiveIndex(State.createAccount);
        }
    }

    function handleLogin(){
        let loginSuccess = account.CheckLogin(userInput.username, userInput.password);
        if(loginSuccess){
            setActiveIndex(State.validLogin);
        } else {
            setActiveIndex(State.invalidLogin);
        }
    }

    function handleCreateAccount(e) {
        let createAccountSuccess = account.CreateAccount(
            userInput.username,
            userInput.password,
            userInput.confirmPassword,
            userInput.firstName,
            userInput.lastName,
            userInput.email,
            userInput.phone
        );
        console.log('Create account result:', createAccountSuccess);
        return createAccountSuccess;
    }
}
