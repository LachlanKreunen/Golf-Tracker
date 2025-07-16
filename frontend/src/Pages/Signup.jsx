import "../index.css";
import Button from "../Button";

const Signup = () => {

    return (
    <>
        <div className="card">
            <h1 >Create Account</h1>  
            <input
          type="text"
          id="username"
          className="login-input"
          placeholder="First"
          required
        />
        <input
          type="password"
          id="password"
          className="login-input"
          placeholder="Last"
          required
        />
        <input
          type="text"
          id="username"
          className="login-input"
          placeholder="Username"
          required
        />
        <input
          type="password"
          id="password"
          className="login-input"
          placeholder="Password"
          required
        />
            <div className="button-container">
                <Button txt = "Home" page="/"/>
                <Button txt = "Create" page = "/login"/>
            </div> 
        </div>
    </>

    );

};

export default Signup;