export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          HomeMore
        </h1>
        <p className="text-2xl text-center text-muted-foreground max-w-2xl">
          More than renting. More confidence. More comfort. More home.
        </p>
        <div className="flex gap-4 mt-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-2">🏠 For Tenants</h3>
            <p className="text-muted-foreground">
              Find your perfect home with verified listings, transparent
              pricing, and secure payments.
            </p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-2">🔑 For Landlords</h3>
            <p className="text-muted-foreground">
              List your property, screen tenants, and manage rentals with ease
              and security.
            </p>
          </div>
        </div>
        <div className="mt-8 p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground text-center">
            🚧 Platform under development - Phase 0 Week 2: Development
            Environment
          </p>
        </div>
      </div>
    </main>
  );
}
