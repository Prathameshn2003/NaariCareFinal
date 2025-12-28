const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">🚧 Maintenance Mode</h1>
        <p className="text-muted-foreground">
          We are performing system maintenance.<br />
          Please try again later.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
