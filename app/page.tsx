import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import { title } from "@/components/primitives";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen w-full">
      <Navbar />
      <section className="flex flex-col justify-center items-center h-[80vh]">
        <div className="max-w-xl text-center mt-8">
          <span className={title()}>Aplikasi&nbsp;</span>
          <span className={title({ color: "violet" })}>CRUD&nbsp;</span>
          <br />
          <span className={title()}>untuk pencatatan inventory.</span>
        </div>
        <div className="mt-6">
          <Link
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
            href="/dashboard"
          >
            Pergi Ke Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
