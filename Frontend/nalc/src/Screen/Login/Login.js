import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Automatically log in using email from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get('email'); // Fetch email from URL

    if (emailFromUrl) {
      console.log('Email found in URL:', emailFromUrl);  // Debug log to ensure email is found
      setEmail(emailFromUrl);  // Set email in state
      handleLogin(emailFromUrl); // Call the login function with email only
    } else {
      console.log('No email found in URL');
    }
  }, []);

  // Function to handle login using only the email
  const handleLogin = async (email) => {
    try {
      setLoginLoading(true);
      const response = await axios.post('http://167.172.68.108:8000/api/users/login/', {
        email: email,
      });

      if (response.status >= 200 && response.status < 300) {
        const authToken = response.data.access_token;
        localStorage.setItem('authToken', authToken); // Store the token in localStorage
        navigate(response.data.is_superuser ? '/admin' : '/home'); // Redirect based on user role
      } else {
        alert('Email is incorrect or not recognized');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert("Email is incorrect or not recognized");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div> 
      <div className="form" style={{ display: loginLoading ? 'none' : 'block' }}>
        <div className='row'>
          <h1 style={{ color: 'white' }}>Login Account</h1>
        </div>
        <br />
        <div className='row inputs'>
          <form>
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Manual email entry (if needed)
              style={{ color: 'white' , marginLeft:'-1900px', width:'50px'}}
            />
            <button
              type="button"
              onClick={() => handleLogin(email)} // Trigger login manually
              style={{ color: 'white' , marginLeft:'-1900px',width:'50px'}}
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {loginLoading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '2rem',  // Increase the font size
          color: 'white',    // Keep text white
        }}>
        {/* <p style={{ color: 'black' }}>Loading...</p> */}
        </div>
      )}
    </div>
  );
}

export default Login;
