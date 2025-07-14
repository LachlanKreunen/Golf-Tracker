<<<<<<< HEAD
/*import "../index.css";
import Button from "../Button";
const Home = () => {
  //for the buttons maybe implement as components that will bring to page, then pass argument
  // Then you don't have to write the logic for every single button
  return (
    <>
      <div class="container">
        <h1>Create Account</h1>
      </div>
      <div className="card">
        <div className="form-group">
          <label htmlFor="gridSize">Grid Size (1-20): </label>
          <input
            id="GridSize"
            type="number"
            min="1"
            max="20"
            placeholder="e.g. 10"
            value={gridSize}
            onChange={(e) => setGridSize(e.target.value)}
            className="text-input"
          />
        </div>
      </div>
    </>
  );
};

export default Home;


=======
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
>>>>>>> 360aa92742aa116ee30a7e92160bb7b16293d41b
