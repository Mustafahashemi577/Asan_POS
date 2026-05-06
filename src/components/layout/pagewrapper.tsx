// components/layout/PageWrapper.tsx

interface Props {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: Props) {
  return (
    <div className="min-h-screen bg-white rounded-b-xl overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {children}
      </div>
    </div>
  );
}
