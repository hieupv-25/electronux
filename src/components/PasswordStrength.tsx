"use client";

type Props = {
  password: string;
};

type StrengthLevel = {
  label: string;
  color: string;
  width: string;
};

function getStrength(password: string): { level: StrengthLevel; checks: { label: string; passed: boolean }[] } {
  const checks = [
    { label: "Ít nhất 8 ký tự", passed: password.length >= 8 },
    { label: "Có chữ thường (a-z)", passed: /[a-z]/.test(password) },
    { label: "Có chữ hoa (A-Z)", passed: /[A-Z]/.test(password) },
    { label: "Có số (0-9)", passed: /\d/.test(password) },
    { label: "Có ký tự đặc biệt (!@#$...)", passed: /[^a-zA-Z0-9]/.test(password) },
  ];

  const score = checks.filter((check) => check.passed).length;

  const levels: Record<number, StrengthLevel> = {
    0: { label: "", color: "transparent", width: "0%" },
    1: { label: "Rất yếu", color: "#ef4444", width: "20%" },
    2: { label: "Yếu", color: "#f97316", width: "40%" },
    3: { label: "Trung bình", color: "#eab308", width: "60%" },
    4: { label: "Mạnh", color: "#22c55e", width: "80%" },
    5: { label: "Rất mạnh", color: "#16a34a", width: "100%" },
  };

  return { level: levels[score], checks };
}

export default function PasswordStrength({ password }: Props) {
  if (!password) return null;

  const { level, checks } = getStrength(password);

  return (
    <div className="pw-strength">
      <div className="pw-strength__bar">
        <div
          className="pw-strength__fill"
          style={{
            width: level.width,
            background: level.color,
          }}
        />
      </div>
      <div className="pw-strength__label" style={{ color: level.color }}>
        {level.label}
      </div>

      <div className="pw-strength__checks">
        {checks.map((check) => (
          <div
            key={check.label}
            className={`pw-strength__check${check.passed ? " pw-strength__check--pass" : ""}`}
          >
            {check.passed ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="3">
                <circle cx="12" cy="12" r="8" />
              </svg>
            )}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
