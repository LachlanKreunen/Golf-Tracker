import "../index.css";
import Button from "../Button";
const Home = () => {
    //for the buttons maybe implement as components that will bring to page, then pass argument
    // Then you don't have to write the logic for every single button
    return (
        <>
        <div className="container">
            <h1 > Welcome to LI Golf</h1>
            <p>Track your scores and stats!</p>   
            <label for="username">Username: </label>
            <input type="text" id="username" required/>
            <br/>
            <label for="password">Password: </label>
            <input type="text" id="password" required/>
            <div className="button-container">
                <Button txt = "Login" page="/login"/>
                <Button txt = "Create Account" page="/signup"/>
            </div> 
        </div>
        </>
    );
};

export default Home;
