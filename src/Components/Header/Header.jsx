import React from 'react';
import "./Header.css"
import logo from "../../logo/yellowpng.png"
const Header = () => {


    return (
        <div className={'header'}>
            <img width={"100px"} src={logo} alt={"logo"} style={{marginTop:"4vh",textAlign:"center"}} />

        </div>
    );
};

export default Header;