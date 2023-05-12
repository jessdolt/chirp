import { SignIn } from "@clerk/nextjs";

const index = () => {
  return <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />;
};

export default index;
