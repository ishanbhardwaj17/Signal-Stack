import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import {
  setLoading,
  setUser,
  setError,
} from "../state/auth.slice";

import { loginUser } from "../services/auth.api";

function Login() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { loading, error } =
    useSelector((state) => state.auth);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));

      const data = await loginUser(
        formData
      );

      dispatch(
        setUser({
          user: data.data.user,
        })
      );

      navigate("/");
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message ||
            "Login failed"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
      >
        <h2 className="mb-6 text-2xl font-bold">
          Login
        </h2>

        {error && (
          <p className="mb-4 text-red-500">
            {error}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="mb-4 w-full rounded border p-3"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="mb-4 w-full rounded border p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black p-3 text-white"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;