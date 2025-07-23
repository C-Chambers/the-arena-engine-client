'use client';

import ActiveTeamDisplay from '../../components/ActiveTeamDisplay';
import PlayerRankDisplay from '../../components/PlayerRankDisplay'; // Import the new component

export default function DashboardPage() {
  return (
    <div className="flex h-full gap-8">
      {/* Left Column: Main Actions */}
      <div className="w-2/3 flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Main Menu</h1>
          <p className="text-gray-400 mt-2">
            View your active team below or select an option from the sidebar. Press "Play" to find a match.
          </p>
        </div>
        <div className="flex-grow">
          <ActiveTeamDisplay />
        </div>
      </div>

      {/* Right Column: Player Stats */}
      <div className="w-1/3">
        <PlayerRankDisplay />
      </div>
    </div>
  );
}
