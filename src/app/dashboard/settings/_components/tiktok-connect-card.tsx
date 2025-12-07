'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading';
import { TikTokIntegration } from '@/types';
import { disconnectTikTok } from '../actions';
import { Link2, Plug, Unplug } from 'lucide-react';

interface Props {
  integration: TikTokIntegration | null;
}

export function TikTokConnectCard({ integration }: Props) {
  const [isPending, startTransition] = useTransition();
  const connected = Boolean(integration);

  const handleDisconnect = () => {
    startTransition(async () => {
      const res = await disconnectTikTok();
      if (res.success) {
        toast.success('TikTok Shop terputus');
      } else {
        toast.error(res.error || 'Gagal memutuskan TikTok');
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5" />
          Integrasi TikTok Shop
        </CardTitle>
        <CardDescription>
          Hubungkan toko Anda untuk sinkronisasi produk dan stok ke TikTok Shop.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span>Status:</span>
          {connected ? (
            <Badge>Tersambung</Badge>
          ) : (
            <Badge className="bg-muted text-foreground">Belum tersambung</Badge>
          )}
        </div>
        {connected && (
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Shop ID</p>
                <p className="text-muted-foreground">{integration?.shopId}</p>
              </div>
              {integration?.accessTokenExpiry && (
                <p className="text-xs text-muted-foreground">
                  Token kadaluarsa: {new Date(integration.accessTokenExpiry).toLocaleString()}
                </p>
              )}
            </div>
            {integration?.scopes && (
              <p className="mt-2 text-xs text-muted-foreground">Scopes: {integration.scopes}</p>
            )}
          </div>
        )}
        <Separator />
        <p className="text-xs text-muted-foreground">
          Langkah cepat: klik hubungkan, login seller TikTok, lalu izinkan akses produk & stok. Kami menyimpan token secara aman di server.
        </p>
      </CardContent>
      <CardFooter className="flex items-center gap-3">
        {connected ? (
          <Button variant="outline" onClick={handleDisconnect} disabled={isPending}>
            {isPending && <LoadingSpinner className="mr-2" size="sm" />}
            <Unplug className="mr-2 h-4 w-4" />
            Putuskan
          </Button>
        ) : (
          <Button asChild>
            <Link href="/api/tiktok/authorize">
              <Link2 className="mr-2 h-4 w-4" />
              Hubungkan TikTok Shop
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
