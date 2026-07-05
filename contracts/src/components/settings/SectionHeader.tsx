interface SectionHeaderProps {
  title: string;
  destructive?: boolean;
}

export default function SectionHeader({ title, destructive = false }: SectionHeaderProps) {
  return (
    <h3
      className={`text-[11px] font-semibold uppercase tracking-[0.05em] px-1 mb-3 mt-6 ${
        destructive ? 'text-softRed' : 'text-mediumGray'
      }`}
    >
      {title}
    </h3>
  );
}
