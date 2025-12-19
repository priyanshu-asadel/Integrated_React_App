import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../services/auth';
import './SignIn.css';

const SignIn = () => {
  const [showInvalidCredError, setShowInvalidCredError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    setShowInvalidCredError(false);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setShowInvalidCredError(true);
    }
  };

  return (
    <div className="signIn-login-container">
      <div className="signIn-login-card">
        <div className="signIn-logo">
          <i className="fas fa-shield-alt"></i>
          <h1>Security Dashboard</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} id="loginForm">
          <div className="signIn-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is a required field',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {errors.email && (
              <div className="signIn-validation-message">
                <small>{errors.email.message}</small>
              </div>
            )}
          </div>

          <div className="signIn-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
              })}
            />
            {errors.password && (
              <div className="signIn-validation-message">
                <small>{errors.password.message}</small>
              </div>
            )}
            {showInvalidCredError && (
              <div className="signIn-validation-message">
                <small>Email or password is not correct.</small>
              </div>
            )}
          </div>

          <div className="signIn-form-options">
            <label className="signIn-remember-me">
              <input type="checkbox" {...register('remember')} />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="signIn-forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="signIn-btn signIn-btn-primary">
            Login
          </button>
        </form>

        <div className="signIn-login-footer">
          <p>Licensed to Asadel Technologies Pvt Ltd.</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
