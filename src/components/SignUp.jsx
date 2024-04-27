import { useState } from "react";
import { Typography, Input, Button } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./../firebase/config";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPassCorr, setIsPassCorr] = useState(true);
  const [isEmailCorr, setIsEmailCorr] = useState(true);
  const [isNameValid, setIsNameValid] = useState(true);

  const navigate = useNavigate();


  const togglePasswordVisibility = () => {
    setPasswordShown((prevState) => !prevState);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setIsNameValid(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsEmailCorr(true);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setIsPassCorr(true);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name) {
      setIsNameValid(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(auth.currentUser, { displayName: name });
      // console.log("User signed up successfully:", userCredential.user);
      navigate('/')
    } catch (error) {
      console.error("Error signing up:", error.code, error.message);
      if (error.code === "auth/email-already-in-use") {
        setIsAvailable(false);
      } else if (error.code === "auth/weak-password") {
        setIsPassCorr(false);
      } else if (error.code === "auth/invalid-email") {
        setIsEmailCorr(false);
      }
    }
  };

  return (
    <section className="grid text-center h-screen items-center p-8">
      <div>
        <Typography variant="h3" color="blue-gray" className="mb-2">
          Sign Up
        </Typography>
        <Typography className="mb-16 text-gray-600 font-normal text-[18px]">
          Enter your email, username, and password to sign up
        </Typography>
        <form onSubmit={handleSignUp} className="mx-auto max-w-[24rem] text-left">
          <div className="mb-6">
            <label htmlFor="name">
              <Typography variant="small" className="mb-2 block font-medium text-gray-900">
                Your Username
              </Typography>
            </label>
            <Input
              id="name"
              color="gray"
              size="lg"
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="John Doe"
              className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
            />
            {!isNameValid && (
              <Typography variant="small" color="red" className="mt-1">
                Please enter a valid username.
              </Typography>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="email">
              <Typography variant="small" className="mb-2 block font-medium text-gray-900">
                Your Email
              </Typography>
            </label>
            <Input
              id="email"
              color="gray"
              size="lg"
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="name@mail.com"
              className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
            />
            {!isEmailCorr && (
              <Typography variant="small" color="red" className="mt-1">
                Please enter a valid email address.
              </Typography>
            )}
            {!isAvailable && (
              <Typography variant="small" color="red" className="mt-1">
                This email is already in use.
              </Typography>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="password">
              <Typography variant="small" className="mb-2 block font-medium text-gray-900">
                Password
              </Typography>
            </label>
            <Input
              size="lg"
              placeholder="********"
              type={passwordShown ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
              icon={
                <i onClick={togglePasswordVisibility}>
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </i>
              }
            />
            {!isPassCorr && (
              <Typography variant="small" color="red" className="mt-1">
                Please choose a stronger password.
              </Typography>
            )}
          </div>
          <Button color="gray" size="lg" className="mt-6" fullWidth type="submit">
            Sign Up
          </Button>
          <Typography variant="small" color="gray" className="mt-4 text-center font-normal">
            Have an account? <a href="/login" className="font-medium text-gray-900">Login</a>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
