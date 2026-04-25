import Image from "next/image";
import heroBg from "@/assets/imgs/landing/hero-bg.png";

export default function HeroBg() {
  return (
    <div className="absolute inset-0 w-full h-200 z-10">
      <Image
        src={heroBg}
        alt=""
        fill
        className="block w-full h-full object-cover"
        priority
      />
    </div>
  );
}