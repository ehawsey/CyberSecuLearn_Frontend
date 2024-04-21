import React, { useState, useEffect } from 'react';
import {useNavigate} from "react-router-dom";
import './styles/login_form.scss';
import bgimg from './assets/images/signin.jpg';
const LoginForm = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const data = localStorage.getItem("userdata");
        if (data) {
            navigate("/learn")
        }
    }, []);
    const [isRegistering, setIsRegistering] = useState(false);
    return (
        <div className='login_form'>
            <div className="login-container">
                <div className='toggle'>
                    <div className={`button-heads tl ${!isRegistering ? 'active' : 'inactive'}`} onClick={() => { setIsRegistering(false) }}>Sign In</div>
                    <div className={`button-heads tr ${isRegistering ? 'active' : 'inactive'}`} onClick={() => { setIsRegistering(true) }}>Register</div>
                </div>
                <div className='form-fields'>
                    {isRegistering ? <Register /> : <Login />}
                </div>
            </div>
        </div>
    );
};

const InputField = ({ type, placeholder, value, onChange, isValid, helper }) => (
    <div>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`input-field ${value ? (isValid ? 'valid' : 'invalid') : ''}`}
        />
        {value ? (isValid ? null : <div className="helper-text">{helper}</div>) : null}
    </div>
);

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate=useNavigate();
    const isValidUsername = (username) => username.trim().length >= 6;
    const isValidPassword = (password) => password.trim().length >= 8;
    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            alert('Please fill in all fields.');
            return;
        }
    
        try {
            const backendUrl = import.meta.env.VITE_BACKEND;
            const response = await fetch(backendUrl+"/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usernameOrEmail:username, password }),
            });
    
            if (response.ok) {
                const userDataRes = await fetch(backendUrl+"/users/"+username);
                const userData= await userDataRes.json()
                localStorage.setItem('userdata',JSON.stringify(userData));
                navigate("/learn");
            } else {
                const errorData = await response.json();
                alert('Incorrect credentials, use only email/username with password');
                console.error('Error logging in:', errorData);
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };
    


    return (
        <>
            <InputField
                type="text"
                placeholder="Username (min 6 characters)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isValid={isValidUsername(username)}
                helper="Minimum 6 characters"
            />
            <InputField
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isValid={isValidPassword(password)}
                helper="Minimum 8 characters"
            />
            <button onClick={handleLogin} className="submit-button">Login</button>
        </>
    );
};

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isValidName = (name) => /^[a-zA-Z ]+$/.test(name.trim());
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isValidUsername = (username) => username.trim().length >= 6;
    const isValidPassword = (password) => password.trim().length >= 8;

    const handleRegister = async () => {
        if (!fullName.trim() || !email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
            alert('Please fill in all fields.');
            return;
        }

        if (!isValidName(fullName)) {
            alert('Please enter a valid name.');
            return;
        }

        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!isValidUsername(username)) {
            alert('Username must be at least 6 characters long.');
            return;
        }

        if (!isValidPassword(password)) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        if (confirmPassword !== password) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND+"/register";
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, email, username, password, confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful - try login @'+username);
            } else {
                alert('Registration failed: '+data.error);
            }
        } catch (error) {
            console.error('Error registering:', error);
        }
    };

    return (
        <>
            <InputField
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                isValid={isValidName(fullName)}
                helper="Only Alphabets (a-z,A-Z) are allowed"
            />
            <InputField
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isValid={isValidEmail(email)}
                helper="Valid email format : name@domain.tld"
            />
            <InputField
                type="text"
                placeholder="Username (min 6 characters)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isValid={isValidUsername(username)}
                helper="Minimum 6 characters"
            />
            <InputField
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isValid={isValidPassword(password)}
                helper="Minimum 8 characters"
            />
            <InputField
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isValid={confirmPassword === password}
                helper="Must match password above"
            />
            <button onClick={handleRegister} className="submit-button">Register</button>
        </>
    );
};

export default LoginForm;
