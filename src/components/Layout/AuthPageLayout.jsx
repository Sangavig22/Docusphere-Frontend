const AuthPageLayout = ({
  leftContent,
  rightContent,
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="md:w-1/2 w-full flex items-center justify-center bg-[#05152C] py-12 md:py-0">
        <div className="max-w-md text-center px-6">
          {leftContent}
        </div>
      </div>

      <div className="md:w-1/2 w-full flex items-center justify-center bg-white py-6 md:py-0">
        <div className="w-full flex flex-col items-center justify-start md:justify-center p-6">
          {rightContent}
        </div>
      </div>
    </div>
  );
};

export default AuthPageLayout;
