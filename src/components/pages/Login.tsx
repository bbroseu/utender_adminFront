import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { EyeIcon, EyeOffIcon, LogInIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { loginUser, clearError, clearAuth, selectAuthLoading, selectAuthError, selectIsAuthenticated } from "../../store/slices/authSlice";

interface LoginFormValues {
  username: string;
  password: string;
}

const loginValidationSchema = Yup.object({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .trim(),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password must not exceed 255 characters"),
});

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectAuthLoading);
  const loginError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [showPassword, setShowPassword] = useState(false);

  const initialValues: LoginFormValues = {
    username: "",
    password: "",
  };

  // Clear any existing auth state and errors when component mounts
  useEffect(() => {
    dispatch(clearAuth());
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || "/panel";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      console.log('Attempting login with:', { username: values.username.trim() });
      
      const result = await dispatch(loginUser({
        username: values.username.trim(),
        password: values.password,
      })).unwrap();
      
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, redirecting...');
        const from = (location.state as any)?.from?.pathname || "/panel";
        navigate(from, { replace: true });
      } else {
        console.error('Login failed:', result);
      }
    } catch (error) {
      // Error is handled by the Redux slice
      console.error("Login error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            UTender Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your admin account
          </p>
        </div>

        <Card className="mt-8 p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={loginValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{loginError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username
                  </label>
                  <Field
                    name="username"
                    type="text"
                    autoComplete="username"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      errors.username && touched.username
                        ? "border-red-300 focus:border-red-500"
                        : "border-input focus:border-primary"
                    }`}
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                  <ErrorMessage
                    name="username"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm transition-colors duration-200 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        errors.password && touched.password
                          ? "border-red-300 focus:border-red-500"
                          : "border-input focus:border-primary"
                      }`}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={isLoading || isSubmitting}
                  icon={<LogInIcon className="h-4 w-4 mr-2" />}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </Form>
            )}
          </Formik>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            UTender Admin Panel - Secure Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
