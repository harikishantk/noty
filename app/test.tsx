export default function TestPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          ✓ Next.js Project Initialized
        </h1>
        <p className="text-xl text-blue-700 mb-6">
          The Next.js 16.2.4 project is fully operational
        </p>
        <ul className="text-left bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <li className="text-green-600 mb-2">✓ TypeScript configured</li>
          <li className="text-green-600 mb-2">✓ Tailwind CSS installed</li>
          <li className="text-green-600 mb-2">✓ ESLint configured</li>
          <li className="text-green-600 mb-2">✓ Dev server running</li>
          <li className="text-green-600">✓ Build system working</li>
        </ul>
      </div>
    </div>
  );
}
