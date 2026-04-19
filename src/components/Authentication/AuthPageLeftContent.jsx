// Single component with both heading and subheading
const AuthPageLeftContent = ({ heading, subheading }) => {
  return (
    <>
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 mt-3">
        {heading}
      </h1>
      <p className="text-white text-lg md:text-2xl font-medium leading-relaxed mb-8">
        {subheading}
      </p>
    </>
  );
};

export default AuthPageLeftContent;
