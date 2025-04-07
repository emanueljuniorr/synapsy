import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout; 