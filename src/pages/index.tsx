import CreateLinkForm from "@/components/create-link";
import { useMounted } from "@/hooks/use-mounted";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const mounted = useMounted();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-950 text-white">
      {mounted ? <CreateLinkForm /> : <h1>Loading...</h1>}
    </div>
  );
};

export default Home;
