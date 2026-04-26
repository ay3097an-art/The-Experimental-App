import { motion } from 'framer-motion';
import { Card, CardContent, Button } from '../components/UI';

interface LandingPageProps {
  onGuestClick: () => void;
  onSignUpClick: () => void;
  onSignInClick: () => void;
}

export function LandingPage({
  onGuestClick,
  onSignUpClick,
  onSignInClick
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h1 className="text-5xl font-bold text-black leading-tight">
            Welcome to Duty Roster Manager
          </h1>
          <p className="text-gray-600">
            Built for offices, schools, colleges, hospitals and workplaces to simplify duty roster planning.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Button
              size="lg"
              className="rounded-2xl px-8"
              onClick={onSignUpClick}
            >
              Create Account →
            </Button>
            <Button
  onClick={onSignInClick}
  className="px-6 py-3 border border-black rounded-lg"
>
  Sign In
</Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl px-8"
              onClick={onGuestClick}
            >
              Continue as Guest
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Create an account to save rosters, access them anytime, and get watermarked PDFs.
          </p>
        </motion.div>

        <Card className="rounded-3xl shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-black mb-4">What This App Does</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Create duty rosters with custom shifts</li>
              <li>• Assign members to morning, evening, or night shifts</li>
              <li>• Manage staff and student schedules</li>
              <li>• Download professional PDF rosters</li>
              <li>• Save and organize multiple rosters (with account)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
