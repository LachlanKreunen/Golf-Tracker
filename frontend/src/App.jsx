import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Pages/Home';
import Hole from './Pages/Hole';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Home/>} />
        <Route path="/holes/:holeNumber" element = {<Hole/>} />

      </Routes>
    </Router>
  )
}

export default App
