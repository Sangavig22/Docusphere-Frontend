const AuthPageLayout = ({
  leftContent,
  rightContent,
  leftBg = "bg-[#05152C]",
  rightBg = "bg-white",
  isFixed = false,
  rightScroll = false,
  rightContentClass = "",
}) => {
  if (isFixed) {
    // layout for image-based pages (ForgotPassword, ResetPassword, UpdatePassword)
    return (
      <div className="fixed inset-0 flex flex-col md:flex-row overflow-hidden">
        <div className={`hidden md:flex md:w-1/2 w-full h-full min-h-0 items-center justify-center ${leftBg} relative`}>
          {leftContent}
        </div>

        <div className={`w-full md:w-1/2 h-full min-h-0 flex items-center justify-center p-4 ${rightBg} ${rightScroll ? 'panel-scroll' : ''}`}>
          {rightContent}
        </div>
      </div>
    );
  }

  // layout for SignIn/SignUp
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className={`md:w-1/2 w-full flex items-center justify-center ${leftBg} py-12 md:py-0`}>
        <div className="max-w-md text-center px-6">
          {leftContent}
        </div>
      </div>

      <div className={`md:w-1/2 w-full flex items-center justify-center ${rightBg} ${rightScroll ? 'panel-scroll' : ''} py-6 md:py-0`}>
        <div className={`w-full flex flex-col items-center justify-start md:justify-center p-6 ${rightContentClass}`}>
          {rightContent}
        </div>
      </div>
    </div>
  );
};

export default AuthPageLayout;
