const LEVELS = [
  { label: "Sangat lemah", color: "bg-danger", text: "text-danger" },
  { label: "Lemah", color: "bg-danger", text: "text-danger" },
  { label: "Cukup", color: "bg-warning", text: "text-warning" },
  { label: "Kuat", color: "bg-success", text: "text-success" },
  { label: "Sangat kuat", color: "bg-success", text: "text-success" },
];

function score(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const s = score(value);
  const level = LEVELS[s];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= s ? level.color : "bg-default-200"
            }`}
          />
        ))}
      </div>
      <span className={`text-xs ${level.text}`}>Kekuatan: {level.label}</span>
    </div>
  );
}
