import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonForm from "@/components/CommonForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast, Toaster } from "sonner"; // Sonner toast

// Form controls
const signInFormControls = [
  { name: "email", label: "Email", type: "email", placeholder: "Enter your email", componentType: "input" },
  { name: "password", label: "Password", type: "password", placeholder: "Enter your password", componentType: "input" },
];

const signUpFormControls = [
  { name: "name", label: "Name", type: "text", placeholder: "Enter your full name", componentType: "input" },
  { name: "email", label: "Email", type: "email", placeholder: "Enter your email", componentType: "input" },
  { name: "password", label: "Password", type: "password", placeholder: "Enter your password", componentType: "input" },
  { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm password", componentType: "input" },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const { loginUser, registerUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("signin");
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    // frontend validation per backend rules
    if (!signInData.email?.trim()) return toast("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInData.email)) return toast("Invalid email");
    if (!signInData.password) return toast("Password is required");
    try {
      const user = await loginUser({ email: signInData.email, password: signInData.password });
      toast(`Welcome back, ${user.name}!`);
      navigate("/dashboard"); // redirect after login
    } catch (err) {
      toast("Something went wrong during login");
      console.error(err);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    // frontend validation per backend rules
    if (!signUpData.name?.trim() || signUpData.name.trim().length < 2) return toast("Name must be at least 2 characters");
    if (!signUpData.email?.trim()) return toast("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) return toast("Invalid email");
    if (!signUpData.password || signUpData.password.length < 6) return toast("Password must be at least 6 characters");
    if (signUpData.password !== signUpData.confirmPassword) return toast("Passwords do not match");
    try {
      const user = await registerUser({
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
      });
      toast(`Account created! Welcome, ${user.name}`);
      navigate("/dashboard"); // redirect after register
    } catch (err) {
      toast("Something went wrong during registration");
      console.error(err);
    }
  };

  const validateSignIn = () => signInData.email && signInData.password;
  const validateSignUp = () =>
    signUpData.name && signUpData.email && signUpData.password && signUpData.confirmPassword;

  return (
    <div className="flex flex-col min-h-screen justify-center items-center relative">
      <Toaster /> {/* Sonner toaster */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        {/* Sign In */}
        <TabsContent value="signin">
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>Enter your email and password</CardDescription>
            </CardHeader>
            <CardContent>
              <CommonForm
                formControls={signInFormControls}
                formData={signInData}
                setFormData={setSignInData}
                buttonText="Sign In"
                handleSubmit={handleLogin}
                isButtonDisabled={!validateSignIn() || loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sign Up */}
        <TabsContent value="signup">
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle>Create a new account</CardTitle>
              <CardDescription>Enter your details to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <CommonForm
                formControls={signUpFormControls}
                formData={signUpData}
                setFormData={setSignUpData}
                buttonText="Sign Up"
                handleSubmit={handleRegister}
                isButtonDisabled={!validateSignUp() || loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthPage;
