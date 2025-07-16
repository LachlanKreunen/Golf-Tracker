import "../index.css";
import Button from "../Button";
import { useNavigate } from "react-router-dom";


const stats = {
        handicap: 12.3,
        averageScore: 85.4,
        averagePutts: 32.1,
        girPercent: 48.7,
        firPercent: 52.3
    };



const Login = () => {

    const navigate = useNavigate();
    function handleLogout() {
        navigate("/");
    }
    return (
        <>
        <div className="card">
            <button className="logout-button" onClick={handleLogout}>Log Out</button>
            
            <div className="hc">
                <p><span style={{ color: "#448071", fontWeight: "bold" }}>{stats.handicap}</span> Handicap</p>
            </div>
        <div className="stats">
                <p>Average Score <span style={{ color: "#448071", fontWeight: "bold" }}>{stats.averageScore}</span></p>
                <p>Average Putts <span style={{ color: "#448071", fontWeight: "bold" }}>{stats.averagePutts}</span></p>
                <p>Green in Regulation <span style={{ color: "#448071", fontWeight: "bold"}}>{stats.girPercent}%</span></p>
                <p>Fairway in Regulation <span style={{ color: "#448071", fontWeight: "bold" }}>{stats.firPercent}%</span></p>
        </div>
        <div className="button-container">
          <Button txt="Round History" page="/rounds" />
          <Button txt="New Round" page="/start" />
        </div>
            
        </div>
        </>
    );
};

export default Login;