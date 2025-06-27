import Login from "./components/login";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-row items-center justify-center bg-gray-900 bg-[url('https://placehold.co/1920x1080/0a0a0a/0a0a0a?text=.')] bg-cover bg-center">
      {/* Left Side: Game Logo and Title */}
      <div className="w-1/2 flex flex-col items-center justify-center text-center px-12">
        <h1 className="text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          The Arena Engine
        </h1>
        <p className="text-xl text-gray-300">
          Forge your legacy in the ultimate turn-based strategy arena.
        </p>
      </div>

      {/* Right Side: Login Component */}
      <div className="w-1/2 flex items-center justify-center">
        <Login />
      </div>
    </main>
  );
}
