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


