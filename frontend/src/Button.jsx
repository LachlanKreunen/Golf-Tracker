import {useNavigate} from "react-router-dom";
function Button({txt, page}) {
    const navigate = useNavigate();

    function click() {
        navigate(page);
    }

    return <button onClick={click}>{txt}</button>;
}

export default Button;