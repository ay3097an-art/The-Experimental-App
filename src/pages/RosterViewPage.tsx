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

  const finalRosterData = roster.final_roster_data || [];

  const tableHeaders =
    finalRosterData.length > 0
      ? Object.keys(finalRosterData[0])
      : [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Final Saved Roster
            </h2>

            {finalRosterData.length === 0 ? (
              <p>No saved roster table found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead>
                    <tr>
                      {tableHeaders.map((header) => (
                        <th
                          key={header}
                          className="border p-2 bg-gray-100"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {finalRosterData.map((row: any, index: number) => (
                      <tr key={index}>
                        {tableHeaders.map((header) => (
                          <td
                            key={header}
                            className="border p-2 text-center"
                          >
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-4 pt-6">
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