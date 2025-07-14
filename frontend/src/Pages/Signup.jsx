import "../index.css";
import Button from "../Button";

const Signup = () => {

    return (
    <>
        <div class="container">
            <h1 >Create Account</h1>
            <p>Sign up now to create your free account!</p>   
            <label for="firstname">First Name: </label>
            <input type="text" id="firstname" required/>
            <br/>
            <label for="lastname">Last Name: </label>
            <input type="text" id="lastname" required/>
            <br/>
            <label for="username">Username: </label>
            <input type="text" id="username" required/>
            <br/>
            <label for="password">Password: </label>
            <input type="password" id="password" required/>
            <div className="button-container">
                <Button txt = "Home" page="/"/>
                <Button txt = "Create" page = "/login"/>
            </div> 
        </div>
    </>

    );

};

export default Signup;