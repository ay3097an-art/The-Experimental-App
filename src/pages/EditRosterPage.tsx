import { Card, CardContent, Button } from "../components/UI";

interface EditRosterPageProps {
  roster: any;
  onCancel: () => void;
}

export function EditRosterPage({ roster, onCancel }: EditRosterPageProps) {
  if (!roster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No roster found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <Card>
          <CardContent className="p-6 space-y-4">
            <h1 className="text-3xl font-bold text-black">
              Edit Roster
            </h1>

            <p><strong>Title:</strong> {roster.title}</p>
            <p><strong>Institution:</strong> {roster.institution_name}</p>
            <p><strong>Purpose:</strong> {roster.roster_purpose}</p>
            <p><strong>Group:</strong> {roster.group_name}</p>
            <p><strong>Duty Place:</strong> {roster.place_of_duty}</p>
            <p><strong>Roster No:</strong> {roster.roster_number}</p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="bg-black text-white">
            Confirm Edit
          </Button>

          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

      </div>
    </div>
  );
}