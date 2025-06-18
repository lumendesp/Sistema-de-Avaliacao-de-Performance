const Login = () => {
  return (
    <div className="bg-[#08605F1F] h-screen w-full flex items-center justify-center select-none">
      <div className="bg-white flex w-full max-w-4xl rounded-2xl shadow-xl">
        {/* Lado esquerdo */}
        <div className="bg-white flex flex-col justify-center gap-6 w-1/2 rounded-2xl py-20 px-12">
          <div className="text-center flex flex-col gap-3">
            <p className="text-4xl font-bold text-[#1D1D1D]">Sign In</p>
            <p className="text-sm text-gray-500">Access your performance dashboard</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@email.com"
                className="w-full border-none rounded-md p-3 text-sm focus:outline-none bg-gray-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-sm text-gray-700 block mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full border-none rounded-md p-3 text-sm focus:outline-none bg-gray-100"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-5">
            <p className="text-sm text-gray-500 mt-4">Forgot your password?</p>
            <button className="w-full py-2 bg-[#08605F] text-white font-semibold text-base rounded-md hover:bg-[#05504e] transition-all duration-200">Sign In</button>
          </div>
        </div>

        {/* Lado direito */}
        <div className="w-1/2 bg-[#08605F] text-white flex flex-col justify-center items-center text-center py-20 px-12 rounded-r-2xl rounded-l-[100px] gap-8">
          <p className="text-2xl font-bold mb-2">Welcome to RPE</p>
          <p className="text-sm text-white/80">
            The Rocket Performance & Engagement platform helps you evaluate,
            grow, and recognize the strengths of every collaborator in your
            team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
