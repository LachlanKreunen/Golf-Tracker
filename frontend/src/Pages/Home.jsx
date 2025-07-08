import "../index.css";
import Button from "../Button";
const Home = () => {
    //for the buttons maybe implement as components that will bring to page, then pass argument
    // Then you don't have to write the logic for every single button
    return (
        <>
        <div class="container">
            <h1 > Welcome to LI Golf</h1>
            <p>Track your scores and stats!</p>   
            <div className="button-container">
                <Button txt = "Login" page="./Login"/>
                <Button txt = "Create Account" page="./Signup"/>
            </div> 
        </div>
        </>
    );
};

export default Home;
