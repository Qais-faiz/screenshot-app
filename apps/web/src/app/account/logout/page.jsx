import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <>
      {/* Google Fonts import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7] dark:from-[#1A1A1A] dark:to-[#0F0F0F] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img
                src="https://www.create.xyz/images/logoipsum/224"
                alt="Logo"
                className="h-10 w-10"
              />
              <span
                className="text-[#121212] dark:text-white text-xl font-semibold"
                style={{
                  fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
                }}
              >
                DesignCraft
              </span>
            </div>
          </div>

          {/* Sign Out Card */}
          <div
            className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 shadow-lg border border-[#E0E0E0] dark:border-[#404040]"
            style={{
              fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
            }}
          >
            <h1 className="text-2xl font-semibold text-[#121212] dark:text-white text-center mb-6">
              Sign Out
            </h1>

            <p className="text-[#555555] dark:text-[#C0C0C0] text-center mb-8">
              Are you sure you want to sign out of your account?
            </p>

            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="w-full py-3 px-6 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-semibold rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
              >
                Sign Out
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full py-3 px-6 bg-[#FAF9F7] dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#404040] text-[#121212] dark:text-white font-semibold rounded-2xl hover:bg-[#F0F0F0] dark:hover:bg-[#333333] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
