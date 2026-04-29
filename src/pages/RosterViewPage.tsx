import { Card, CardContent, Button } from "../components/UI";

interface RosterViewPageProps {
  roster: any;
  onReturnDashboard: () => void;
}

export function RosterViewPage({
  roster,
  onReturnDashboard,
}: RosterViewPageProps) {
  if (!roster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No roster found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <Card>
          <CardContent className="p-6 space-y-4">
            <h1 className="text-3xl font-bold text-black">
              Roster Preview
            </h1>

            <p><strong>Roster Title:</strong> {roster.title}</p>
            <p><strong>Institution:</strong> {roster.institution_name}</p>
            <p><strong>Roster Purpose:</strong> {roster.roster_purpose}</p>
            <p><strong>Place of Duty:</strong> {roster.place_of_duty}</p>
            <p><strong>Group Name:</strong> {roster.group_name}</p>
            <p><strong>Roster Number:</strong> {roster.roster_number}</p>
            <p>
              <strong>Created On:</strong>{" "}
              {new Date(roster.created_at).toLocaleDateString("en-GB")}
            </p>

            <div className="flex gap-4 pt-4">
              <Button onClick={onReturnDashboard}>
                Return to Dashboard
              </Button>

              <Button variant="outline">
                Print PDF
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}