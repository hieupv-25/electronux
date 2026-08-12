import Image from "next/image";

type Service = {
  icon: string;
  text: string;
};

type ServiceBannerProps = {
  services: Service[];
};

export default function ServiceBanner({ services }: ServiceBannerProps) {
  return (
    <div style={{ background: "var(--elx-navy)", color: "#fff" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {services.map((s, i) => (
          <a
            key={i}
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 30px",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            <Image src={s.icon} alt={s.text} width={32} height={32} /> {s.text}
          </a>
        ))}
      </div>
    </div>
  );
}
