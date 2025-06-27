'use client';

// A component to display the player's three active characters.
// For now, it will just show placeholder slots.

export default function ActiveTeamDisplay() {
  // In the future, this component will take the player's team as a prop.
  const mockTeam = [null, null, null];

  return (
    <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-300 mb-4">Your Active Team</h2>
      <div className="flex justify-center gap-6">
        {mockTeam.map((character, index) => (
          <div key={index} className="w-40 h-56 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500">
            {/* Placeholder for character portrait */}
            <div className="w-32 h-32 bg-gray-700 rounded-md mb-2">[Portrait]</div>
            <p className="font-semibold">Empty Slot</p>
          </div>
        ))}
      </div>
    </div>
  );
}
