'use client';
import { Button } from '@/components/ui/button';
import { removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { LogOut, Package } from 'lucide-react';
export default function Header() {
const router = useRouter();
const handleLogout = () => {
removeToken();
router.push('/login');
};
return (
<header className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-xl font-bold">Supply Chain Dashboard</h1>
        </div>
        <div className="ml-auto">
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
