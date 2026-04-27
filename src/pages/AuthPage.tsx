import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, Button, Input } from '../components/UI';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onBackClick: () => void;
  isSignUp: boolean;
}

export function AuthPage({ onAuthSuccess, onBackClick, isSignUp }: AuthPageProps) {
  const { signUp, signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await signUp(email, password);

const {
  data: { user },
} = await supabase.auth.getUser();

if (user) {
  await supabase.from("profiles").upsert([
    {
      id: user.id,
      username: username,
      email: email,
    },
  ]);
}
      } else {
        await signIn(email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-3xl shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </h1>
                <p className="text-gray-600">
                  {isSignUp
                    ? 'Save and manage your duty rosters'
                    : 'Access your saved rosters'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
  <Input
    type="text"
    placeholder="Username"
    value={username}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      setUsername(e.target.value)
    }
    disabled={loading}
    required
  />
)}
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />

                {isSignUp && (
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading
                    ? 'Processing...'
                    : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
                </Button>
              </form>

              <Button
                variant="outline"
                onClick={onBackClick}
                disabled={loading}
                className="w-full"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
