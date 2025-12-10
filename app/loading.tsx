import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <div
      className="
        fixed inset-0 
        flex items-center justify-center 
        backdrop-blur-sm 
        bg-white/40
        z-[9999]
      "
    >
      <Loader />
    </div>
  );
}
