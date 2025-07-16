import React from 'react';
import '../index.css';
import Button from '../Button';

const Home = () => {
  return (
      <div className="card">
        <h1>Welcome to LI Golf</h1>

        <p style={{ color: "#448071", fontSize: "1.5rem" }}>
        Track your scores and stats!</p>
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
          <Button txt="Login" page="/login" />
          <Button txt="Create Account" page="/signup" />
        </div>
      </div>
  );
};

export default Home;
