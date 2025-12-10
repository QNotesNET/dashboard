type LoaderProps = {
  small?: boolean;
  label?: string;
};

export default function Loader({ small = false, label }: LoaderProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src="/images/icons/loader.png"
        alt="Powrbook Logo"
        className={`${small ? "w-8 h-8" : "w-14 h-14"} animate-pulse`}
      />

      {/* Label nur anzeigen, wenn vorhanden */}
      {label && (
        <p className={`text-neutral-600 ${small ? "text-xs" : "text-sm"}`}>
          {label}
        </p>
      )}
    </div>
  );
}
