import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const TopNav = () => {
  return (
    <div className="navbar bg-base-300 h-20 shadow-md mb-4">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          <img src={logo} width={140} />
        </Link>
      </div>
      <div className="flex-none gap-2 mr-4">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-24 md:w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default TopNav;
