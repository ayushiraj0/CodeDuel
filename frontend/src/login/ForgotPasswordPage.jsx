// ForgotPasswordPage.jsx
import { useState } from 'react';
import { FaEnvelope, FaQuestionCircle, FaLaptopCode } from 'react-icons/fa';

const ForgotPasswordPage = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    // Basic email validation
    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
    }

    // Simulate an API call to send reset email
    try {
      const response = await new Promise((resolve) => setTimeout(() => {
        // In a real app, check if email exists and send reset link
        if (email === 'noexist@example.com') { // Example of a non-existent email
            resolve({ success: false, message: 'Email not found.' });
        } else {
            resolve({ success: true, message: 'If an account exists, a password reset link has been sent to your email.' });
        }
      }, 2000)); // Simulate 2-second delay

      if (response.success) {
        setMessage(response.message);
        setEmail(''); // Clear email field
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-700 relative">
            {/* Platform Logo/Name */}
            <div className="flex justify-center items-center mb-8">
                <FaLaptopCode className="text-blue-400 text-5xl mr-3" />
                <span className="text-white text-4xl font-extrabold">CodeDuel</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-8 text-center">Forgot Your Password?</h2>
            <p className="text-gray-300 text-center mb-8">
                Enter your email address below and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="sr-only">Email Address</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white text-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Message/Error Display */}
                {message && (
                    <div className="bg-green-700 text-white text-center p-3 rounded-md text-sm">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-700 text-white text-center p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Send Reset Link Button */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center py-3 px-6 bg-blue-600 text-white text-xl font-bold rounded-lg
                                         hover:bg-blue-500 transition-colors duration-300 shadow-lg"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <FaQuestionCircle className="mr-3" />
                    )}
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
            </form>

            {/* Link to Login */}
            <div className="mt-8 text-center text-gray-300">
                <p className="mt-4 text-base">
                    Remembered your password?{' '}
                    <button
                        onClick={() => {
                            if (isLoading) return;
                            if (typeof onNavigateToLogin === 'function') {
                                onNavigateToLogin();
                            } else {
                                // fallback navigation to /login if no callback provided
                                window.location.href = '/login';
                            }
                        }}
                        className="text-blue-400 hover:underline font-semibold"
                        disabled={isLoading}
                    >
                        Login here
                    </button>
                </p>
            </div>
        </div>
    </div>
);
};

export { ForgotPasswordPage as default };