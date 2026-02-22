import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { createClient } from '@/utils/supabase/server';
import { UIProvider } from '@/components/Providers/UIProvider';

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <UIProvider>
            <div className="flex h-screen w-full overflow-hidden">
                <Sidebar user={user} />
                <main className="flex-1 flex flex-col relative h-full z-10 w-full overflow-hidden">
                    <Header />
                    {children}
                </main>
            </div>
        </UIProvider>
    );
}
