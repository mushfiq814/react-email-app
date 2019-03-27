import React from "react";
import ReactDOM from "react-dom";
import Emails from "./components/Emails";
import Header from "./components/Header";

import './style.css';

let html = <div><Header /><Emails /></div>

ReactDOM.render(html, document.getElementById("root"));
